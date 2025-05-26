
"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface FullPageLoaderProps {
  message?: string;
  className?: string;
}

export function FullPageLoader({ message = "Cargando...", className }: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex h-screen flex-col items-center justify-center space-y-4 bg-background/80 backdrop-blur-sm selection:bg-primary/40 selection:text-white",
        className
      )}
    >
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      {message && <p className="text-lg text-muted-foreground">{message}</p>}
    </div>
  );
}

interface InlineLoaderProps {
  message?: string;
  className?: string;
  iconSize?: number;
  textSize?: string;
}

export function InlineLoader({
  message,
  className,
  iconSize = 8,
  textSize = "text-base",
}: InlineLoaderProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-3 py-4", className)}>
      <Loader2 className={`h-${iconSize} w-${iconSize} animate-spin text-primary`} />
      {message && <p className={`${textSize} text-muted-foreground`}>{message}</p>}
    </div>
  );
}
