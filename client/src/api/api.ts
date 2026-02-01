// api.ts
import axios from 'axios';

const api = axios.create({ baseURL: '/api' }); //change this to your API base URL

export type DashboardAnalyticsResponse = {
  outcomesByState: { state: string; value: number }[];
  salaryBands: { name: string; value: number }[];
  topCompanies: { name: string; value: number }[];
  gradAdmissions: { name: string; value: number }[];
};

export type DashboardAnalyticsParams = {
  graduationYears?: string[];
  majors?: string[];
  degreeLevels?: string[];
  employmentTypes?: string[];
  search?: string;
};

export const fetchDashboardAnalytics = async (
  params: DashboardAnalyticsParams
): Promise<DashboardAnalyticsResponse> => {
  const response = await api.get<DashboardAnalyticsResponse>('/analytics/dashboard', {
    params: {
      graduationYears: params.graduationYears?.join(','),
      majors: params.majors?.join(','),
      degreeLevels: params.degreeLevels?.join(','),
      employmentTypes: params.employmentTypes?.join(','),
      search: params.search
    }
  });
  return response.data;
};

export default api;
