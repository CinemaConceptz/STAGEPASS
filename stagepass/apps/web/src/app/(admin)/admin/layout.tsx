"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (!db) { setIsAdmin(false); return; }
    getDoc(doc(db, "users", user.uid)).then(snap => {
      if (snap.exists() && snap.data()?.isAdmin) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push("/");
      }
    });
  }, [user, loading, router]);

  if (loading || isAdmin === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white/20 border-t-stage-mint rounded-full animate-spin" />
      </main>
    );
  }

  if (!isAdmin) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
  );
}
