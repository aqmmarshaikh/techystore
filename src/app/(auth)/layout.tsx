import { GuestRoute } from "@/components/auth/GuestRoute";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestRoute>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </GuestRoute>
  );
}
