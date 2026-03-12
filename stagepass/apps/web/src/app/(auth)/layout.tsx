"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/studio");
    }
  }, [user, loading, router]);

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      {children}
    </main>
  );
}
