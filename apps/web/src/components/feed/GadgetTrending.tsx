"use client";

import { useRouter } from "next/navigation";

const GADGETS = [
  { id: "d87dba92-e880-416a-b093-e0b6a187dcfe", name: "iPhone 17", brand: "Apple", emoji: "📱" },
  { id: "32062a42-d258-4310-bb42-760567e812a6", name: "S26 Ultra", brand: "Samsung", emoji: "📲" },
  { id: "aacabfc3-4310-4a68-ba07-6f5f2a5ccd39", name: "MacBook M5", brand: "Apple", emoji: "💻" },
  { id: "5f4cccfe-a8ee-4eaf-aff1-a29d1dd40ea1", name: "AirPods Pro 3", brand: "Apple", emoji: "🎧" },
  { id: "eb1d2c80-2358-4257-8d2f-e934103dec5f", name: "Vivo X300 Pro", brand: "Vivo", emoji: "📸" },
  { id: "1c9dfa3c-b64f-4317-94e2-57fcaad2f82d", name: "Watch Ultra 3", brand: "Apple", emoji: "⌚" },
];

export function GadgetTrending() {
  const router = useRouter();

  return (
    <div className="border-b border-border py-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2.5">
        🔥 Gadget Trending
      </p>
      <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none pb-1">
        {GADGETS.map((g) => (
          <button
            key={g.id}
            onClick={() => router.push(`/gadget/${g.id}`)}
            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center group-hover:border-foreground transition-colors">
              <span className="text-2xl">{g.emoji}</span>
            </div>
            <span className="text-[11px] font-medium text-foreground text-center leading-tight max-w-[68px] truncate">
              {g.name}
            </span>
            <span className="text-[10px] text-muted-foreground">{g.brand}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
