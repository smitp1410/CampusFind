from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.items import router as items_router
from app.api.v1.categories import router as categories_router
from app.api.v1.locations import router as locations_router
from app.api.v1.matching import router as matching_router
from app.api.v1.claims import router as claims_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin import router as admin_router
from app.api.v1.analytics import router as analytics_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(items_router)
api_router.include_router(categories_router)
api_router.include_router(locations_router)
api_router.include_router(matching_router)
api_router.include_router(claims_router)
api_router.include_router(notifications_router)
api_router.include_router(admin_router)
api_router.include_router(analytics_router)
