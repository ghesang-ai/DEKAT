"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser, token, _hasHydrated } = useAuthStore();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) { router.push("/login"); return; }
    if (user) {
      setDisplayName(user.displayName ?? "");
      setBio(user.bio ?? "");
      setAvatarUrl(user.avatarUrl ?? "");
    }
  }, [user, token, _hasHydrated]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/media/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(res.data.url);
    } catch {
      setError("Gagal upload foto");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) { setError("Nama tidak boleh kosong"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await api.patch("/auth/profile", {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl || null,
      });
      updateUser({
        displayName: res.data.displayName,
        bio: res.data.bio,
        avatarUrl: res.data.avatarUrl,
      });
      router.push("/profile");
    } catch {
      setError("Gagal menyimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold">Edit Profil</span>
      </header>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-3xl">{(displayName || user.displayName)[0]}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center shadow"
            >
              {uploading
                ? <div className="w-3 h-3 border border-background border-t-transparent rounded-full animate-spin" />
                : <Camera size={14} />
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground -mt-4">Ketuk ikon kamera untuk ganti foto</p>

        {/* Fields */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nama Lengkap</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nama kamu"
              maxLength={60}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input value={`@${user.username}`} disabled className="text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Username tidak bisa diubah</p>
          </div>

          <div className="space-y-1.5">
            <Label>Bio</Label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan sedikit tentang kamu..."
              maxLength={150}
              rows={4}
              className="w-full text-sm border border-input rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
          </div>
        </div>

        {error && <p className="text-destructive text-sm text-center">{error}</p>}

        <Button onClick={handleSave} disabled={saving || uploading} size="lg" className="w-full">
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}
