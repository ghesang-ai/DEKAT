"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { LayoutDashboard, FileText, Users, Ticket, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "Moderasi Post", icon: FileText },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/invites", label: "Invite Code", icon: Ticket },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, logout, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) { router.push("/login"); return; }
    if (user && user.role !== "admin") router.push("/feed");
  }, [token, user, router, _hasHydrated]);

  if (!_hasHydrated || !user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-background border-r border-border flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="px-5 py-4 border-b border-border">
          <span className="font-bold text-lg tracking-tight">DEKAT</span>
          <span className="ml-2 text-[10px] bg-foreground text-background px-1.5 py-0.5 rounded-md font-medium">ADMIN</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  active ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 min-h-screen">
        {children}
      </main>
    </div>
  );
}
