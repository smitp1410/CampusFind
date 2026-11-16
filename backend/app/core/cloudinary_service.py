import time
import hashlib
import os
import uuid
import base64
from typing import Dict, Any, Optional
from app.core.config import settings

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB

def is_cloudinary_configured() -> bool:
    return bool(
        settings.CLOUDINARY_CLOUD_NAME 
        and settings.CLOUDINARY_API_KEY 
        and settings.CLOUDINARY_API_SECRET
    )

def validate_image_file(filename: str, content_length: int) -> bool:
    if content_length > MAX_FILE_SIZE_BYTES:
        return False
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_EXTENSIONS

def generate_signed_upload_params(folder: str = "campusfind/items") -> Dict[str, Any]:
    """Generates signature and parameters for secure direct client-side uploads to Cloudinary."""
    timestamp = int(time.time())
    if not is_cloudinary_configured():
        return {
            "configured": False,
            "message": "Cloudinary credentials not set in environment. Using direct backend upload fallback.",
            "timestamp": timestamp,
            "folder": folder
        }
    
    # Cloudinary requires parameters sorted alphabetically
    params_to_sign = f"folder={folder}&timestamp={timestamp}{settings.CLOUDINARY_API_SECRET}"
    signature = hashlib.sha1(params_to_sign.encode("utf-8")).hexdigest()
    
    return {
        "configured": True,
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
        "api_key": settings.CLOUDINARY_API_KEY,
        "timestamp": timestamp,
        "folder": folder,
        "signature": signature
    }

def upload_image_bytes(file_bytes: bytes, filename: str, folder: str = "campusfind/items") -> Dict[str, str]:
    """
    Uploads image to Cloudinary if configured; otherwise saves to local upload directory
    or returns a robust data URI.
    """
    if is_cloudinary_configured():
        try:
            import cloudinary
            import cloudinary.uploader
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )
            upload_result = cloudinary.uploader.upload(
                file_bytes,
                folder=folder,
                resource_type="image",
                transformation=[
                    {"width": 1200, "height": 1200, "crop": "limit"},
                    {"quality": "auto"},
                    {"fetch_format": "auto"}
                ]
            )
            return {
                "url": upload_result.get("secure_url") or upload_result.get("url"),
                "public_id": upload_result.get("public_id")
            }
        except Exception as e:
            print(f"Cloudinary upload error: {e}. Falling back to local storage.")

    # Local fallback for development/demo without active Cloudinary account
    uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static_uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    unique_id = f"{uuid.uuid4().hex[:12]}_{filename}"
    file_path = os.path.join(uploads_dir, unique_id)
    with open(file_path, "wb") as f:
        f.write(file_bytes)
        
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else "jpeg"
    mime = f"image/{ext}" if ext != "jpg" else "image/jpeg"
    
    # Return local relative URL or fallback data URI for testing
    return {
        "url": f"/api/v1/items/media/{unique_id}",
        "public_id": f"local_{unique_id}"
    }
