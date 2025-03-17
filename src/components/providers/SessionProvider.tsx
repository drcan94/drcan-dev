// src/components/providers/SessionProvider.tsx

"use client";

import {
  SessionProvider as AuthProvider,
  signOut,
  useSession,
} from "next-auth/react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface SessionEventData {
  type: "logout" | "warning" | "info" | "refresh";
  message: string;
  data?: {
    role?: string;
    [key: string]: unknown;
  };
}

export function SessionChecker({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession({
    required: false,
  });
  const router = useRouter();
  const lastActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!session?.user?.id) return;

    const handleActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivityRef.current;
      if (inactiveTime > 60 * 60 * 1000) {
        // 30 minutes
        void signOut({ redirect: true });
      }
    }, 60 * 1000); // Check every minute

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
      clearInterval(checkInactivity);
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const handleSessionEvent = (event: MessageEvent) => {
      const data = event.data as SessionEventData;
      if (!data || typeof data !== "object") return;

      switch (data.type) {
        case "logout":
          void signOut({ redirect: true });
          break;
        case "warning":
          toast.warning(data.message);
          break;
        case "info":
          toast.info(data.message);
          break;
        case "refresh":
          void update();

          break;
      }
    };

    window.addEventListener("message", handleSessionEvent);
    return () => window.removeEventListener("message", handleSessionEvent);
  }, [session?.user?.id, session, update, router]);

  return <>{children}</>;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionChecker>{children}</SessionChecker>
    </AuthProvider>
  );
}
