import { useQuery } from '@tanstack/react-query';
import { searchAnalyticsService, type SearchAnalyticsParams, type SearchLogsParams } from '../services/searchAnalytics.service';

export const useSearchAnalytics = (params?: SearchAnalyticsParams) => {
  return useQuery({
    queryKey: ['searchAnalytics', params],
    queryFn: () => searchAnalyticsService.getAnalytics(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSearchLogs = (params?: SearchLogsParams) => {
  return useQuery({
    queryKey: ['searchLogs', params],
    queryFn: () => searchAnalyticsService.getLogs(params),
    staleTime: 1000 * 60, // 1 minute
  });
};
