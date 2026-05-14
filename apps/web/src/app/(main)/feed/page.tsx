"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { PostCard } from "@/components/feed/PostCard";
import { StoriesRow } from "@/components/feed/StoriesRow";
import { cn } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  type: string;
  rating: number | null;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  user: { id: string; username: string; displayName: string; avatarUrl: string | null; trustScore: number };
  gadget: { id: string; name: string; brand: string; imageUrl: string | null } | null;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

type Tab = "following" | "semua";

export default function FeedPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [tab, setTab] = useState<Tab>("semua");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  const fetchPosts = useCallback(async (p: number, currentTab: Tab) => {
    try {
      const url = currentTab === "following"
        ? `/posts/feed`
        : `/posts?page=${p}&limit=15`;
      const res = await api.get(url);
      const data: Post[] = res.data.data ?? res.data;
      if (p === 1) setPosts(data);
      else setPosts((prev) => [...prev, ...data]);
      setHasMore(currentTab === "semua" ? data.length === 15 : false);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setPage(1);
    setPosts([]);
    fetchPosts(1, tab);
  }, [token, tab, fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next, tab);
  };

  return (
    <div>
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold tracking-tight">DEKAT</span>
        </div>
        <div className="flex gap-1">
          {(["semua", "following"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "semua" ? "Semua" : "Mengikuti"}
            </button>
          ))}
        </div>
      </header>

      <StoriesRow />

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="divide-y divide-border">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              {tab === "following" ? (
                <>
                  <p className="text-sm font-medium">Belum ada postingan</p>
                  <p className="text-xs">Ikuti orang untuk melihat postingan mereka di sini</p>
                  <button onClick={() => setTab("semua")} className="text-sm font-semibold text-foreground underline mt-1">
                    Lihat semua postingan
                  </button>
                </>
              ) : (
                <p className="text-sm">Belum ada postingan</p>
              )}
            </div>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      )}

      {hasMore && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <button onClick={loadMore} className="text-sm text-muted-foreground hover:text-foreground">
            Muat lebih banyak
          </button>
        </div>
      )}
    </div>
  );
}
