import axios from 'axios';
import {
  AuthResponse, User, Item, PaginatedItems, Category, Location,
  Match, Claim, NotificationItem, AdminAnalytics, PlatformStats
} from '../types';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cf_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      // Token expired or invalid
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_user');
      window.dispatchEvent(new Event('auth-change'));
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (data: { token: string; new_password: string }) => {
    const res = await apiClient.post('/auth/reset-password', data);
    return res.data;
  },

  // Users
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const res = await apiClient.put<User>('/users/profile', data);
    return res.data;
  },

  // Categories & Locations
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get<Category[]>('/categories/');
    return res.data;
  },
  getLocations: async (): Promise<Location[]> => {
    const res = await apiClient.get<Location[]>('/locations/');
    return res.data;
  },

  // Items
  getItems: async (params?: Record<string, any>): Promise<PaginatedItems> => {
    const res = await apiClient.get<PaginatedItems>('/items/', { params });
    return res.data;
  },
  getItemById: async (id: number): Promise<Item> => {
    const res = await apiClient.get<Item>(`/items/${id}`);
    return res.data;
  },
  getRecentLost: async (): Promise<Item[]> => {
    const res = await apiClient.get<Item[]>('/items/recent-lost');
    return res.data;
  },
  getRecentFound: async (): Promise<Item[]> => {
    const res = await apiClient.get<Item[]>('/items/recent-found');
    return res.data;
  },
  getMyItems: async (): Promise<Item[]> => {
    const res = await apiClient.get<Item[]>('/items/my-items');
    return res.data;
  },
  createItem: async (data: any): Promise<Item> => {
    const res = await apiClient.post<Item>('/items/', data);
    return res.data;
  },
  updateItem: async (id: number, data: any): Promise<Item> => {
    const res = await apiClient.put<Item>(`/items/${id}`, data);
    return res.data;
  },
  deleteItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/items/${id}`);
  },
  uploadImage: async (file: File): Promise<{ url: string; public_id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post('/items/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Smart Matching
  getMyMatches: async (): Promise<Match[]> => {
    const res = await apiClient.get<Match[]>('/matching/my-matches');
    return res.data;
  },
  getMatchDetail: async (id: number): Promise<Match> => {
    const res = await apiClient.get<Match>(`/matching/${id}`);
    return res.data;
  },
  updateMatchStatus: async (id: number, status: 'ACCEPTED' | 'DISMISSED'): Promise<Match> => {
    const res = await apiClient.put<Match>(`/matching/${id}/status`, { status });
    return res.data;
  },
  recalculateMatches: async () => {
    const res = await apiClient.post('/matching/recalculate');
    return res.data;
  },

  // Claims
  submitClaim: async (data: { item_id: number; lost_item_id?: number; ownership_proof: string; proof_image_url?: string }): Promise<Claim> => {
    const res = await apiClient.post<Claim>('/claims/', data);
    return res.data;
  },
  getMyClaims: async (): Promise<Claim[]> => {
    const res = await apiClient.get<Claim[]>('/claims/my-claims');
    return res.data;
  },
  getClaimById: async (id: number): Promise<Claim> => {
    const res = await apiClient.get<Claim>(`/claims/${id}`);
    return res.data;
  },
  updateClaimStatus: async (id: number, data: { status: string; admin_notes?: string; handover_location?: string; scheduled_time?: string }): Promise<Claim> => {
    const res = await apiClient.put<Claim>(`/claims/${id}/status`, data);
    return res.data;
  },
  verifyHandover: async (claimId: number, handoverCode: string): Promise<Claim> => {
    const res = await apiClient.post<Claim>(`/claims/${claimId}/verify-handover?handover_code=${encodeURIComponent(handoverCode)}`);
    return res.data;
  },

  // Notifications
  getNotifications: async (limit: number = 20): Promise<NotificationItem[]> => {
    const res = await apiClient.get<NotificationItem[]>('/notifications/', { params: { limit } });
    return res.data;
  },
  getUnreadCount: async (): Promise<{ unread_count: number }> => {
    const res = await apiClient.get<{ unread_count: number }>('/notifications/count');
    return res.data;
  },
  markNotificationRead: async (id: number): Promise<NotificationItem> => {
    const res = await apiClient.put<NotificationItem>(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await apiClient.put('/notifications/read-all');
    return res.data;
  },

  // Admin
  getAdminStats: async () => {
    const res = await apiClient.get('/admin/stats');
    return res.data;
  },
  getAdminUsers: async (params?: any): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/admin/users', { params });
    return res.data;
  },
  updateUserRole: async (userId: number, newRole: string): Promise<User> => {
    const res = await apiClient.put<User>(`/admin/users/${userId}/role?new_role=${newRole}`);
    return res.data;
  },
  toggleUserStatus: async (userId: number, isActive: boolean): Promise<User> => {
    const res = await apiClient.put<User>(`/admin/users/${userId}/status?is_active=${isActive}`);
    return res.data;
  },
  getAdminItems: async (params?: any): Promise<Item[]> => {
    const res = await apiClient.get<Item[]>('/admin/items', { params });
    return res.data;
  },
  updateItemStatusAdmin: async (itemId: number, newStatus: string): Promise<Item> => {
    const res = await apiClient.put<Item>(`/admin/items/${itemId}/status?new_status=${newStatus}`);
    return res.data;
  },
  getAdminClaims: async (status?: string): Promise<Claim[]> => {
    const res = await apiClient.get<Claim[]>('/admin/claims', { params: { status } });
    return res.data;
  },
  getAuditLogs: async (limit: number = 50) => {
    const res = await apiClient.get('/admin/audit-logs', { params: { limit } });
    return res.data;
  },

  // Analytics
  getPlatformAnalytics: async (): Promise<AdminAnalytics> => {
    const res = await apiClient.get<AdminAnalytics>('/analytics/platform');
    return res.data;
  },
};
