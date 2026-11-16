from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class PlatformStatsResponse(BaseModel):
    total_users: int
    total_lost_items: int
    total_found_items: int
    total_recovered_items: int
    recovery_rate_percentage: float
    active_matches_count: int
    pending_claims_count: int
    recent_activity_count: int

class CategoryBreakdownItem(BaseModel):
    category_id: int
    category_name: str
    icon: Optional[str] = "tag"
    lost_count: int
    found_count: int
    recovered_count: int

class LocationHotspotItem(BaseModel):
    location_id: int
    building_name: str
    campus_name: str
    total_reports: int

class AdminDashboardAnalytics(BaseModel):
    stats: PlatformStatsResponse
    category_breakdown: List[CategoryBreakdownItem]
    location_hotspots: List[LocationHotspotItem]
    monthly_trend: List[Dict[str, Any]]
