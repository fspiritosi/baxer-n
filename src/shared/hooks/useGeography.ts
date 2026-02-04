'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCountriesForSelect,
  getProvincesForSelect,
  getCitiesForSelect,
  getCitiesByProvince,
} from '@/shared/actions/geography';

/**
 * Hook para obtener países para select
 */
export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: getCountriesForSelect,
    staleTime: 1000 * 60 * 60, // 1 hora - datos que no cambian frecuentemente
  });
}

/**
 * Hook para obtener provincias para select
 */
export function useProvinces() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: getProvincesForSelect,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para obtener todas las ciudades para select
 */
export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: getCitiesForSelect,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para obtener ciudades filtradas por provincia
 */
export function useCitiesByProvince(provinceId: number | null | undefined) {
  return useQuery({
    queryKey: ['cities', 'byProvince', provinceId],
    queryFn: () => getCitiesByProvince(provinceId!),
    enabled: !!provinceId,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
