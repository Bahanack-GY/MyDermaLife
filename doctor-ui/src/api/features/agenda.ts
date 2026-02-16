import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Consultation } from '../types';

export const agendaApi = {
    getDailyAppointments: async (date: Date): Promise<Consultation[]> => {
        const response = await apiClient.get<Consultation[]>('/doctor/consultations/daily/schedule', {
            params: { date: date.toISOString() }
        });
        return response.data;
    },
    sendRecall: async (consultationId: string): Promise<any> => {
        const response = await apiClient.post(`/doctor/consultations/${consultationId}/recall`);
        return response.data;
    }
};

export const useDailyAppointments = (date: Date) => {
    return useQuery({
        queryKey: ['agenda', 'daily', date.toISOString().split('T')[0]],
        queryFn: () => agendaApi.getDailyAppointments(date),
    });
};

export const useSendRecall = () => {
    return useMutation({
        mutationFn: agendaApi.sendRecall,
    });
};
