import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService } from '../services/doctor.service';
import type { DoctorFormData, DoctorListParams } from '../services/doctor.service';
import { showErrorToast, showSuccessToast } from '../utils/errorHandler';

// Query keys
export const doctorKeys = {
  all: ['doctors'] as const,
  lists: () => [...doctorKeys.all, 'list'] as const,
  list: (params?: DoctorListParams) => [...doctorKeys.lists(), params] as const,
  details: () => [...doctorKeys.all, 'detail'] as const,
  detail: (id: string) => [...doctorKeys.details(), id] as const,
};

// Get all doctors
export const useDoctors = (params?: DoctorListParams) => {
  return useQuery({
    queryKey: doctorKeys.list(params),
    queryFn: () => doctorService.getDoctors(params),
  });
};

// Get doctor by ID
export const useDoctor = (id: string) => {
  return useQuery({
    queryKey: doctorKeys.detail(id),
    queryFn: () => doctorService.getDoctorById(id),
    enabled: !!id,
  });
};

// Create doctor
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DoctorFormData) => doctorService.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      showSuccessToast('Doctor created successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Update doctor
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DoctorFormData> }) =>
      doctorService.updateDoctor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: doctorKeys.detail(variables.id) });
      showSuccessToast('Doctor updated successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};

// Delete doctor
export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => doctorService.deleteDoctor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.lists() });
      showSuccessToast('Doctor deleted successfully!');
    },
    onError: (error: unknown) => {
      showErrorToast(error);
    },
  });
};
