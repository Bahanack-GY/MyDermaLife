export interface MedicalHistoryItem {
    condition: string;
    status: 'ongoing' | 'resolved';
    date?: string;
    title?: string;
    type?: string;
    description?: string;
}

export interface VaccineItem {
    name: string;
    date: string;
}

export interface MedicalRecord {
    allergies: string[];
    history: MedicalHistoryItem[];
    vaccines: VaccineItem[];
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface SkinLog {
    id: string;
    userId: string;
    photoUrl: string;
    date: string;
    title?: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Prescription {
    id: string;
    date: string;
    diagnosis?: string;
    notes?: string;
    medications: {
        id: string;
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions: string;
    }[];
    doctor?: {
        id: string;
        specialization: string;
        user: {
            id: string;
            email: string;
            profile?: {
                firstName: string;
                lastName: string;
            };
        };
    };
    pdfUrl?: string;
}

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    profile?: {
        id: string;
        userId: string;
        firstName: string;
        lastName: string;
        dateOfBirth?: string;
        gender?: string;
        profilePhoto?: string;
        language?: string;
        medicalRecord?: MedicalRecord;
        [key: string]: any;
    };
    [key: string]: any;
}

export type ConsultationStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'proposed' | 'rejected' | 'no_show';

// Doctor Types
export interface DoctorAvailability {
    id: string;
    dayOfWeek: number;
    date?: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export interface Doctor {
    id: string;
    userId: string;
    specialization: string;
    yearsOfExperience: number;
    bio: string;
    consultationFee: number;
    videoConsultationFee: number;
    rating: number;
    totalReviews: number;
    languagesSpoken: string[];
    education: any[];
    user: {
        id: string;
        email: string;
        profile: {
            firstName: string;
            lastName: string;
            profilePhoto?: string;
            city?: string;
            country?: string;
            lat?: number;
            lng?: number;
        };
    };
    availability?: DoctorAvailability[];
}

export interface Consultation {
    id: string;
    status: ConsultationStatus;
    scheduledDate: string;
    consultationNumber?: string;
    doctorId: string;
    patientId: string;
    consultationType?: 'video' | 'chat' | 'in_person';
    description?: string;
    createdAt: string;
    updatedAt: string;
    doctor?: Doctor;
    [key: string]: any;
}

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export const Gender = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
    PREFER_NOT_TO_SAY: 'prefer_not_to_say',
} as const;

export type GenderType = typeof Gender[keyof typeof Gender];

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: GenderType;
}
