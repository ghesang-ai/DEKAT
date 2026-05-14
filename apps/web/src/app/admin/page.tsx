"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Cpu, Ticket } from "lucide-react";
import { api } from "@/lib/api";

interface Stats {
  users: number;
  posts: number;
  gadgets: number;
  activeInvites: number;
  pendingCompares: number;
}

const statCards = (s: Stats) => [
  { label: "Total Pengguna", value: s.users, icon: Users, color: "bg-blue-50 text-blue-600" },
  { label: "Total Post", value: s.posts, icon: FileText, color: "bg-green-50 text-green-600" },
  { label: "Total Gadget", value: s.gadgets, icon: Cpu, color: "bg-purple-50 text-purple-600" },
  { label: "Invite Aktif", value: s.activeInvites, icon: Ticket, color: "bg-amber-50 text-amber-600" },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview platform DEKAT</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards(stats).map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-background rounded-2xl border border-border p-5 space-y-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-background rounded-2xl border border-border p-5 h-28 animate-pulse" />
          ))}
        </div>
      )}

      {(stats?.pendingCompares ?? 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-800 font-medium">
            ⚠️ {stats?.pendingCompares} AI comparison sedang pending
          </p>
        </div>
      )}
    </div>
  );
}
