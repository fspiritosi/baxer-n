'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para hacer debounce de un valor
 *
 * @param value - El valor a debounce
 * @param delay - El tiempo de delay en ms (default: 300)
 * @returns El valor con debounce
 *
 * @example
 * ```tsx
 * const [search, setSearch] = useState('');
 * const debouncedSearch = useDebounce(search, 300);
 *
 * // Usar debouncedSearch para queries
 * useQuery({
 *   queryKey: ['search', debouncedSearch],
 *   queryFn: () => searchApi(debouncedSearch),
 * });
 * ```
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
