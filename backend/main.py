import os
import shutil
import uuid
import mimetypes
import hashlib
import re
import random
import smtplib
import json
from email.mime.text import MIMEText
from typing import List, Optional
from datetime import datetime, timedelta

# Fix passlib/bcrypt compatibility
import bcrypt
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (object,), {"__version__": bcrypt.__version__})

from passlib.context import CryptContext
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from sqlalchemy import or_

import models, schemas, database
from database import engine, get_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Security
SECRET_KEY = "zenith-secure-core-2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zenith-Cloud")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helpers ---

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_setting(db: Session, key: str):
    s = db.query(models.Setting).filter(models.Setting.key == key).first()
    return s.value if s else ""

def send_otp_email(target_email: str, otp_code: str, db: Session):
    server_host = get_setting(db, "smtp_server")
    server_port = get_setting(db, "smtp_port")
    user = get_setting(db, "smtp_user")
    password = get_setting(db, "smtp_password")

    if not user or not password:
        print(f"\n\n[ZENITH SECURITY] SMTP NOT CONFIGURED. OTP for {target_email} is: {otp_code}\n\n")
        return

    msg = MIMEText(f"Your Zenith-Cloud verification code is: {otp_code}")
    msg['Subject'] = 'Zenith Security Access'
    msg['From'] = user
    msg['To'] = target_email
    try:
        port = int(server_port) if server_port else 587
        with smtplib.SMTP(server_host or "smtp.gmail.com", port) as server:
            server.starttls()
            server.login(user, password)
            server.send_message(msg)
    except Exception as e:
        print(f"Email Error: {e}")
        print(f"\n\n[ZENITH SECURITY] CRITICAL: EMAIL FAILED. OTP IS: {otp_code}\n\n")

def is_valid_email(email: str):
    return email.lower().endswith("@gmail.com")

def is_valid_handle(h: str):
    return 3 <= len(h) <= 20 and re.match("^[a-zA-Z0-9_-]*$", h)

# --- Auth Helpers ---

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise HTTPException(401)
    except JWTError: raise HTTPException(401)
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None: raise HTTPException(401)
    return user

