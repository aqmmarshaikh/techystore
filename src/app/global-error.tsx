"use client";

import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center px-4">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border max-w-lg w-full">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Critical System Error</h2>
            <p className="text-muted-foreground mb-8 text-sm">
              A critical error prevented the application from rendering. Please try refreshing the page or clearing your browser cache.
            </p>
            <Button onClick={() => reset()} className="w-full h-12 rounded-xl">
              Reload Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
