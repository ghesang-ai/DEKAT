"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";
import { api } from "@/lib/api";

interface Gadget {
  id: string;
  name: string;
  brand: string;
  category: string;
  avgScore: number;
  imageUrl: string | null;
}

const FEATURED_IDS = [
  "ed19910e-48a7-461b-b87f-47ce3d7771ab", // iPhone 17 Pro Max
  "32062a42-d258-4310-bb42-760567e812a6", // Galaxy S26 Ultra
  "aacabfc3-4310-4a68-ba07-6f5f2a5ccd39", // MacBook Pro M5
  "5f4cccfe-a8ee-4eaf-aff1-a29d1dd40ea1", // AirPods Pro 3
  "eb1d2c80-2358-4257-8d2f-e934103dec5f", // Vivo X300 Pro
  "1c9dfa3c-b64f-4317-94e2-57fcaad2f82d", // Apple Watch Ultra 3
];

const CATEGORY_EMOJI: Record<string, string> = {
  smartphone: "📱",
  laptop: "💻",
  tablet: "📟",
  wearable: "⌚",
  audio: "🎧",
  other: "🔧",
};

export function GadgetTrending() {
  const router = useRouter();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);

  useEffect(() => {
    api.get("/gadgets?sort=trending&limit=20")
      .then((res) => {
        const all: Gadget[] = res.data;
        // Prioritize featured gadgets first, then fill with trending
        const featured = FEATURED_IDS
          .map((id) => all.find((g) => g.id === id))
          .filter(Boolean) as Gadget[];
        const rest = all.filter((g) => !FEATURED_IDS.includes(g.id)).slice(0, 4);
        setGadgets([...featured, ...rest].slice(0, 10));
      })
      .catch(() => {});
  }, []);

  if (gadgets.length === 0) return null;

  return (
    <div className="border-b border-border py-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2.5">
        🔥 Gadget Trending
      </p>
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
        {gadgets.map((g) => (
          <button
            key={g.id}
            onClick={() => router.push(`/gadget/${g.id}`)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden relative group-hover:border-foreground transition-colors">
              {g.imageUrl ? (
                <Image
                  src={g.imageUrl}
                  alt={g.name}
                  width={56}
                  height={56}
                  className="object-contain p-1"
                  unoptimized
                />
              ) : (
                <span className="text-2xl">{CATEGORY_EMOJI[g.category] ?? "📱"}</span>
              )}
              {g.avgScore > 0 && (
                <div className="absolute bottom-0.5 right-0.5 bg-white/95 rounded-md px-1 flex items-center gap-0.5">
                  <Star size={8} fill="#f59e0b" className="text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-600">{g.avgScore.toFixed(1)}</span>
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-foreground text-center leading-tight max-w-[68px] truncate">
              {g.name.replace(/"/g, '"')}
            </span>
            <span className="text-[10px] text-muted-foreground">{g.brand}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
