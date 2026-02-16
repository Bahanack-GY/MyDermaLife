/**
 * API Configuration
 * Central configuration file for all API-related settings
 */

// Base URL for the API - reads from environment variable with fallback
// Force WSS/HTTPS for non-localhost or if page is loaded via HTTPS
// export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL ||
//     (window.location.protocol === 'https:' || window.location.hostname !== 'localhost'
//         ? `https://${window.location.hostname}:3070/api/v1`
//         : `http://${window.location.hostname}:3070/api/v1`);
export const API_BASE_URL = 'https://api.myderma.evols.online/api/v1';

// API endpoints grouped by feature
export const API_ENDPOINTS = {
    // Auth endpoints
    auth: {
        login: '/auth/doctor/login',
        logout: '/auth/logout',
        refresh: '/auth/refresh',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password',
        profile: '/auth/doctor/profile',
        updateProfilePhoto: '/users/profile/photo',
    },

    // Dashboard endpoints
    dashboard: {
        stats: '/doctor/dashboard/stats',
        recentActivity: '/doctor/dashboard/recent-activity',
        upcomingAppointments: '/doctor/dashboard/upcoming-appointments',
        analytics: '/doctor/dashboard/analytics',
    },

    // Patients endpoints
    patients: {
        list: '/doctor/patients',
        detail: (id: string) => `/doctor/patients/${id}`,
        create: '/doctor/patients',
        update: (id: string) => `/doctor/patients/${id}`,
        delete: (id: string) => `/doctor/patients/${id}`,
        search: '/doctor/patients/search',
        medicalHistory: (id: string) => `/doctor/patients/${id}/medical-history`,
        photos: (id: string) => `/doctor/patients/${id}/photos`,
        vitals: (id: string) => `/doctor/patients/${id}/vitals`,
        stats: (id: string) => `/doctor/patients/${id}/stats`,
    },

    // Appointments/Agenda endpoints
    appointments: {
        list: '/doctor/appointments',
        detail: (id: string) => `/doctor/appointments/${id}`,
        create: '/doctor/appointments',
        update: (id: string) => `/doctor/appointments/${id}`,
        cancel: (id: string) => `/doctor/appointments/${id}/cancel`,
        reschedule: (id: string) => `/doctor/appointments/${id}/reschedule`,
        byDate: (date: string) => `/doctor/appointments/date/${date}`,
        upcoming: '/doctor/appointments/upcoming',
    },

    // Consultations endpoints
    consultations: {
        list: '/doctor/consultations',
        detail: (id: string) => `/doctor/consultations/${id}`,
        create: '/doctor/consultations',
        update: (id: string) => `/doctor/consultations/${id}`,
        complete: (id: string) => `/doctor/consultations/${id}/complete`,
        notes: (id: string) => `/doctor/consultations/${id}/notes`,
        diagnosis: (id: string) => `/doctor/consultations/${id}/diagnosis`,
        syncStats: '/doctor/consultations/sync-stats',
        recording: (id: string) => `/doctor/consultations/${id}/recording`,
    },

    // Telemedicine endpoints
    telemedicine: {
        sessions: '/doctor/telemedicine/sessions',
        sessionDetail: (id: string) => `/doctor/telemedicine/sessions/${id}`,
        startSession: '/doctor/telemedicine/sessions/start',
        endSession: (id: string) => `/doctor/telemedicine/sessions/${id}/end`,
        getToken: (id: string) => `/doctor/telemedicine/sessions/${id}/token`,
        sendReminder: (id: string) => `/doctor/telemedicine/sessions/${id}/reminder`,
    },

    // Reports endpoints
    reports: {
        list: '/doctor/reports',
        detail: (id: string) => `/doctor/reports/${id}`,
        create: '/doctor/reports',
        update: (id: string) => `/doctor/reports/${id}`,
        delete: (id: string) => `/doctor/reports/${id}`,
        download: (id: string) => `/doctor/reports/${id}/download`,
        generate: '/doctor/reports/generate',
    },

    // Prescriptions endpoints
    prescriptions: {
        list: '/prescriptions/my',
        detail: (id: string) => `/prescriptions/${id}`,
        create: '/prescriptions',
        send: (id: string) => `/prescriptions/${id}/send`,
        download: (id: string) => `/prescriptions/${id}/download`,
    },

    // Notifications endpoints
    notifications: {
        list: '/doctor/notifications',
        markRead: (id: string) => `/doctor/notifications/${id}/read`,
        markAllRead: '/doctor/notifications/read-all',
        unreadCount: '/doctor/notifications/unread-count',
    },

    // Availability endpoints
    availability: {
        list: '/doctor/availability',
        byDate: (date: string) => `/doctor/availability/date/${date}`,
        update: '/doctor/availability',
        slots: (date: string) => `/doctor/availability/slots/${date}`,
        globalSettings: '/doctor/availability/settings',
    },
} as const;

// Query keys for TanStack Query caching
export const QUERY_KEYS = {
    // Auth
    profile: ['auth', 'profile'],

    // Dashboard
    dashboardStats: ['dashboard', 'stats'],
    recentActivity: ['dashboard', 'recentActivity'],
    upcomingAppointments: ['dashboard', 'upcomingAppointments'],
    analytics: ['dashboard', 'analytics'],

    // Patients
    patients: ['patients'],
    patient: (id: string) => ['patients', id],
    patientMedicalHistory: (id: string) => ['patients', id, 'medicalHistory'],
    patientPhotos: (id: string) => ['patients', id, 'photos'],
    patientVitals: (id: string) => ['patients', id, 'vitals'],

    // Appointments
    appointments: ['appointments'],
    appointment: (id: string) => ['appointments', id],
    appointmentsByDate: (date: string) => ['appointments', 'date', date],

    // Consultations
    consultations: ['consultations'],
    consultation: (id: string) => ['consultations', id],

    // Telemedicine
    telemedicineSessions: ['telemedicine', 'sessions'],
    telemedicineSession: (id: string) => ['telemedicine', 'sessions', id],

    // Reports
    reports: ['reports'],
    report: (id: string) => ['reports', id],

    // Prescriptions
    prescriptions: ['prescriptions'],
    prescription: (id: string) => ['prescriptions', id],

    // Notifications
    notifications: ['notifications'],
    unreadNotificationsCount: ['notifications', 'unreadCount'],

    // Availability
    availability: ['availability'],
    availabilityByDate: (date: string) => ['availability', 'date', date],
    availabilitySlots: (date: string) => ['availability', 'slots', date],
} as const;
