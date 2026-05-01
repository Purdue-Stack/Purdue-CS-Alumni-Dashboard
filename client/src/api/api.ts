import axios from 'axios';
import { apiBaseUrl } from '../config/runtime';

const api = axios.create({ baseURL: apiBaseUrl, withCredentials: true });

export type AuthUser = {
  id: string;
  username: string;
  displayName: string;
  role: 'student' | 'admin';
};

export type AuthMeResponse = {
  user: AuthUser | null;
};

export type DashboardAnalyticsResponse = {
  outcomeBreakdown: { name: string; value: number }[];
  salaryHistogram: { name: string; value: number }[];
  salaryByRegion: { state: string; value: number }[];
  jobPlacementsByRegion: { state: string; value: number }[];
  topPlacementFocus: { name: string; value: number }[];
  topPlacementsTop10: { name: string; value: number }[];
  gradAdmissionsByRegion: { state: string; value: number }[];
  gradAdmissionsFocus: { name: string; value: number }[];
  gradAdmissionsTop10: { name: string; value: number }[];
  internshipConversions: { name: string; value: number }[];
  internshipPlacementFocus: { name: string; value: number }[];
  internshipPlacementsTop10: { name: string; value: number }[];
};

export const fetchCurrentUser = async (): Promise<AuthMeResponse> => {
  const response = await api.get<AuthMeResponse>('/auth/me');
  return response.data;
};

export const loginWithPassword = async (
  username: string,
  password: string
): Promise<AuthMeResponse> => {
  const response = await api.post<AuthMeResponse>('/auth/login', { username, password });
  return response.data;
};

export const logoutCurrentUser = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export type DashboardAnalyticsParams = {
  graduationYears?: string[];
  majors?: string[];
  degreeLevels?: string[];
  locations?: string[];
  search?: string;
};

export type DashboardFilterOptionsResponse = {
  graduationYears: string[];
  majors: string[];
  degreeLevels: string[];
};

export type HomeStatsResponse = {
  alumniTracked: number;
  averageSalary: number;
  mentorsAvailable: number;
};

export type AlumniDirectoryRow = {
  alumni_id: number;
  first_name: string;
  last_name: string;
  graduation_year: number;
  graduation_term: string | null;
  outcome_type: string | null;
  expected_field_of_study: string | null;
  degree_seeking: string | null;
  university: string | null;
  degree_level: string | null;
  employer: string | null;
  job_title: string | null;
  city: string | null;
  state: string | null;
};

