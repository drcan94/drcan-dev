import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
}

export function LoadingIndicator({ className }: LoadingIndicatorProps) {
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998] bg-background/50 backdrop-blur-[2px]" />

      {/* Loading indicator */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background px-8 py-4 shadow-2xl",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
          <span className="text-base font-medium">Yükleniyor...</span>
        </div>
      </div>
    </>
  );
}
