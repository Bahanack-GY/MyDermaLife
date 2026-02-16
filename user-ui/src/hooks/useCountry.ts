import { useQuery } from '@tanstack/react-query';

interface CountryData {
  country: string;
  countryCode: string;
}

const ALLOWED_COUNTRIES = ['CM', 'CI']; // Cameroon, Ivory Coast

async function fetchCountry(): Promise<CountryData> {
  const res = await fetch('https://ipapi.co/json/');
  if (!res.ok) throw new Error('Failed to detect country');
  const data = await res.json();
  return {
    country: data.country_name,
    countryCode: data.country_code,
  };
}

export function useCountry() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-country'],
    queryFn: fetchCountry,
    staleTime: Infinity, // Country won't change during a session
    gcTime: Infinity,
    retry: 1,
  });

  const isAllowed = data ? ALLOWED_COUNTRIES.includes(data.countryCode) : false;

  return {
    country: data?.country ?? null,
    countryCode: data?.countryCode ?? null,
    isLoading,
    error,
    isAllowed,
  };
}
