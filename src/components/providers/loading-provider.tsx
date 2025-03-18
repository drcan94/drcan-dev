"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  Suspense,
} from "react";
import { LoadingIndicator } from "@/components/loading-indicator";

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Create a client component that uses the hooks
function LoadingProviderClient({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading state when navigation is complete
  useEffect(() => {
    setIsChanging(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Set loading state when navigation starts
  useEffect(() => {
    if (isChanging) {
      setIsLoading(true);
    }
  }, [isChanging]);

  // Listen for click events on links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (link?.href && !link.href.startsWith("#") && !link.target) {
        setIsChanging(true);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingIndicator />}
      {children}
    </LoadingContext.Provider>
  );
}

// Export a wrapper component that includes Suspense
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <LoadingProviderClient>{children}</LoadingProviderClient>
    </Suspense>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
