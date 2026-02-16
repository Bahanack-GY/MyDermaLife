import { useQuery } from '@tanstack/react-query';
import { doctorsApi } from '../api/features/doctors';
import { QUERY_KEYS } from '../api/config';
import { format } from 'date-fns';

export const useDoctors = () => {
    return useQuery({
        queryKey: QUERY_KEYS.doctors,
        queryFn: () => doctorsApi.getAll(),
        retry: 2, // Retry failed requests up to 2 times
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
        staleTime: 1000 * 60 * 5, // 5 minutes - cache the data
        gcTime: 1000 * 60 * 10, // 10 minutes - keep in cache
    });
};

export const useDoctor = (id: string) => {
    return useQuery({
        queryKey: ['doctors', id],
        queryFn: () => doctorsApi.getById(id),
        enabled: !!id,
    });
};

export const useBookedSlots = (doctorId: string | undefined, date: Date | null) => {
    const formattedDate = date ? format(date, 'yyyy-MM-dd') : null;
    return useQuery({
        queryKey: ['bookedSlots', doctorId, formattedDate],
        queryFn: () => doctorsApi.getBookedSlots(doctorId!, formattedDate!),
        enabled: !!doctorId && !!date,
        initialData: [],
    });
};
