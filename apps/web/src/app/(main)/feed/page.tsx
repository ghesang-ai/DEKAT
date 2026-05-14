"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { PostCard } from "@/components/feed/PostCard";
import { StoriesRow } from "@/components/feed/StoriesRow";

interface Post {
  id: string;
  content: string;
  type: string;
  rating: number | null;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    trustScore: number;
  };
  gadget: {
    id: string;
    name: string;
    brand: string;
    imageUrl: string | null;
  } | null;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export default function FeedPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const fetchPosts = useCallback(async (p: number) => {
    try {
      const res = await api.get(`/posts?page=${p}&limit=10`);
      const data: Post[] = res.data.data ?? res.data;
      if (p === 1) {
        setPosts(data);
      } else {
        setPosts((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchPosts(1);
  }, [token, fetchPosts]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPosts(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <header className="sticky top-0 bg-background/80 backdrop-blur-xl border-b border-border z-10 px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-bold tracking-tight">DEKAT</span>
      </header>

      <StoriesRow />

      <div className="divide-y divide-border">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <p className="text-sm">Belum ada postingan</p>
            <p className="text-xs">Ikuti orang-orang untuk melihat postingan mereka</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {hasMore && posts.length > 0 && (
        <div className="flex justify-center py-6">
          <button
            onClick={loadMore}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Muat lebih banyak
          </button>
        </div>
      )}
    </div>
  );
}
