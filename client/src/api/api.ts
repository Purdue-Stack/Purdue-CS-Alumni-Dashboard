import axios from 'axios';
import { apiBaseUrl } from '../config/runtime';

const api = axios.create({ baseURL: apiBaseUrl });

export type DashboardAnalyticsResponse = {
  outcomesByState: { state: string; value: number }[];
  salaryBands: { name: string; value: number }[];
  topCompanies: { name: string; value: number }[];
  gradAdmissions: { name: string; value: number }[];
  internshipConversions: { name: string; value: number }[];
};

export type DashboardAnalyticsParams = {
  graduationYears?: string[];
  majors?: string[];
  degreeLevels?: string[];
  employmentTypes?: string[];
  tracks?: string[];
  locations?: string[];
  search?: string;
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
  track: string | null;
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
  tracks?: string[];
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
  track: string | null;
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
  tracks?: string[];
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
  track: string | null;
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
  track?: string | null;
  degreeSeeking?: string | null;
  university?: string | null;
  city?: string | null;
  state?: string | null;
  baseSalary?: number | null;
  signingBonus?: number | null;
  relocationReimbursement?: number | null;
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

export const fetchDashboardAnalytics = async (
  params: DashboardAnalyticsParams
): Promise<DashboardAnalyticsResponse> => {
  const response = await api.get<DashboardAnalyticsResponse>('/analytics/dashboard', {
    params: {
      graduationYears: params.graduationYears?.join(','),
      majors: params.majors?.join(','),
      degreeLevels: params.degreeLevels?.join(','),
      employmentTypes: params.employmentTypes?.join(','),
      tracks: params.tracks?.join(','),
      locations: params.locations?.join(','),
      search: params.search
    }
  });
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
      tracks: params.tracks?.join(','),
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
      tracks: params.tracks?.join(','),
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
