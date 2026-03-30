from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    handle = Column(String, unique=True, index=True, nullable=True) # Unique ID for searching
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    is_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    storage_limit = Column(Integer, default=10240) # Default 10GB in MB
    otp_code = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)
    pfp_url = Column(String, nullable=True)
    social_links = Column(String, nullable=True) # JSON string
    bio = Column(String, nullable=True)

class StorageRoot(Base):
    __tablename__ = "storage_roots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    path = Column(String, unique=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(String, primary_key=True, index=True) # UUID
    file_path = Column(String, index=True)
    password_hash = Column(String, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    max_uses = Column(Integer, default=0) # 0 = unlimited
    access_count = Column(Integer, default=0)
    shared_with = Column(String, nullable=True) # UUID or Email

class MediaMetadata(Base):
    __tablename__ = "media_metadata"

    id = Column(Integer, primary_key=True, index=True)
    file_path = Column(String, index=True, unique=True)
    title = Column(String)
    poster_url = Column(String, nullable=True)
    rating = Column(String, nullable=True)
    description = Column(String, nullable=True)
    year = Column(Integer, nullable=True)

class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)
