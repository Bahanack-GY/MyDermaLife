/**
 * Patients API
 * Handles patient CRUD operations, medical history, photos, and vitals
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { API_ENDPOINTS, QUERY_KEYS } from '../config';
import type {
    Patient,
    PatientVitals,
    MedicalHistoryEvent,
    PaginatedResponse,
    PaginationParams,
    SearchFilter,
    PatientStats,
    PatientPhoto,
    MedicalDocument
} from '../types';

// Request types
export interface CreatePatientRequest {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    gender: 'Male' | 'Female' | 'Other';
    bloodType?: string;
    allergies?: string[];
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
    status?: 'Active' | 'Inactive';
}

export interface AddPatientPhotoRequest {
    title: string;
    notes?: string;
    date: string;
    imageFile: File;
}

export interface PatientFilters extends PaginationParams, SearchFilter {
    status?: 'Active' | 'Inactive';
}

// API functions
export const patientsApi = {
    /**
     * Get paginated list of patients
     */
    getPatients: async (filters?: PatientFilters): Promise<PaginatedResponse<Patient>> => {
        const response = await apiClient.get<PaginatedResponse<Patient>>(
            API_ENDPOINTS.patients.list,
            { params: filters }
        );
        return response.data;
    },

    /**
     * Get a single patient by ID
     */
    getPatient: async (id: string): Promise<Patient> => {
        const response = await apiClient.get<Patient>(API_ENDPOINTS.patients.detail(id));
        return response.data;
    },

    /**
     * Create a new patient
     */
    createPatient: async (data: CreatePatientRequest): Promise<Patient> => {
        const response = await apiClient.post<Patient>(API_ENDPOINTS.patients.create, data);
        return response.data;
    },

    /**
     * Update an existing patient
     */
    updatePatient: async (id: string, data: UpdatePatientRequest): Promise<Patient> => {
        const response = await apiClient.patch<Patient>(API_ENDPOINTS.patients.update(id), data);
        return response.data;
    },

    /**
     * Delete a patient
     */
    deletePatient: async (id: string): Promise<void> => {
        await apiClient.delete(API_ENDPOINTS.patients.delete(id));
    },

    /**
     * Search patients
     */
    searchPatients: async (query: string): Promise<Patient[]> => {
        const response = await apiClient.get<Patient[]>(
            API_ENDPOINTS.patients.search,
            { params: { q: query } }
        );
        return response.data;
    },

    /**
     * Get patient's medical history
     */
    getMedicalHistory: async (patientId: string): Promise<MedicalHistoryEvent[]> => {
        const response = await apiClient.get<MedicalHistoryEvent[]>(
            API_ENDPOINTS.patients.medicalHistory(patientId)
        );
        return response.data;
    },

    /**
     * Get patient's photos
     */
    getPatientPhotos: async (patientId: string): Promise<PatientPhoto[]> => {
        const response = await apiClient.get<PatientPhoto[]>(
            API_ENDPOINTS.patients.photos(patientId)
        );
        return response.data;
    },

    /**
     * Add a new photo to patient's record
     */
    addPatientPhoto: async (patientId: string, data: AddPatientPhotoRequest): Promise<PatientPhoto> => {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('date', data.date);
        if (data.notes) formData.append('notes', data.notes);
        formData.append('image', data.imageFile);

        const response = await apiClient.post<PatientPhoto>(
            API_ENDPOINTS.patients.photos(patientId),
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    /**
     * Get patient's latest vitals
     */
    getPatientVitals: async (patientId: string): Promise<PatientVitals> => {
        const response = await apiClient.get<PatientVitals>(
            API_ENDPOINTS.patients.vitals(patientId)
        );
        return response.data;
    },

    /**
     * Get patient's stats
     */
    getPatientStats: async (patientId: string): Promise<PatientStats> => {
        const response = await apiClient.get<PatientStats>(
            API_ENDPOINTS.patients.stats(patientId)
        );
        return response.data;
    },

    /**
     * Update patient's medical record (clinical notes, chronic conditions)
     */
    updateMedicalRecord: async (patientId: string, data: { clinicalNotes?: string; chronicConditions?: string[] }): Promise<{ message: string }> => {
        const response = await apiClient.patch<{ message: string }>(
            `${API_ENDPOINTS.patients.detail(patientId)}/medical-record`,
            data
        );
        return response.data;
    },

    /**
     * Add a medical history event
     */
    addMedicalHistoryEvent: async (patientId: string, data: { title: string; description?: string; date: string; type: string }): Promise<MedicalHistoryEvent> => {
        const response = await apiClient.post<MedicalHistoryEvent>(
            API_ENDPOINTS.patients.medicalHistory(patientId),
            data
        );
        return response.data;
    },

    /**
     * Update a medical history event
     */
    updateMedicalHistoryEvent: async (patientId: string, eventId: string, data: { title?: string; description?: string; date?: string; type?: string }): Promise<MedicalHistoryEvent> => {
        const response = await apiClient.patch<MedicalHistoryEvent>(
            `${API_ENDPOINTS.patients.medicalHistory(patientId)}/${eventId}`,
            data
        );
        return response.data;
    },

    /**
     * Delete a medical history event
     */
    /**
     * Delete a medical history event
     */
    deleteMedicalHistoryEvent: async (patientId: string, eventId: string): Promise<{ message: string }> => {
        const response = await apiClient.delete<{ message: string }>(
            `${API_ENDPOINTS.patients.medicalHistory(patientId)}/${eventId}`
        );
        return response.data;
    },

    /**
     * Medical Documents
     */
    uploadMedicalDocument: async (patientId: string, data: { file: File, category: string, title: string, description?: string, date?: string, metadata?: any }): Promise<MedicalDocument> => {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('category', data.category);
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.date) formData.append('date', data.date);
        if (data.metadata) formData.append('metadata', JSON.stringify(data.metadata));

        const response = await apiClient.post<MedicalDocument>(
            `${API_ENDPOINTS.patients.detail(patientId)}/documents`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return response.data;
    },

    getMedicalDocuments: async (patientId: string): Promise<MedicalDocument[]> => {
        const response = await apiClient.get<MedicalDocument[]>(
            `${API_ENDPOINTS.patients.detail(patientId)}/documents`
        );
        return response.data;
    },

    deleteMedicalDocument: async (patientId: string, documentId: string): Promise<void> => {
        await apiClient.delete(
            `${API_ENDPOINTS.patients.detail(patientId)}/documents/${documentId}`
        );
    },

    /**
     * Extended Medical Record
     */
    updateInsuranceNumber: async (patientId: string, insuranceNumber: string): Promise<{ message: string }> => {
        const response = await apiClient.patch<{ message: string }>(
            `${API_ENDPOINTS.patients.detail(patientId)}/insurance`,
            { insuranceNumber }
        );
        return response.data;
    },

    updateCurrentTreatments: async (patientId: string, treatments: any[]): Promise<{ message: string }> => {
        const response = await apiClient.patch<{ message: string }>(
            `${API_ENDPOINTS.patients.detail(patientId)}/treatments`,
            { treatments }
        );
        return response.data;
    },

    updateSkinRiskFactors: async (patientId: string, factors: any): Promise<{ message: string }> => {
        const response = await apiClient.patch<{ message: string }>(
            `${API_ENDPOINTS.patients.detail(patientId)}/risk-factors`,
            { factors }
        );
        return response.data;
    }
};

// React Query hooks

/**
 * Hook to get paginated patients list
 */
export const usePatients = (filters?: PatientFilters) => {
    return useQuery({
        queryKey: [...QUERY_KEYS.patients, filters],
        queryFn: () => patientsApi.getPatients(filters),
    });
};

/**
 * Hook to get a single patient
 */
export const usePatient = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.patient(id),
        queryFn: () => patientsApi.getPatient(id),
        enabled: !!id,
    });
};

