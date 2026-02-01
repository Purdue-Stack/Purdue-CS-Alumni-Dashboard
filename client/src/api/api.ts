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

export type AlumniQueryParams = {
  graduationYears?: string[];
  majors?: string[];
  tracks?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

export type AlumniListResponse<T = Record<string, any>> = {
  rows: T[];
  total: number;
};

export const fetchPublicAlumni = async <T = Record<string, any>>(
  params: AlumniQueryParams
): Promise<AlumniListResponse<T>> => {
  const response = await api.get<AlumniListResponse<T>>('/alumni', {
    params: {
      graduationYears: params.graduationYears?.join(','),
      majors: params.majors?.join(','),
      tracks: params.tracks?.join(','),
      search: params.search,
      page: params.page,
      pageSize: params.pageSize
    }
  });
  return response.data;
};

export type InternshipQueryParams = {
  companies?: string[];
  roles?: string[];
  years?: number[];
  locations?: string[];
  outcomes?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

export type InternshipListResponse<T = Record<string, any>> = {
  rows: T[];
  total: number;
};

export const fetchInternships = async <T = Record<string, any>>(
  params: InternshipQueryParams
): Promise<InternshipListResponse<T>> => {
  const response = await api.get<InternshipListResponse<T>>('/internships', {
    params: {
      companies: params.companies?.join(','),
      roles: params.roles?.join(','),
      years: params.years?.join(','),
      locations: params.locations?.join(','),
      outcomes: params.outcomes?.join(','),
      search: params.search,
      page: params.page,
      pageSize: params.pageSize
    }
  });
  return response.data;
};

export type MentorQueryParams = {
  tracks?: string[];
  roles?: string[];
  locations?: string[];
  availability?: string[];
  areas?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

export type MentorListResponse<T = Record<string, any>> = {
  rows: T[];
  total: number;
};

export const fetchMentors = async <T = Record<string, any>>(
  params: MentorQueryParams
): Promise<MentorListResponse<T>> => {
  const response = await api.get<MentorListResponse<T>>('/mentors', {
    params: {
      tracks: params.tracks?.join(','),
      roles: params.roles?.join(','),
      locations: params.locations?.join(','),
      availability: params.availability?.join(','),
      areas: params.areas?.join(','),
      search: params.search,
      page: params.page,
      pageSize: params.pageSize
    }
  });
  return response.data;
};

export default api;