export type AlumniQueryParams = {
  graduationYears?: string[];
  majors?: string[];
  outcomeTypes?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

export type ListResponse<T> = {
  rows: T[];
  total: number;
};

export type InternshipRow = {
  id: number;
  alumni_id: number | null;
  company: string | null;
  role: string | null;
  internship_year: number | null;
  location_city: string | null;
  location_state: string | null;
  outcome_company: string | null;
  outcome_role: string | null;
  outcome_type: string | null;
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

export type MentorRow = {
  id: number;
  alumni_id: number | null;
  first_name: string;
  last_name: string;
  email: string | null;
  linkedin: string | null;
  role: string | null;
  location_city: string | null;
  location_state: string | null;
  mentorship_areas: string[];
  outcome_type: string | null;
  employer: string | null;
  job_title: string | null;
  degree_seeking: string | null;
  expected_field_of_study: string | null;
  university: string | null;
};

export type MentorQueryParams = {
  roles?: string[];
  locations?: string[];
  areas?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
};

export type AdminLog = {
  id: number;
  timestamp: string;
  action: string;
  description: string;
  target: string;
};

export type PendingMentorCandidate = {
  alumni_id: number;
  first_name: string;
  last_name: string;
  graduation_year: number;
  employer: string | null;
  job_title: string | null;
  email: string | null;
  linkedin: string | null;
  city: string | null;
  state: string | null;
  mentorship_areas: string[];
  mentorship_status: string;
};

export type AdminSummaryResponse = {
  counts: {
    alumni: number;
    mentors: number;
    internships: number;
    pendingMentors: number;
  };
  pendingMentors: PendingMentorCandidate[];
  recentLogs: AdminLog[];
};

export type AdminAlumniUpdatePayload = {
  firstName?: string;
  lastName?: string;
  graduationYear?: number;
  graduationTerm?: string | null;
  outcomeType?: string | null;
  employer?: string | null;
  jobTitle?: string | null;
  expectedFieldOfStudy?: string | null;
  isApproved?: boolean;
  isVisible?: boolean;
  isDeleted?: boolean;
  isAnonymized?: boolean;
  isDirectoryVisible?: boolean;
  degreeSeeking?: string | null;
  university?: string | null;
  city?: string | null;
  state?: string | null;
  baseSalary?: number | null;
  studentId?: number | null;
  degreeLevel?: string | null;
  salaryPayPeriod?: string | null;
  email?: string | null;
  linkedIn?: string | null;
  mentorshipAreas?: string[];
  mentorshipOptIn?: boolean;
  mentorshipStatus?: 'none' | 'pending' | 'approved' | 'denied';
};

export type MentorApprovalPayload = {
  isDirectoryVisible?: boolean;
  email?: string | null;
  linkedIn?: string | null;
  mentorshipAreas?: string[];
};

export type UploadFieldMapping = Partial<Record<string, string | null>>;

export type UploadPreviewResponse = {
  rawHeaders: string[];
  rawRows: Record<string, any>[];
  columns: string[];
  suggestedMapping: UploadFieldMapping;
  requiredFields: string[];
  summary: {
    totalRows: number;
    missingColumns: string[];
    unmappedHeaders: string[];
    mappingErrors: string[];
  };
};

export type UploadFieldError = {
  rowIndex: number;
  field: string;
  message: string;
};

export type UploadValidationResponse = {
  columns: string[];
  rows: Record<string, any>[];
  rowErrors: { rowIndex: number; messages: string[] }[];
  fieldErrors: UploadFieldError[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
  };
};

export const fetchDashboardAnalytics = async (
  params: DashboardAnalyticsParams
): Promise<DashboardAnalyticsResponse> => {
  const response = await api.get<DashboardAnalyticsResponse>('/analytics/dashboard', {
    params: {
      graduationYears: params.graduationYears?.join(','),
      majors: params.majors?.join(','),
      degreeLevels: params.degreeLevels?.join(','),
      locations: params.locations?.join(','),
      search: params.search
    }
  });
  return response.data;
};

export const fetchDashboardFilterOptions = async (): Promise<DashboardFilterOptionsResponse> => {
  const response = await api.get<DashboardFilterOptionsResponse>('/analytics/dashboard/filter-options');
  return response.data;
};

export const previewUploadFile = async (file: File): Promise<UploadPreviewResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<UploadPreviewResponse>('/upload-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return response.data;
};

export const validateUploadData = async (payload: {
  rawRows?: Record<string, any>[];
  rows?: Record<string, any>[];
  mapping?: UploadFieldMapping;
}): Promise<UploadValidationResponse> => {
  const response = await api.post<UploadValidationResponse>('/validate-upload', payload);
  return response.data;
};

export const commitUploadData = async (payload: {
  rows: Record<string, any>[];
  filename?: string;
}): Promise<{
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  rowErrors?: { rowIndex: number; messages: string[] }[];
}> => {
  const response = await api.post('/commit-upload', payload);
  return response.data;
};

export const fetchHomeStats = async (): Promise<HomeStatsResponse> => {
  const response = await api.get<HomeStatsResponse>('/analytics/home');
  return response.data;
};

export const fetchPublicAlumni = async (
  params: AlumniQueryParams
): Promise<ListResponse<AlumniDirectoryRow>> => {
  const response = await api.get<ListResponse<AlumniDirectoryRow>>('/alumni', {
    params: {
      graduationYears: params.graduationYears?.join(','),
      majors: params.majors?.join(','),
      outcomeTypes: params.outcomeTypes?.join(','),
      search: params.search,
      page: params.page,
      pageSize: params.pageSize
    }
  });
  return response.data;
};

export const fetchInternships = async (
  params: InternshipQueryParams
): Promise<ListResponse<InternshipRow>> => {
  const response = await api.get<ListResponse<InternshipRow>>('/internships', {
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

export const fetchMentors = async (
  params: MentorQueryParams
): Promise<ListResponse<MentorRow>> => {
  const response = await api.get<ListResponse<MentorRow>>('/mentors', {
    params: {
      roles: params.roles?.join(','),
      locations: params.locations?.join(','),
      areas: params.areas?.join(','),
      search: params.search,
      page: params.page,
      pageSize: params.pageSize
    }
  });
  return response.data;
};

export const fetchAdminAlumni = async (): Promise<ListResponse<Record<string, unknown>>> => {
  const response = await api.get<ListResponse<Record<string, unknown>>>('/admin/alumni');
  return response.data;
};

export const updateAdminAlumni = async (
  id: number,
  payload: AdminAlumniUpdatePayload
): Promise<Record<string, unknown>> => {
  const response = await api.patch<Record<string, unknown>>(`/admin/alumni/${id}`, payload);
  return response.data;
};

export const fetchAdminSummary = async (): Promise<AdminSummaryResponse> => {
  const response = await api.get<AdminSummaryResponse>('/admin/analytics/summary');
  return response.data;
};

export const fetchPendingMentorApprovals = async (): Promise<PendingMentorCandidate[]> => {
  const response = await api.get<PendingMentorCandidate[]>('/admin/mentors/pending');
  return response.data;
};

export const approveMentorCandidate = async (
  id: number,
  payload: MentorApprovalPayload
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/admin/mentors/${id}/approve`, payload);
  return response.data;
};

export const denyMentorCandidate = async (id: number): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>(`/admin/mentors/${id}/deny`);
  return response.data;
};

export const fetchAdminLogs = async (): Promise<AdminLog[]> => {
  const response = await api.get<AdminLog[]>('/admin/logs');
  return response.data;
};

export const getAdminExportUrl = (): string => `${apiBaseUrl}/admin/export`;

export default api;