/**
 * Hook to search patients
 */
export const useSearchPatients = (query: string) => {
    return useQuery({
        queryKey: ['patients', 'search', query],
        queryFn: () => patientsApi.searchPatients(query),
        enabled: query.length >= 2,
    });
};

/**
 * Hook to create a new patient
 */
export const useCreatePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: patientsApi.createPatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients });
        },
    });
};

/**
 * Hook to update a patient
 */
export const useUpdatePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePatientRequest }) =>
            patientsApi.updatePatient(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient(id) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients });
        },
    });
};

/**
 * Hook to delete a patient
 */
export const useDeletePatient = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: patientsApi.deletePatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patients });
        },
    });
};

/**
 * Hook to get patient's medical history
 */
export const usePatientMedicalHistory = (patientId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.patientMedicalHistory(patientId),
        queryFn: () => patientsApi.getMedicalHistory(patientId),
        enabled: !!patientId,
    });
};

/**
 * Hook to get patient's photos
 */
export const usePatientPhotos = (patientId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.patientPhotos(patientId),
        queryFn: () => patientsApi.getPatientPhotos(patientId),
        enabled: !!patientId,
    });
};

/**
 * Hook to add a photo to patient's record
 */
export const useAddPatientPhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string; data: AddPatientPhotoRequest }) =>
            patientsApi.addPatientPhoto(patientId, data),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientPhotos(patientId) });
        },
    });
};

