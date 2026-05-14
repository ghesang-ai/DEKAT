"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Bookmark, Star, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/time";

const REACTIONS = [
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "fire", emoji: "🔥", label: "Hot" },
  { type: "wow",  emoji: "😮", label: "Wow" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "like", emoji: "👍", label: "Suka" },
];

interface Post {
  id: string;
  content: string;
  type: string;
  rating: number | null;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  userReaction?: string | null;
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
  const [userReaction, setUserReaction] = useState<string | null>(post.userReaction ?? null);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked ?? false);
  const [showPicker, setShowPicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

  const react = async (type: string) => {
    setShowPicker(false);
    const removing = userReaction === type;
    const wasReacted = userReaction !== null;
    try {
      const res = await api.post(`/posts/${post.id}/like`, { type });
      setUserReaction(res.data.reactionType);
      if (removing) setLikeCount((n) => n - 1);
      else if (!wasReacted) setLikeCount((n) => n + 1);
    } catch {}
  };

  const toggleBookmark = async () => {
    try {
      if (bookmarked) {
        await api.delete(`/posts/${post.id}/bookmark`);
      } else {
        await api.post(`/posts/${post.id}/bookmark`);
      }
      setBookmarked(!bookmarked);
    } catch {}
  };

  const share = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Post oleh ${post.user.displayName} di DEKAT`, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentReaction = REACTIONS.find((r) => r.type === userReaction);

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
        {/* Reaction button */}
        <div className="relative" ref={pickerRef}>
          {showPicker && (
            <div className="absolute bottom-9 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 flex items-center gap-0.5 p-1.5 z-20">
              {REACTIONS.map((r) => (
                <button
                  key={r.type}
                  onClick={() => react(r.type)}
                  title={r.label}
                  className={cn(
                    "text-xl w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 hover:scale-125 hover:bg-gray-50",
                    userReaction === r.type && "bg-red-50 scale-110"
                  )}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowPicker((p) => !p)}
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium transition-colors select-none",
              userReaction ? "text-[#d42b2b]" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <span className="text-base leading-none">
              {currentReaction ? currentReaction.emoji : "🤍"}
            </span>
            <span>{likeCount}</span>
          </button>
        </div>

        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
          <MessageCircle size={18} strokeWidth={1.8} />
          <span>{post.commentCount}</span>
        </Link>

        <button
          onClick={share}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Share2 size={16} strokeWidth={1.8} />
          <span>{copied ? "Link disalin!" : "Bagikan"}</span>
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
