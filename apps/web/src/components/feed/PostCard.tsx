"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Star, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/time";

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
}

export function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked ?? false);

  const toggleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/posts/${post.id}/like`);
        setLikeCount((n) => n - 1);
      } else {
        await api.post(`/posts/${post.id}/like`);
        setLikeCount((n) => n + 1);
      }
      setLiked(!liked);
    } catch {
      // silently fail
    }
  };

  const toggleBookmark = async () => {
    try {
      if (bookmarked) {
        await api.delete(`/posts/${post.id}/bookmark`);
      } else {
        await api.post(`/posts/${post.id}/bookmark`);
      }
      setBookmarked(!bookmarked);
    } catch {
      // silently fail
    }
  };

  return (
    <article className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <Link href={`/profile/${post.user.username}`} className="flex items-center gap-2.5">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.user.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-[#d42b2b] text-white font-bold">{post.user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold leading-none">{post.user.displayName}</p>
              {post.user.trustScore >= 70 && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#d42b2b"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">@{post.user.username} · {formatDistance(post.createdAt)}</p>
          </div>
        </Link>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>

      {post.gadget && (
        <Link href={`/gadget/${post.gadget.id}`} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
          {post.gadget.imageUrl && (
            <Image src={post.gadget.imageUrl} alt={post.gadget.name} width={32} height={32} className="rounded-lg object-contain" />
          )}
          <div>
            <p className="text-xs font-medium">{post.gadget.brand} {post.gadget.name}</p>
          </div>
          {post.rating && (
            <div className="ml-auto flex items-center gap-1 text-amber-500">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-semibold">{post.rating}/10</span>
            </div>
          )}
        </Link>
      )}

      <p className="text-sm leading-relaxed">{post.content}</p>

      {post.mediaUrls.length > 0 && (
        <div className={cn("grid gap-1 rounded-xl overflow-hidden", post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <div key={i} className="relative aspect-square bg-muted">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-5 pt-1 border-t border-gray-50">
        <button
          onClick={toggleLike}
          className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors", liked ? "text-[#d42b2b]" : "text-gray-400 hover:text-gray-600")}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} strokeWidth={1.8} />
          <span>{likeCount}</span>
        </button>
        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
          <MessageCircle size={18} strokeWidth={1.8} />
          <span>{post.commentCount}</span>
        </Link>
        <button className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
          <Share2 size={16} strokeWidth={1.8} />
          <span>Bagikan</span>
        </button>
        <button
          onClick={toggleBookmark}
          className={cn("ml-auto flex items-center transition-colors", bookmarked ? "text-[#d42b2b]" : "text-gray-400 hover:text-gray-600")}
        >
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} strokeWidth={1.8} />
        </button>
      </div>
    </article>
  );
}
