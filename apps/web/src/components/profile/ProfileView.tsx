"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings, LogOut } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function ProfileView({ username, isOwn }: { username: string; isOwn: boolean }) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, postsRes] = await Promise.all([
          api.get(`/users/${username}`),
          api.get(`/posts?username=${username}&limit=20`),
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
        _count: {
          ...p._count,
          followers: p._count.followers + (following ? -1 : 1),
        },
      } : p);
    } catch { /* silent */ }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return null;

  return (
    <div>
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10 px-4 py-3 flex items-center justify-between">
        {isOwn ? (
          <span className="text-lg font-bold">{profile.username}</span>
        ) : (
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
        )}
        {isOwn && (
          <button onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
            <LogOut size={18} />
          </button>
        )}
        {!isOwn && <span className="font-semibold text-sm">{profile.username}</span>}
      </header>

      <div className="px-4 py-5 space-y-4">
        {/* Avatar + stats */}
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

        {/* Name + bio */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{profile.displayName}</span>
            {profile.trustScore > 0 && (
              <Badge variant="secondary" className="text-[10px]">
                ⭐ {profile.trustScore.toFixed(1)}
              </Badge>
            )}
          </div>
          {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}
        </div>

        {/* Action button */}
        {isOwn ? (
          <Button variant="outline" size="sm" className="w-full">
            Edit Profil
          </Button>
        ) : (
          <Button
            size="sm"
            className="w-full"
            variant={following ? "outline" : "default"}
            onClick={toggleFollow}
          >
            {following ? "Berhenti Mengikuti" : "Ikuti"}
          </Button>
        )}
      </div>

      {/* Posts */}
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
