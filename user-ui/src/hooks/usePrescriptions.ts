import { useQuery } from '@tanstack/react-query';
import { prescriptionsApi } from '../api/features/prescriptions';
import { QUERY_KEYS } from '../api/config';

export const usePrescriptions = () => {
    return useQuery({
        queryKey: QUERY_KEYS.prescriptions,
        queryFn: () => prescriptionsApi.getMyPrescriptions(),
    });
};
