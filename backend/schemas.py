from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    handle: Optional[str] = None
    email: str
    is_admin: bool = False
    is_verified: bool = False
    storage_limit: int = 10240
    pfp_url: Optional[str] = None
    social_links: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    storage_limit: Optional[int] = None
    handle: Optional[str] = None

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class OTPVerify(BaseModel):
    email: str
    code: str

class StorageRootBase(BaseModel):
    name: str
    path: str
    user_id: Optional[int] = None

class StorageRootCreate(StorageRootBase):
    pass

class StorageRoot(StorageRootBase):
    id: int

    class Config:
        from_attributes = True

class ShareLinkBase(BaseModel):
    file_path: str
    password: Optional[str] = None
    expires_at: Optional[datetime] = None

class ShareLinkCreate(ShareLinkBase):
    pass

class ShareLink(BaseModel):
    id: str
    file_path: str
    password_hash: Optional[str] = None
    expires_at: Optional[datetime] = None
    created_at: datetime
    user_id: Optional[int] = None
    max_uses: int = 0
    access_count: int = 0

    class Config:
        from_attributes = True

class MediaMetadata(BaseModel):
    id: int
    file_path: str
    title: str
    poster_url: Optional[str] = None
    rating: Optional[str] = None
    description: Optional[str] = None
    year: Optional[int] = None

    class Config:
        from_attributes = True

class SettingBase(BaseModel):
    key: str
    value: str

class SettingCreate(SettingBase):
    pass

class Setting(SettingBase):
    id: int

    class Config:
        from_attributes = True

class FileInfo(BaseModel):
    name: str
    path: str
    is_dir: bool
    size: int
    modified_at: float
    mime_type: Optional[str] = None
