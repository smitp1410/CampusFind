export type UserRole = 'student' | 'faculty' | 'admin' | 'super_admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  student_faculty_id?: string;
  role: UserRole;
  department?: string;
  phone?: string;
  is_verified: boolean;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  created_at: string;
}

export interface Location {
  id: number;
  campus_name: string;
  building_name: string;
  zone_code?: string;
  description?: string;
  created_at: string;
}

export interface ItemImage {
  id: number;
  image_url: string;
  public_id?: string;
  is_primary: boolean;
  created_at: string;
}

export type ItemType = 'LOST' | 'FOUND';
export type ItemStatus = 'PENDING' | 'OPEN' | 'VERIFIED' | 'MATCHED' | 'CLAIMED' | 'RESOLVED' | 'REJECTED' | 'CLOSED';

export interface Item {
  id: number;
  type: ItemType;
  title: string;
  category_id: number;
  description: string;
  color: string;
  brand?: string;
  date_occurred: string;
  location_id: number;
  specific_location?: string;
  floor?: string;
  identifying_details?: string;
  storage_location?: string;
  status: ItemStatus;
  reporter_id: number;
  is_sensitive: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  location?: Location;
  reporter?: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
  images: ItemImage[];
  claims?: Array<{ id: number; claimant_id: number; status: string; created_at: string }>;
}

export interface PaginatedItems {
  items: Item[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export type MatchClassification = 'STRONG' | 'POSSIBLE' | 'LOW';
export type MatchStatus = 'PENDING' | 'ACCEPTED' | 'DISMISSED';

export interface MatchFactor {
  score: number;
  max: number;
  percentage?: number;
  matched?: boolean;
}

export interface MatchBreakdown {
  factors: {
    name_similarity: MatchFactor;
    category_match: MatchFactor;
    location_proximity: MatchFactor;
    date_proximity: MatchFactor;
    description_similarity: MatchFactor;
    color_match: MatchFactor;
  };
  summary: string;
}

export interface Match {
  id: number;
  lost_item_id: number;
  found_item_id: number;
  score: number;
  classification: MatchClassification;
  breakdown?: MatchBreakdown;
  status: MatchStatus;
  created_at: string;
  lost_item?: Item;
  found_item?: Item;
}

export type ClaimStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'RETURNED';
export type HandoverStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface Handover {
  id: number;
  claim_id: number;
  handover_code: string;
  handover_location: string;
  scheduled_time?: string;
  status: HandoverStatus;
  completed_at?: string;
  notes?: string;
  created_at: string;
}

export interface Claim {
  id: number;
  item_id: number;
  lost_item_id?: number;
  claimant_id: number;
  ownership_proof?: string;
  proof_image_url?: string;
  status: ClaimStatus;
  admin_notes?: string;
  reviewed_by_id?: number;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  item?: Item;
  lost_item?: Item;
  claimant?: User;
  handover?: Handover;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'MATCH_FOUND' | 'CLAIM_SUBMITTED' | 'CLAIM_STATUS' | 'ITEM_RETURNED' | 'SYSTEM';
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface PlatformStats {
  total_users: number;
  total_lost_items: number;
  total_found_items: number;
  total_recovered_items: number;
  recovery_rate_percentage: number;
  active_matches_count: number;
  pending_claims_count: number;
  recent_activity_count: number;
}

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  icon?: string;
  lost_count: number;
  found_count: number;
  recovered_count: number;
}

export interface LocationHotspot {
  location_id: number;
  building_name: string;
  campus_name: string;
  total_reports: number;
}

export interface MonthlyTrend {
  month: string;
  lost: number;
  found: number;
  recovered: number;
}

export interface AdminAnalytics {
  stats: PlatformStats;
  category_breakdown: CategoryBreakdown[];
  location_hotspots: LocationHotspot[];
  monthly_trend: MonthlyTrend[];
}