async def get_user_flexible(token: Optional[str] = None, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    actual_token = token
    if authorization and authorization.startswith("Bearer "):
        actual_token = authorization.split(" ")[1]
    
    if not actual_token: raise HTTPException(401)
    try:
        payload = jwt.decode(actual_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise HTTPException(401)
    except: raise HTTPException(401)
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None: raise HTTPException(401)
    return user

async def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_admin: raise HTTPException(403)
    return current_user

# --- Startup & Admin ---

@app.on_event("startup")
def startup_populate():
    db = next(get_db())
    try: db.execute("PRAGMA integrity_check")
    except Exception as e: print(f"DB Error: {e}")
        
    admin = db.query(models.User).filter(models.User.username == "cloudadmin").first()
    if not admin:
        admin = models.User(
            username="cloudadmin", handle="admin-node", email="admin@gmail.com",
            password_hash=get_password_hash("StrongAdminPass123!"),
            is_admin=True, is_verified=True, storage_limit=0, social_links="{}"
        )
        db.add(admin)

    defaults = {
        "app_name": "Zenith",
        "registration_enabled": "true",
        "storage_base_path": "",
        "smtp_server": "smtp.gmail.com",
        "smtp_port": "587",
        "smtp_user": "",
        "smtp_password": ""
    }
    for k, v in defaults.items():
        if not db.query(models.Setting).filter(models.Setting.key == k).first():
            db.add(models.Setting(key=k, value=v))
    db.commit()

@app.post("/api/files/mkdir")
def create_folder(path: str=Form(...), name: str=Form(...), u: models.User=Depends(get_current_user), db: Session=Depends(get_db)):
    fp = get_full_path(db, path, u)
    if not fp or not os.path.isdir(fp): raise HTTPException(400, "Invalid parent path")
    new_dir = os.path.join(fp, name)
    try:
        os.makedirs(new_dir, exist_ok=True)
        return {"ok": True}
    except: raise HTTPException(403, "Permission Denied")

@app.get("/api/config")
def get_public_config(db: Session=Depends(get_db)):
    return {
        "app_name": get_setting(db, "app_name") or "Zenith",
        "registration_enabled": get_setting(db, "registration_enabled") == "true"
    }

@app.get("/api/admin/settings")
def get_settings(adm: models.User=Depends(get_admin_user), db: Session=Depends(get_db)):
    settings = db.query(models.Setting).all()
    return {s.key: s.value for s in settings}

@app.post("/api/admin/settings")
def update_settings(data: dict = Body(...), adm: models.User=Depends(get_admin_user), db: Session=Depends(get_db)):
    for k, v in data.items():
        s = db.query(models.Setting).filter(models.Setting.key == k).first()
        if s: s.value = str(v).lower()
        else: db.add(models.Setting(key=k, value=str(v).lower()))
    db.commit(); return {"ok": True}

@app.get("/api/admin/users", response_model=List[schemas.User])
def list_users(adm: models.User=Depends(get_admin_user), db: Session=Depends(get_db)): return db.query(models.User).all()

@app.post("/api/admin/users/update")
def update_user_admin(
    user_id: int = Body(...), storage_limit: Optional[int] = Body(None), 
    password: Optional[str] = Body(None), is_admin: Optional[bool] = Body(None),
    adm: models.User=Depends(get_admin_user), db: Session=Depends(get_db)
):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if u:
        if password: u.password_hash = get_password_hash(password)
        if storage_limit is not None: u.storage_limit = storage_limit
        if is_admin is not None and u.username != "cloudadmin": u.is_admin = is_admin
        db.commit()
    return {"ok": True}

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, adm: models.User=Depends(get_admin_user), db: Session=Depends(get_db)):
    u = db.query(models.User).filter(models.User.id == user_id).first()
    if u and u.username != "cloudadmin": db.delete(u); db.commit()
    return {"ok": True}

# --- Auth ---

@app.get("/api/users/search", response_model=List[schemas.User])
def search_users(q: str, db: Session = Depends(get_db)):
    query = q.lstrip("@")
    return db.query(models.User).filter(or_(models.User.username.contains(query), models.User.handle.contains(query))).all()

@app.post("/api/auth/register")
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if get_setting(db, "registration_enabled") == "false": raise HTTPException(403, "Registration disabled")
    if not user_in.email.lower().endswith("@gmail.com"): raise HTTPException(400, "Gmail only")
    if db.query(models.User).filter((models.User.username == user_in.username) | (models.User.email == user_in.email)).first():
        raise HTTPException(400, "User exists")
    if user_in.handle and not is_valid_handle(user_in.handle): raise HTTPException(400, "Invalid Handle")

    otp = str(random.randint(100000, 999999))
    u = models.User(
        username=user_in.username, handle=user_in.handle or f"node-{uuid.uuid4().hex[:8]}",
        email=user_in.email, password_hash=get_password_hash(user_in.password), 
        storage_limit=10240, otp_code=otp, otp_expiry=datetime.utcnow()+timedelta(minutes=10), social_links="{}"
    )
    db.add(u); db.commit(); db.refresh(u)

    # Auto-Provision Storage Node if base path is set
    base_path = get_setting(db, "storage_base_path")
    if base_path and os.path.isdir(base_path):
        user_dir = os.path.join(base_path, u.username)
        try:
            os.makedirs(user_dir, exist_ok=True)
            root = models.StorageRoot(name="Home", path=user_dir, user_id=u.id)
            db.add(root); db.commit()
        except: pass

    send_otp_email(user_in.email, otp, db)
    return {"ok": True}

@app.post("/api/auth/verify")
def verify_otp(data: schemas.OTPVerify, db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.email == data.email).first()
    if not u or u.otp_code != data.code: raise HTTPException(400, "Invalid")
    u.is_verified = True; u.otp_code = None; db.commit()
    return {"ok": True}

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    u = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not u or not verify_password(form_data.password, u.password_hash) or not u.is_verified: raise HTTPException(401)
    return {"access_token": create_access_token({"sub": u.username}), "token_type": "bearer"}

@app.get("/api/auth/me", response_model=schemas.User)
def get_me(u: models.User = Depends(get_current_user)): return u

@app.post("/api/auth/profile")
def update_profile(
    bio: Optional[str]=Form(None), socials: Optional[str]=Form(None), 
    handle: Optional[str]=Form(None), pfp: Optional[UploadFile]=File(None), 
    u: models.User=Depends(get_current_user), db: Session=Depends(get_db)
):
    if bio is not None: u.bio = bio
    if socials is not None: u.social_links = socials
    if handle is not None:
        if not is_valid_handle(handle): raise HTTPException(400, "Invalid Handle")
        if db.query(models.User).filter(models.User.handle == handle, models.User.id != u.id).first(): raise HTTPException(400, "Taken")
        u.handle = handle
    if pfp:
        os.makedirs("static/pfps", exist_ok=True)
        fname = f"{u.id}_{uuid.uuid4().hex}{os.path.splitext(pfp.filename)[1]}"
        with open(f"static/pfps/{fname}", "wb") as f: shutil.copyfileobj(pfp.file, f)
        u.pfp_url = f"/static/pfps/{fname}"
    db.commit(); return {"ok": True}

# --- Storage & Files ---

@app.get("/api/storage-roots", response_model=List[schemas.StorageRoot])
def get_roots(u: models.User=Depends(get_current_user), db: Session=Depends(get_db)):
    if u.is_admin: return db.query(models.StorageRoot).all()
    return db.query(models.StorageRoot).filter(models.StorageRoot.user_id == u.id).all()

@app.post("/api/storage-roots")
def add_root(name: str=Form(...), path: str=Form(...), u: models.User=Depends(get_current_user), db: Session=Depends(get_db)):
    # Cross-platform path normalization
    cp = os.path.normpath(path)
    if not os.path.isabs(cp):
        # Handle cases like "C:" on Windows
        if len(cp) == 2 and cp[1] == ":": cp += os.sep
    
    if not os.path.isdir(cp): 
        raise HTTPException(400, f"Hardware path unreachable or invalid: {cp}")
        
    root = models.StorageRoot(name=name, path=cp, user_id=u.id)
    db.add(root); db.commit(); return {"ok": True}

@app.delete("/api/storage-roots/{rid}")
def delete_root(rid: int, u: models.User=Depends(get_current_user), db: Session=Depends(get_db)):
    root = db.query(models.StorageRoot).filter(models.StorageRoot.id == rid).first()
    if root and (u.is_admin or root.user_id == u.id): db.delete(root); db.commit()
    return {"ok": True}

def get_full_path(db: Session, rel: str, u: models.User):
    # Normalize relative path input
    clean_rel = rel.replace("\\", "/").strip("/")
    parts = clean_rel.split("/")
    if not parts or not parts[0]: return None
    
    root = db.query(models.StorageRoot).filter(models.StorageRoot.name == parts[0]).first()
    if not root or (not u.is_admin and root.user_id != u.id): return None
    
    # Securely join sub-paths
    return os.path.abspath(os.path.join(root.path, *parts[1:]))

@app.get("/api/files/list")
def list_files(path: str="", u: models.User=Depends(get_current_user), db: Session=Depends(get_db)):
    if not path:
        roots = db.query(models.StorageRoot).all() if u.is_admin else db.query(models.StorageRoot).filter(models.StorageRoot.user_id == u.id).all()
        return [{"name": r.name, "path": r.name, "is_dir": True, "size": 0} for r in roots]
    fp = get_full_path(db, path, u)
    if not fp or not os.path.isdir(fp): return []
    res = []
    try:
        for item in os.listdir(fp):
            ip = os.path.join(fp, item)
            try:
                st = os.stat(ip); is_dir = os.path.isdir(ip)
                res.append({"name": item, "path": f"{path}/{item}", "is_dir": is_dir, "size": st.st_size, "mime_type": mimetypes.guess_type(ip)[0] or ("dir" if is_dir else "file")})
            except: pass
    except: pass
    return res

@app.get("/api/files/download")
def download_file(path: str, token: Optional[str] = None, db: Session = Depends(get_db), user: models.User = Depends(get_user_flexible)):
    fp = get_full_path(db, path, user)
    if not fp or not os.path.isfile(fp): raise HTTPException(404)
    return FileResponse(fp, filename=os.path.basename(fp))

@app.post("/api/files/upload")
async def upload_file(path: str, file: UploadFile=File(...), u: models.User=Depends(get_current_user), db: Session=Depends(get_db)):
    fp = get_full_path(db, path, u)
    if not fp or not os.path.isdir(fp): raise HTTPException(400)
    with open(os.path.join(fp, file.filename), "wb") as f: shutil.copyfileobj(file.file, f)
    return {"ok": True}

@app.delete("/api/files/delete")
def delete_file(path: str, u: models.User=Depends(get_current_user), db: Session=Depends(get_db)):
    if "/" not in path: raise HTTPException(403)
    fp = get_full_path(db, path, u)
    if not fp: raise HTTPException(404)
    try:
        if os.path.isdir(fp): shutil.rmtree(fp)
        else: os.remove(fp)
    except: raise HTTPException(403)
    return {"ok": True}

# --- Sharing & Streaming ---

@app.post("/api/share")
def create_share(file_path: str=Form(...), password: Optional[str]=Form(None), expires_days: Optional[int]=Form(None), max_uses: int=Form(0), u: models.User=Depends(get_current_user), db: Session=Depends(get_db)):
    sid = str(uuid.uuid4())
    expiry = datetime.utcnow() + timedelta(days=expires_days) if expires_days else None
    pwd = hashlib.sha256(password.encode()).hexdigest() if password else None
    s = models.ShareLink(id=sid, file_path=file_path, password_hash=pwd, expires_at=expiry, user_id=u.id, max_uses=max_uses)
    db.add(s); db.commit(); return {"id": sid}

@app.get("/api/share/{sid}/info")
def get_share_info(sid: str, db: Session=Depends(get_db)):
    s = db.query(models.ShareLink).filter(models.ShareLink.id == sid).first()
    if not s or (s.expires_at and s.expires_at < datetime.utcnow()): raise HTTPException(404)
    if s.max_uses > 0 and s.access_count >= s.max_uses: raise HTTPException(410, "Exhausted")
    u = db.query(models.User).filter(models.User.id == s.user_id).first()
    return {"filename": os.path.basename(s.file_path), "needs_password": bool(s.password_hash), "username": u.username, "handle": u.handle, "pfp": u.pfp_url, "bio": u.bio, "socials": u.social_links, "views": s.access_count}

@app.post("/api/share/{sid}/download")
def download_shared(sid: str, password: Optional[str]=Form(None), db: Session=Depends(get_db)):
    s = db.query(models.ShareLink).filter(models.ShareLink.id == sid).first()
    if not s or (s.expires_at and s.expires_at < datetime.utcnow()): raise HTTPException(404)
    if s.max_uses > 0 and s.access_count >= s.max_uses: raise HTTPException(410)
    if s.password_hash and (not password or hashlib.sha256(password.encode()).hexdigest() != s.password_hash): raise HTTPException(403)
    parts = s.file_path.strip("/").split("/")
    root = db.query(models.StorageRoot).filter(models.StorageRoot.name == parts[0], models.StorageRoot.user_id == s.user_id).first()
    if not root: raise HTTPException(404)
    fp = os.path.join(root.path, *parts[1:])
    s.access_count += 1; db.commit(); return FileResponse(fp)

@app.get("/api/media/stream")
def stream_media(path: str, token: str, range: Optional[str]=None, db: Session=Depends(get_db)):
    try:
        username = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]).get("sub")
        if not username: raise HTTPException(401)
    except: raise HTTPException(401)
    u = db.query(models.User).filter(models.User.username == username).first()
    if not u: raise HTTPException(401)
    fp = get_full_path(db, path, u)
    if not fp or not os.path.exists(fp): raise HTTPException(404)
    size = os.path.getsize(fp); mime, _ = mimetypes.guess_type(fp)
    if not range: return FileResponse(fp, media_type=mime)
    try:
        start, end = range.replace("bytes=", "").split("-")
        start = int(start); end = int(end) if end else size - 1
    except: start = 0; end = size - 1
    def iter_f():
        with open(fp, "rb") as f:
            f.seek(start); yield f.read(end - start + 1)
    return StreamingResponse(iter_f(), status_code=206, headers={"Content-Range": f"bytes {start}-{end}/{size}", "Accept-Ranges": "bytes", "Content-Length": str(end - start + 1)}, media_type=mime)

os.makedirs("static/pfps", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