// ... existing code ...
/**
 * Hook to get patient's vitals
 */
export const usePatientVitals = (patientId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.patientVitals(patientId),
        queryFn: () => patientsApi.getPatientVitals(patientId),
        enabled: !!patientId,
    });
};

/**
 * Hook to get patient's stats
 */
export const usePatientStats = (patientId: string) => {
    return useQuery({
        queryKey: ['patients', patientId, 'stats'],
        queryFn: () => patientsApi.getPatientStats(patientId),
        enabled: !!patientId,
    });
};

/**
 * Hook to update patient's medical record
 */
export const useUpdateMedicalRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string; data: { clinicalNotes?: string; chronicConditions?: string[] } }) =>
            patientsApi.updateMedicalRecord(patientId, data),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient(patientId) });
        },
    });
};

/**
 * Hook to add a medical history event
 */
export const useAddMedicalHistoryEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string; data: { title: string; description?: string; date: string; type: string } }) =>
            patientsApi.addMedicalHistoryEvent(patientId, data),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientMedicalHistory(patientId) });
        },
    });
};

/**
 * Hook to update a medical history event
 */
export const useUpdateMedicalHistoryEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, eventId, data }: { patientId: string; eventId: string; data: { title?: string; description?: string; date?: string; type?: string } }) =>
            patientsApi.updateMedicalHistoryEvent(patientId, eventId, data),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientMedicalHistory(patientId) });
        },
    });
};

/**
 * Hook to delete a medical history event
 */
export const useDeleteMedicalHistoryEvent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, eventId }: { patientId: string; eventId: string }) =>
            patientsApi.deleteMedicalHistoryEvent(patientId, eventId),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patientMedicalHistory(patientId) });
        },
    });
};

// --- New Hooks ---

/**
 * Hook to get medical documents
 */
export const useMedicalDocuments = (patientId: string) => {
    return useQuery({
        queryKey: ['patients', patientId, 'documents'],
        queryFn: () => patientsApi.getMedicalDocuments(patientId),
        enabled: !!patientId,
    });
};

/**
 * Hook to upload medical document
 */
export const useUploadMedicalDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: string, data: any }) =>
            patientsApi.uploadMedicalDocument(patientId, data),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'documents'] });
        },
    });
};

/**
 * Hook to delete medical document
 */
export const useDeleteMedicalDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, documentId }: { patientId: string, documentId: string }) =>
            patientsApi.deleteMedicalDocument(patientId, documentId),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: ['patients', patientId, 'documents'] });
        },
    });
};

/**
 * Hook to update insurance number
 */
export const useUpdateInsuranceNumber = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, insuranceNumber }: { patientId: string, insuranceNumber: string }) =>
            patientsApi.updateInsuranceNumber(patientId, insuranceNumber),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient(patientId) });
        },
    });
};

/**
 * Hook to update current treatments
 */
export const useUpdateCurrentTreatments = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, treatments }: { patientId: string, treatments: any[] }) =>
            patientsApi.updateCurrentTreatments(patientId, treatments),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient(patientId) });
        },
    });
};

/**
 * Hook to update skin risk factors
 */
export const useUpdateSkinRiskFactors = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ patientId, factors }: { patientId: string, factors: any }) =>
            patientsApi.updateSkinRiskFactors(patientId, factors),
        onSuccess: (_, { patientId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.patient(patientId) });
        },
    });
};

export default patientsApi;
