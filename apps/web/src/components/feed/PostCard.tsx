"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Bookmark, Star, Share2, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/time";

const REACTIONS = [
  { type: "love",    emoji: "❤️",  label: "Love" },
  { type: "fire",    emoji: "🔥",  label: "Hot" },
  { type: "wow",     emoji: "😮",  label: "Wow" },
  { type: "haha",    emoji: "😂",  label: "Haha" },
  { type: "like",    emoji: "👍",  label: "Suka" },
  { type: "cool",    emoji: "😍",  label: "Keren" },
  { type: "amazing", emoji: "🤩",  label: "Amazing" },
  { type: "perfect", emoji: "💯",  label: "Perfect" },
  { type: "rocket",  emoji: "🚀",  label: "Next Level" },
  { type: "sad",     emoji: "😢",  label: "Sedih" },
];

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; username: string; displayName: string; avatarUrl: string | null };
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

  // Comments
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

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
      try { await navigator.share({ title: `Post oleh ${post.user.displayName} di DEKAT`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleComments = async () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) {
      setLoadingComments(true);
      try {
        const res = await api.get(`/posts/${post.id}`);
        setComments(res.data.comments ?? []);
      } catch {}
      finally { setLoadingComments(false); }
    }
    if (next) setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const submitComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${post.id}/comment`, { content: commentText.trim() });
      setComments((prev) => [...prev, res.data]);
      setCommentCount((n) => n + 1);
      setCommentText("");
    } catch {}
    finally { setSubmitting(false); }
  };

  const currentReaction = REACTIONS.find((r) => r.type === userReaction);

  return (
    <article className="bg-white rounded-2xl shadow-sm px-4 py-4 space-y-3">
      {/* Header */}
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

      {/* Gadget tag */}
      {post.gadget && (
        <Link href={`/gadget/${post.gadget.id}`} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2">
          {post.gadget.imageUrl && (
            <Image src={post.gadget.imageUrl} alt={post.gadget.name} width={32} height={32} className="rounded-lg object-contain" />
          )}
          <p className="text-xs font-medium">{post.gadget.brand} {post.gadget.name}</p>
          {post.rating && (
            <div className="ml-auto flex items-center gap-1 text-amber-500">
              <Star size={12} fill="currentColor" />
              <span className="text-xs font-semibold">{post.rating}/10</span>
            </div>
          )}
        </Link>
      )}

      <p className="text-sm leading-relaxed">{post.content}</p>

      {/* Media */}
      {post.mediaUrls.length > 0 && (
        <div className={cn("grid gap-1 rounded-xl overflow-hidden", post.mediaUrls.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <div key={i} className="relative aspect-square bg-muted">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-5 pt-1 border-t border-gray-50">
        {/* Reaction */}
        <div className="relative" ref={pickerRef}>
          {showPicker && (
            <div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-gray-100 grid grid-cols-5 gap-1 p-2 z-20 w-64">
              {REACTIONS.map((r) => (
                <button key={r.type} onClick={() => react(r.type)} title={r.label}
                  className={cn("text-2xl w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-150 hover:scale-125 hover:bg-gray-50", userReaction === r.type && "bg-red-50 scale-110")}>
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setShowPicker((p) => !p)}
            className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors select-none", userReaction ? "text-[#d42b2b]" : "text-gray-400 hover:text-gray-600")}>
            <span className="text-base leading-none">{currentReaction ? currentReaction.emoji : "🤍"}</span>
            <span>{likeCount}</span>
          </button>
        </div>

        {/* Comment toggle */}
        <button onClick={toggleComments}
          className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors", showComments ? "text-[#d42b2b]" : "text-gray-400 hover:text-gray-600")}>
          <MessageCircle size={18} strokeWidth={1.8} fill={showComments ? "currentColor" : "none"} />
          <span>{commentCount}</span>
        </button>

        {/* Share */}
        <button onClick={share} className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
          <Share2 size={16} strokeWidth={1.8} />
          <span>{copied ? "Link disalin!" : "Bagikan"}</span>
        </button>

        {/* Bookmark */}
        <button onClick={toggleBookmark}
          className={cn("ml-auto flex items-center transition-colors", bookmarked ? "text-[#d42b2b]" : "text-gray-400 hover:text-gray-600")}>
          <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} strokeWidth={1.8} />
        </button>
      </div>

      {/* Inline comments */}
      {showComments && (
        <div className="border-t border-gray-50 pt-3 space-y-3">
          {loadingComments ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="animate-spin text-gray-300" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-center text-gray-400 py-2">Belum ada komentar. Jadilah yang pertama!</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                    <AvatarImage src={c.user.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-[#d42b2b] text-white text-xs font-bold">{c.user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl px-3 py-2">
                      <p className="text-xs font-semibold text-gray-800">{c.user.displayName}</p>
                      <p className="text-sm text-gray-700 mt-0.5 leading-snug">{c.content}</p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 ml-3">{formatDistance(c.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <div className="flex gap-2 items-center">
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitComment()}
              placeholder="Tulis komentar..."
              className="flex-1 text-sm px-3 py-2 bg-gray-50 rounded-xl border border-transparent focus:border-gray-200 outline-none"
            />
            <button onClick={submitComment} disabled={!commentText.trim() || submitting}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#d42b2b] text-white disabled:opacity-40 flex-shrink-0 transition-opacity">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
