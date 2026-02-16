import { apiService } from './api.service';

export interface SearchTerm {
  query: string;
  count: number;
  avgResults: number;
}

export interface SearchAnalyticsResponse {
  topSearches: SearchTerm[];
  zeroResultSearches: SearchTerm[];
  totalSearches: number;
  periodDays: number;
}

export interface SearchAnalyticsParams {
  days?: number;
  limit?: number;
}

export interface SearchLogEntry {
  id: string;
  userId: string | null;
  sessionToken: string | null;
  searchQuery: string;
  filters: any;
  resultsCount: number;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface SearchLogsResponse {
  data: SearchLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchLogsParams {
  page?: number;
  limit?: number;
  userId?: string;
  zeroResults?: boolean;
}

export const searchAnalyticsService = {
  // Get search analytics
  getAnalytics: async (params?: SearchAnalyticsParams): Promise<SearchAnalyticsResponse> => {
    const response = await apiService.get<SearchAnalyticsResponse>('/products/search-analytics', { params });
    console.log('[SearchAnalyticsService] Analytics data:', response.data);
    return response.data;
  },

  // Get search logs
  getLogs: async (params?: SearchLogsParams): Promise<SearchLogsResponse> => {
    const response = await apiService.get<SearchLogsResponse>('/products/search-logs', { params });
    console.log('[SearchAnalyticsService] Search logs:', response.data);
    return response.data;
  },
};

export default searchAnalyticsService;
