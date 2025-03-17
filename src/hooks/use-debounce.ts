// File: src/hooks/use-debounce.ts
import { useState, useEffect, useRef } from "react";

/**
 * useDebounce hook
 * @param value - Değeri debounce etmek için
 * @param delay - Gecikme süresi (ms), varsayılan 500ms
 * @returns Debounce edilmiş değer
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
}
