import { apiService } from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Certification {
  name: string;
  year: number;
}

export interface DoctorFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  licenseNumber: string;
  specialization?: string;
  yearsOfExperience?: number;
  bio?: string;
  education?: Education[];
  certifications?: Certification[];
  languagesSpoken?: string[];
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  profilePhoto: string | null;
  gender: string | null;
  city: string | null;
  country: string | null;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  profile: UserProfile;
}

export interface Doctor {
  id: string;
  userId: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  bio: string;
  education: Education[];
  certifications: Certification[];
  languagesSpoken: string[];
  consultationFee: number;
  videoConsultationFee: number;
  rating: number;
  totalReviews: number;
  totalConsultations: number;
  verificationStatus: string;
  verifiedAt: string | null;
  isAvailable: boolean;
  status: 'active' | 'inactive' | 'on_leave';
  createdAt: string;
  updatedAt: string;
  user: User;
  availability: any[];
}

export interface DoctorListParams {
  status?: 'active' | 'inactive' | 'on_leave';
  isAvailable?: boolean;
  language?: string;
  search?: string;
  minFee?: number;
  maxFee?: number;
  minRating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DoctorListResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  totalPages: number;
}

export const doctorService = {
  // Get all doctors
  getDoctors: async (params?: DoctorListParams): Promise<DoctorListResponse> => {
    const response = await apiService.get<DoctorListResponse>(
      API_ENDPOINTS.DOCTORS.LIST,
      { params }
    );
    console.log('API Response:', response);
    console.log('Response Data:', response.data);
    return response.data;
  },

  // Get doctor by ID
  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await apiService.get<Doctor>(API_ENDPOINTS.DOCTORS.GET(id));
    return response.data;
  },

  // Create doctor
  createDoctor: async (data: DoctorFormData): Promise<Doctor> => {
    const response = await apiService.post<Doctor>(
      API_ENDPOINTS.DOCTORS.CREATE,
      data
    );
    return response.data;
  },

  // Update doctor
  updateDoctor: async (id: string, data: Partial<DoctorFormData>): Promise<Doctor> => {
    const response = await apiService.put<Doctor>(
      API_ENDPOINTS.DOCTORS.UPDATE(id),
      data
    );
    return response.data;
  },

  // Delete doctor
  deleteDoctor: async (id: string): Promise<void> => {
    await apiService.delete(API_ENDPOINTS.DOCTORS.DELETE(id));
  },
};

export default doctorService;
