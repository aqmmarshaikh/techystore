"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error Captured:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-destructive" />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8">
        We apologize for the inconvenience. An unexpected error occurred while loading this page. Our engineers have been notified.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} size="lg" className="rounded-full px-8">
          Try again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="outline" size="lg" className="rounded-full px-8">
          Go Home
        </Button>
      </div>
    </div>
  );
}
