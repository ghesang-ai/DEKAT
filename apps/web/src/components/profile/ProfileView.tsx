"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, Camera, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/feed/PostCard";

interface Profile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  trustScore: number;
  _count: { posts: number; followers: number; following: number };
  isFollowing?: boolean;
}

interface Post {
  id: string;
  content: string;
  type: string;
  rating: number | null;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isLiked?: boolean;
  isBookmarked?: boolean;
  user: { id: string; username: string; displayName: string; avatarUrl: string | null; trustScore: number };
  gadget: { id: string; name: string; brand: string; imageUrl: string | null } | null;
}

function EditProfileModal({ profile, onClose, onSave }: {
  profile: Profile;
  onClose: () => void;
  onSave: (updated: Partial<Profile>) => void;
}) {
  const { updateUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/media/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setAvatarUrl(res.data.url);
    } catch { } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      const res = await api.patch("/auth/profile", {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl || null,
      });
      updateUser({ displayName: res.data.displayName, bio: res.data.bio, avatarUrl: res.data.avatarUrl });
      onSave({ displayName: res.data.displayName, bio: res.data.bio, avatarUrl: res.data.avatarUrl });
      onClose();
    } catch { } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Edit Profil</h2>
          <button onClick={onClose}><X size={20} className="text-muted-foreground" /></button>
        </div>

        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">{displayName[0]}</AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center"
            >
              {uploading ? <div className="w-3 h-3 border border-background border-t-transparent rounded-full animate-spin" /> : <Camera size={12} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nama Lengkap</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nama kamu" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ceritakan sedikit tentang kamu..."
              maxLength={150}
              rows={3}
              className="w-full text-sm border border-input rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/150</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Batal</Button>
          <Button className="flex-1" onClick={handleSave} disabled={saving || !displayName.trim()}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProfileView({ username, isOwn }: { username: string; isOwn: boolean }) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, postsRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/users/${username}/posts?limit=20`),
        ]);
        setProfile(pRes.data);
        setFollowing(pRes.data.isFollowing ?? false);
        setPosts(postsRes.data.data ?? postsRes.data);
      } catch {
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [username, router]);

  const toggleFollow = async () => {
    try {
      await api.post(`/users/${username}/follow`);
      setFollowing((f) => !f);
      setProfile((p) => p ? {
        ...p,
        _count: { ...p._count, followers: p._count.followers + (following ? -1 : 1) },
      } : p);
    } catch { }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  return (
    <div>
      {showEdit && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEdit(false)}
          onSave={(updated) => setProfile((p) => p ? { ...p, ...updated } : p)}
        />
      )}

      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10 px-4 py-3 flex items-center justify-between">
        {isOwn ? (
          <span className="text-lg font-bold">{profile.username}</span>
        ) : (
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
        )}
        {isOwn && (
          <button onClick={() => { logout(); router.push("/login"); }} className="text-muted-foreground hover:text-foreground">
            <LogOut size={18} />
          </button>
        )}
        {!isOwn && <span className="font-semibold text-sm">{profile.username}</span>}
      </header>

      <div className="px-4 py-5 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={profile.avatarUrl ?? undefined} />
            <AvatarFallback className="text-2xl">{profile.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex justify-around">
            {[
              { label: "Post", value: profile._count.posts },
              { label: "Pengikut", value: profile._count.followers },
              { label: "Mengikuti", value: profile._count.following },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <span className="text-lg font-bold">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{profile.displayName}</span>
            {profile.trustScore > 0 && (
              <Badge variant="secondary" className="text-[10px]">⭐ {profile.trustScore.toFixed(1)}</Badge>
            )}
          </div>
          {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
        </div>

        {isOwn ? (
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowEdit(true)}>
            Edit Profil
          </Button>
        ) : (
          <Button size="sm" className="w-full" variant={following ? "outline" : "default"} onClick={toggleFollow}>
            {following ? "Berhenti Mengikuti" : "Ikuti"}
          </Button>
        )}
      </div>

      <div className="border-t border-border">
        <div className="divide-y divide-border">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <p className="text-sm">Belum ada postingan</p>
            </div>
          ) : (
            posts.map((p) => <PostCard key={p.id} post={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
