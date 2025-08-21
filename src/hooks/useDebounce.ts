import { useEffect, useRef } from "react";

type Timer = ReturnType<typeof setTimeout>;

export function useDebounce(
  func: Function,
  delay = 500
) {
  const timer = useRef<Timer>();

  useEffect(() => {
    return () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
    };
  }, []);

  const debouncedFunction = ((...args: any[]) => {
    const newTimer = setTimeout(() => {
      func(...args);
    }, delay);
    clearTimeout(timer.current);
    timer.current = newTimer;
  }) as Function;

  return debouncedFunction;
}