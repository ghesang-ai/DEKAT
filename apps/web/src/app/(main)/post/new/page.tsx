"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Camera, X, Search, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const POST_TYPES = [
  { value: "review", label: "Review" },
  { value: "photo", label: "Foto" },
  { value: "video", label: "Video" },
  { value: "discussion", label: "Diskusi" },
] as const;

const schema = z.object({
  content: z.string().min(1, "Konten tidak boleh kosong").max(2000),
  type: z.enum(["review", "photo", "video", "discussion"]),
  gadgetId: z.string().optional(),
  rating: z.number().min(1).max(10).optional(),
});

type FormData = z.infer<typeof schema>;

interface Gadget {
  id: string;
  name: string;
  brand: string;
  imageUrl: string | null;
}

export default function NewPostPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [gadgetSearch, setGadgetSearch] = useState("");
  const [gadgetResults, setGadgetResults] = useState<Gadget[]>([]);
  const [selectedGadget, setSelectedGadget] = useState<Gadget | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "discussion" },
  });

  const postType = watch("type");

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  // Gadget search
  useEffect(() => {
    if (!gadgetSearch.trim()) { setGadgetResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get(`/gadgets?search=${encodeURIComponent(gadgetSearch)}&limit=5`);
        setGadgetResults(res.data.data ?? res.data);
      } catch { setGadgetResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [gadgetSearch]);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/media/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMediaUrls((prev) => [...prev, res.data.url]);
    } catch {
      alert("Upload gagal. Coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/posts", {
        ...data,
        gadgetId: selectedGadget?.id,
        rating: postType === "review" ? ratingValue || undefined : undefined,
        mediaUrls,
      });
      router.push("/feed");
    } catch {
      alert("Gagal membuat post. Coba lagi.");
    }
  };

  return (
    <div>
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10 px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-sm">Post Baru</span>
        <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="px-4 py-5 space-y-5">
        {/* Post type */}
        <div className="space-y-2">
          <Label className="text-xs">Tipe Postingan</Label>
          <div className="flex gap-2 flex-wrap">
            {POST_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue("type", value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  postType === value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Gadget picker */}
        <div className="space-y-2">
          <Label className="text-xs">Gadget (opsional)</Label>
          {selectedGadget ? (
            <div className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
              {selectedGadget.imageUrl && (
                <Image src={selectedGadget.imageUrl} alt={selectedGadget.name} width={24} height={24} className="object-contain" />
              )}
              <span className="text-xs font-medium flex-1">{selectedGadget.brand} {selectedGadget.name}</span>
              <button
                type="button"
                onClick={() => { setSelectedGadget(null); setValue("gadgetId", undefined); }}
                className="text-muted-foreground"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8 text-sm"
                placeholder="Cari gadget..."
                value={gadgetSearch}
                onChange={(e) => setGadgetSearch(e.target.value)}
              />
              {gadgetResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full border border-border rounded-xl bg-background shadow-md divide-y divide-border z-10">
                  {gadgetResults.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setSelectedGadget(g);
                        setValue("gadgetId", g.id);
                        setGadgetSearch("");
                        setGadgetResults([]);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left"
                    >
                      <span className="text-xs font-medium">{g.brand} {g.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rating — only for review */}
        {postType === "review" && (
          <div className="space-y-2">
            <Label className="text-xs">Rating (1–10)</Label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRatingValue(i + 1)}
                  className={cn(
                    "w-7 h-7 rounded-lg text-xs font-semibold transition-colors",
                    ratingValue >= i + 1 ? "bg-amber-400 text-white" : "bg-muted text-muted-foreground"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-2">
          <Label className="text-xs">Konten</Label>
          <textarea
            {...register("content")}
            rows={5}
            placeholder={postType === "review" ? "Tulis review kamu..." : postType === "discussion" ? "Mulai diskusi..." : "Caption..."}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
          {errors.content && <p className="text-destructive text-xs">{errors.content.message}</p>}
        </div>

        {/* Media upload */}
        <div className="space-y-2">
          <Label className="text-xs">Media (opsional)</Label>
          <div className="flex gap-2 flex-wrap">
            {mediaUrls.map((url, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setMediaUrls((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                >
                  <X size={10} className="text-white" />
                </button>
              </div>
            ))}
            {mediaUrls.length < 4 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
              >
                <Camera size={18} />
                <span className="text-[10px]">{uploading ? "Upload..." : "Tambah"}</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
              e.target.value = "";
            }}
          />
        </div>
      </form>
    </div>
  );
}
