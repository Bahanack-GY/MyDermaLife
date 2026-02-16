/**
 * Common API Types
 * Shared type definitions used across all API modules
 */

// Pagination
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Common filters
export interface DateRangeFilter {
    startDate?: string;
    endDate?: string;
}

export interface SearchFilter {
    search?: string;
}

// Status types
export type PatientStatus = 'Active' | 'Inactive';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type ConsultationStatus = 'in_progress' | 'completed' | 'cancelled' | 'scheduled' | 'proposed' | 'rejected';
export type ReportStatus = 'Finalized' | 'PendingReview' | 'Archived';
export type NotificationType = 'critical' | 'warning' | 'info' | 'success';

// Base entity type
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}

// User/Doctor type
// User/Doctor type
export interface Doctor extends BaseEntity {
    userId: string;
    licenseNumber: string;
    specialization: string;
    yearsOfExperience: number;
    bio: string;
    education: any[];
    certifications: any[];
    languagesSpoken: string[];
    consultationFee: number;
    videoConsultationFee: number;
    rating?: number;
    totalReviews?: number;
    totalConsultations?: number;
    verificationStatus: 'Pending' | 'Verified' | 'Rejected';
    verifiedAt?: string;
    isAvailable: boolean;
    status: 'active' | 'inactive' | 'suspended';

    // Relation
    user?: {
        id: string;
        email: string;
        phone: string;
        role: string;
        profile: {
            firstName: string;
            lastName: string;
            profilePhoto?: string;
            language?: string;
            country?: string;
        };
    };
}

// Patient type
export interface MedicalDocument {
    id: string;
    patientId: string;
    doctorId: string;
    category: 'exam_result' | 'derma_exam' | 'correspondence' | 'biopsy' | 'allergy_test' | 'other';
    title: string;
    description?: string;
    fileUrl: string;
    metadata?: any;
    date: string;
    createdAt: string;
}

export interface Patient extends BaseEntity {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string; // ISO String
    gender: 'Male' | 'Female' | 'Other';
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[]; // Kept for backward compatibility, mapped from history
    photoUrl?: string;
    status: 'Active' | 'Inactive';
    age: number; // Calculated field
    lastVisit?: string; // ISO String
    insuranceNumber?: string;
    healthId?: string;
    currentTreatments?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        startDate: string;
        prescribedBy?: string;
    }>;
    skinRiskFactors?: {
        sunExposure?: string;
        profession?: string;
        leisure?: string;
        habitat?: string;
        productsUsed?: string;
        familyHistoryCancer?: boolean;
        familyHistorySkin?: string;
    };
    medicalRecord?: {
        allergies: string[];
        history: any[];
        vaccines: { name: string; date: string }[];
        clinicalNotes?: string;
    };
}

export interface PatientStats {
    totalConsultations: number;
    lastVisit: string | null;
    insuranceStatus: string;
    visitsByMonth: { month: string; visits: number }[];
}

// Appointment type
export interface Appointment extends BaseEntity {
    patientId: string;
    patient?: Patient;
    doctorId: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    type: 'FirstConsultation' | 'FollowUp' | 'Dermatoscopy' | 'LaserTreatment' | 'Telemedicine';
    status: AppointmentStatus;
    notes?: string;
    isCritical?: boolean;
}

// Consultation type
export interface Consultation extends BaseEntity {
    appointmentId?: string;
    patientId: string;
    patient?: Patient;
    doctorId: string;
    date: string;
    chiefComplaint?: string;
    observations?: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    status: ConsultationStatus;
    photos?: ConsultationPhoto[];
    isPatientOnline?: boolean;
    scheduledDate?: string;
    durationMinutes?: number;
    consultationType?: string;
}

export interface ConsultationPhoto {
    id: string;
    url: string;
    type: 'dermatoscopic' | 'clinical' | 'beforeAfter';
    description?: string;
    takenAt: string;
}

// Prescription type
export interface Prescription extends BaseEntity {
    consultationId?: string;
    patientId: string;
    patient?: Patient;
    doctorId: string;
    diagnosis: string;
    medicines: PrescriptionMedicine[];
    notes?: string;
    sentAt?: string;
    pdfUrl?: string;
}

export interface PrescriptionMedicine {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

// Report type
export interface Report extends BaseEntity {
    consultationId?: string;
    patientId: string;
    patient?: Patient;
    doctorId: string;
    type: string;
    title: string;
    summary: string;
    status: ReportStatus;
    generatedAt: string;
}

// Notification type
export interface Notification extends BaseEntity {
    type: NotificationType;
    title: string;
    message: string;
    isRead: boolean;
    actionUrl?: string;
}

// Availability type
export interface AvailabilitySlot {
    id: string;
    start: string;
    end: string;
    isBooked?: boolean;
}

export interface DayAvailability {
    date: string;
    slots: AvailabilitySlot[];
}

// Telemedicine session type
export interface TelemedicineSession extends BaseEntity {
    appointmentId: string;
    patientId: string;
    patient?: Patient;
    doctorId: string;
    status: 'Waiting' | 'Active' | 'Ended';
    startedAt?: string;
    endedAt?: string;
    token?: string;
    roomUrl?: string;
}

// Dashboard stats type
export interface DashboardStats {
    totalPatients: number;
    totalAppointments: number;
    totalRevenue: number;
    totalConsultations: number;
    patientsChange: number;
    appointmentsChange: number;
    revenueChange: number;
    consultationsChange: number;
}

// Vitals type
export interface PatientVitals {
    height?: number;
    weight?: number;
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    recordedAt: string;
}

// Medical history event
export interface MedicalHistoryEvent {
    id: string;
    type: 'checkup' | 'vaccination' | 'consultation' | 'prescription' | 'labResult';
    title: string;
    description?: string;
    date: string;
}

export interface PatientPhoto {
    id: string;
    url: string;
    title: string;
    description?: string;
    date: string;
    type?: string;
}
