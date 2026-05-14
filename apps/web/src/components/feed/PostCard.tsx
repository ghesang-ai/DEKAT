"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Star } from "lucide-react";
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
    <article className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between">
        <Link href={`/profile/${post.user.username}`} className="flex items-center gap-2.5">
          <Avatar className="w-9 h-9">
            <AvatarImage src={post.user.avatarUrl ?? undefined} />
            <AvatarFallback>{post.user.displayName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-none">{post.user.displayName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">@{post.user.username}</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {post.type === "review" && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Star size={10} strokeWidth={2} /> Review
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{formatDistance(post.createdAt)}</span>
        </div>
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

      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={toggleLike}
          className={cn("flex items-center gap-1.5 text-sm transition-colors", liked ? "text-red-500" : "text-muted-foreground hover:text-foreground")}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} strokeWidth={1.8} />
          <span>{likeCount}</span>
        </button>
        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <MessageCircle size={18} strokeWidth={1.8} />
          <span>{post.commentCount}</span>
        </Link>
        <button
          onClick={toggleBookmark}
          className={cn("ml-auto flex items-center transition-colors", bookmarked ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} strokeWidth={1.8} />
        </button>
      </div>
    </article>
  );
}
