"use client";

import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/stores/auth";

function PendingBanner() {
  const user = useAuthStore((s) => s.user);
  if (!user || user.status === "active") return null;
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
      <p className="text-xs text-amber-800">
        ⏳ Akunmu sedang menunggu persetujuan admin. Kamu belum bisa membuat postingan.
      </p>
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PendingBanner />
      <main className="max-w-lg mx-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
