import apiClient from '../client';
import { API_ENDPOINTS } from '../config';
import type { Consultation } from '../types';

// Note: The axios response interceptor already unwraps response.data
// (and response.data.data if nested), so apiClient calls return the final data directly.
export const consultationsApi = {
    getAll: async (): Promise<Consultation[]> => {
        return apiClient.get(API_ENDPOINTS.patientConsultations.my) as unknown as Promise<Consultation[]>;
    },

    getById: async (id: string): Promise<Consultation> => {
        return apiClient.get(API_ENDPOINTS.patientConsultations.detail(id)) as unknown as Promise<Consultation>;
    },

    book: async (data: { doctorId: string; consultationType: string; scheduledDate: string; chiefComplaint?: string }): Promise<Consultation> => {
        return apiClient.post(API_ENDPOINTS.patientConsultations.book, data) as unknown as Promise<Consultation>;
    },

    update: async (id: string, data: Partial<Consultation>): Promise<Consultation> => {
        return apiClient.put(API_ENDPOINTS.patientConsultations.detail(id), data) as unknown as Promise<Consultation>;
    },

    getMyAppointments: async (): Promise<Consultation[]> => {
        return apiClient.get(API_ENDPOINTS.patientConsultations.my) as unknown as Promise<Consultation[]>;
    },

    accept: async (id: string): Promise<Consultation> => {
        return apiClient.patch(API_ENDPOINTS.patientConsultations.accept(id)) as unknown as Promise<Consultation>;
    },

    reject: async (id: string): Promise<Consultation> => {
        return apiClient.patch(API_ENDPOINTS.patientConsultations.reject(id)) as unknown as Promise<Consultation>;
    },

    joinWaitingRoom: async (id: string): Promise<Consultation> => {
        return apiClient.patch(API_ENDPOINTS.patientConsultations.join(id)) as unknown as Promise<Consultation>;
    },

    leaveWaitingRoom: async (id: string): Promise<Consultation> => {
        return apiClient.patch(API_ENDPOINTS.patientConsultations.leave(id)) as unknown as Promise<Consultation>;
    },
    finish: async (id: string): Promise<Consultation> => {
        return apiClient.patch(API_ENDPOINTS.patientConsultations.finish(id)) as unknown as Promise<Consultation>;
    },
};
