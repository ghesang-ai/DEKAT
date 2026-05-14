"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusCircle, GitCompare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/feed", label: "Beranda", icon: Home },
  { href: "/explore", label: "Jelajah", icon: Compass },
  { href: "/post/new", label: "Post", icon: PlusCircle },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/profile", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-xl border-t border-border z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const isPost = href === "/post/new";
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-colors",
                isPost
                  ? "text-foreground"
                  : active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                size={isPost ? 26 : 22}
                strokeWidth={active || isPost ? 2.5 : 1.8}
                className={cn(isPost && "text-foreground")}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
