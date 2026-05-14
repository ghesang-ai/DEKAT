"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Gadget {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string | null;
  avgScore: number;
  reviewCount: number;
}

const CATEGORIES = ["semua", "smartphone", "laptop", "tablet", "wearable", "audio", "other"];

export default function ExplorePage() {
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) router.push("/login");
  }, [token, router]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "semua") params.set("category", category);
      const res = await api.get(`/gadgets?${params}`);
      setGadgets(res.data.data ?? res.data);
    } catch {
      setGadgets([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    if (!token) return;
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load, token]);

  return (
    <div>
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10 px-4 py-3 space-y-3">
        <span className="text-xl font-bold tracking-tight">Jelajah</span>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8 text-sm h-9"
            placeholder="Cari gadget..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize ${
                category === cat
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse h-44" />
            ))}
          </div>
        ) : gadgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-muted-foreground">
            <p className="text-sm">Gadget tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gadgets.map((g) => (
              <Link key={g.id} href={`/gadget/${g.id}`}>
                <div className="rounded-2xl border border-border bg-card p-3 space-y-2.5 hover:bg-muted transition-colors">
                  <div className="w-full aspect-square rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                    {g.imageUrl ? (
                      <Image src={g.imageUrl} alt={g.name} width={100} height={100} className="object-contain w-full h-full p-2" />
                    ) : (
                      <span className="text-4xl">📱</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground">{g.brand}</p>
                    <p className="text-xs font-semibold leading-tight line-clamp-2">{g.name}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 capitalize">{g.category}</Badge>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-semibold">{g.avgScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
