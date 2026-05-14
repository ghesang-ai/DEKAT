import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, RefreshControl, Image,
  TouchableOpacity, TextInput, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MessageCircle, Bookmark, Share2, Star } from "lucide-react-native";
import { api } from "../../src/lib/api";

const RED = "#d42b2b";
const HEADER_RED = "#c0281f";

const GADGETS = [
  { id: "d87dba92-e880-416a-b093-e0b6a187dcfe", name: "iPhone 17", brand: "Apple", emoji: "📱" },
  { id: "32062a42-d258-4310-bb42-760567e812a6", name: "S26 Ultra", brand: "Samsung", emoji: "📲" },
  { id: "aacabfc3-4310-4a68-ba07-6f5f2a5ccd39", name: "MacBook M5", brand: "Apple", emoji: "💻" },
  { id: "5f4cccfe-a8ee-4eaf-aff1-a29d1dd40ea1", name: "AirPods Pro 3", brand: "Apple", emoji: "🎧" },
  { id: "eb1d2c80-2358-4257-8d2f-e934103dec5f", name: "Vivo X300 Pro", brand: "Vivo", emoji: "📸" },
  { id: "1c9dfa3c-b64f-4317-94e2-57fcaad2f82d", name: "Watch Ultra 3", brand: "Apple", emoji: "⌚" },
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
  isLiked?: boolean;
  isBookmarked?: boolean;
  user: { id: string; username: string; displayName: string; avatarUrl: string | null; trustScore: number };
  gadget: { id: string; name: string; brand: string; imageUrl: string | null } | null;
}

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked ?? false);

  const toggleLike = async () => {
    try {
      if (liked) {
        await api.delete(`/posts/${post.id}/like`);
        setLikeCount(n => n - 1);
      } else {
        await api.post(`/posts/${post.id}/like`);
        setLikeCount(n => n + 1);
      }
      setLiked(!liked);
    } catch {}
  };

  const toggleBookmark = async () => {
    try {
      if (bookmarked) await api.delete(`/posts/${post.id}/bookmark`);
      else await api.post(`/posts/${post.id}/bookmark`);
      setBookmarked(!bookmarked);
    } catch {}
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.userRow}>
          <View style={styles.avatar}>
            {post.user.avatarUrl
              ? <Image source={{ uri: post.user.avatarUrl }} style={styles.avatarImg} />
              : <Text style={styles.avatarText}>{post.user.displayName[0]}</Text>}
          </View>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.displayName}>{post.user.displayName}</Text>
              {post.user.trustScore >= 70 && (
                <Text style={{ color: RED, fontSize: 12 }}>✓</Text>
              )}
            </View>
            <Text style={styles.username}>@{post.user.username} · {timeAgo(post.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text style={styles.moreBtn}>•••</Text>
        </TouchableOpacity>
      </View>

      {post.gadget && (
        <View style={styles.gadgetTag}>
          {post.gadget.imageUrl && (
            <Image source={{ uri: post.gadget.imageUrl }} style={styles.gadgetImg} />
          )}
          <Text style={styles.gadgetName}>{post.gadget.brand} {post.gadget.name}</Text>
          {post.rating && (
            <View style={styles.ratingRow}>
              <Star size={11} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingText}>{post.rating}/10</Text>
            </View>
          )}
        </View>
      )}

      <Text style={styles.content}>{post.content}</Text>

      {post.mediaUrls.length > 0 && (
        <View style={[styles.mediaGrid, post.mediaUrls.length > 1 && { flexDirection: "row", flexWrap: "wrap" }]}>
          {post.mediaUrls.slice(0, 4).map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              style={[styles.mediaImg, post.mediaUrls.length > 1 && { width: "49.5%", aspectRatio: 1 }]}
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={toggleLike}>
          <Heart size={18} color={liked ? RED : "#9ca3af"} fill={liked ? RED : "none"} strokeWidth={1.8} />
          <Text style={[styles.actionText, liked && { color: RED }]}>{likeCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle size={18} color="#9ca3af" strokeWidth={1.8} />
          <Text style={styles.actionText}>{post.commentCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Share2 size={16} color="#9ca3af" strokeWidth={1.8} />
          <Text style={styles.actionText}>Bagikan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginLeft: "auto" }} onPress={toggleBookmark}>
          <Bookmark size={18} color={bookmarked ? RED : "#9ca3af"} fill={bookmarked ? RED : "none"} strokeWidth={1.8} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const [tab, setTab] = useState<"semua" | "following">("semua");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (p: number, currentTab: "semua" | "following") => {
    try {
      const url = currentTab === "following" ? "/posts/feed" : `/posts?page=${p}&limit=15`;
      const res = await api.get(url);
      const data: Post[] = res.data.data ?? res.data;
      if (p === 1) setPosts(data);
      else setPosts(prev => [...prev, ...data]);
      setHasMore(currentTab === "semua" ? data.length === 15 : false);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setPosts([]);
    fetchPosts(1, tab);
  }, [tab, fetchPosts]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPosts(1, tab);
    setRefreshing(false);
  };

  const header = (
    <>
      {/* Gadget Trending */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 GADGET TRENDING</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Lihat semua ›</Text></TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
          {GADGETS.map(g => (
            <TouchableOpacity key={g.id} style={styles.gadgetItem}>
              <View style={styles.gadgetEmoji}>
                <Text style={{ fontSize: 26 }}>{g.emoji}</Text>
              </View>
              <Text style={styles.gadgetItemName} numberOfLines={1}>{g.name}</Text>
              <Text style={styles.gadgetItemBrand}>{g.brand}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Create Post */}
      <View style={styles.section}>
        <View style={styles.createRow}>
          <View style={styles.createAvatar}><Text style={styles.createAvatarText}>D</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.createTitle}>Apa yang baru?</Text>
            <Text style={styles.createSub}>Bagikan ke komunitas DEKAT</Text>
          </View>
          <TouchableOpacity style={styles.createBtn}>
            <Text style={styles.createBtnText}>✏ Buat Post</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.createActions}>
          {[{ icon: "🖼️", label: "Foto" }, { icon: "🎬", label: "Video" }, { icon: "📊", label: "Polling" }, { icon: "#️⃣", label: "Topik" }].map(({ icon, label }) => (
            <TouchableOpacity key={label} style={styles.createAction}>
              <Text>{icon}</Text>
              <Text style={styles.createActionText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Red Header */}
      <SafeAreaView edges={["top"]} style={{ backgroundColor: HEADER_RED }}>
        <View style={styles.headerTop}>
          <Image source={require("../../assets/logo-white.png")} style={styles.logo} resizeMode="contain" />
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Text style={styles.iconText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.iconText}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari gadget, teman, atau topik..."
            placeholderTextColor="#9ca3af"
          />
        </View>
      </SafeAreaView>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(["semua", "following"] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "semua" ? "Semua" : "Mengikuti"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color={RED} size="large" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={p => p.id}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={RED} />}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60 }}>
              <Text style={{ color: "#9ca3af", fontSize: 14 }}>Belum ada postingan</Text>
            </View>
          }
          ListFooterComponent={
            hasMore && posts.length > 0
              ? <TouchableOpacity onPress={() => { const next = page + 1; setPage(next); fetchPosts(next, tab); }} style={{ paddingVertical: 16, alignItems: "center" }}>
                  <Text style={{ color: "#6b7280", fontSize: 14 }}>Muat lebih banyak</Text>
                </TouchableOpacity>
              : null
          }
          renderItem={({ item }) => <PostCard post={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10 },
  logo: { height: 40, width: 140 },
  headerIcons: { flexDirection: "row", gap: 16 },
  iconText: { fontSize: 22 },
  searchWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 999, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, height: 40 },
  searchIcon: { marginRight: 6, fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: "#374151" },
  tabs: { backgroundColor: "white", flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tab: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: "#e5e7eb" },
  tabActive: { backgroundColor: RED, borderColor: RED },
  tabText: { fontSize: 14, fontWeight: "600", color: "#6b7280" },
  tabTextActive: { color: "white" },
  section: { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#1f2937", letterSpacing: 0.5 },
  seeAll: { fontSize: 12, fontWeight: "700", color: RED },
  gadgetItem: { alignItems: "center", width: 72 },
  gadgetEmoji: { width: 64, height: 64, borderRadius: 16, backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", justifyContent: "center", alignItems: "center", marginBottom: 6 },
  gadgetItemName: { fontSize: 11, fontWeight: "600", color: "#374151", textAlign: "center", maxWidth: 68 },
  gadgetItemBrand: { fontSize: 10, color: "#9ca3af", textAlign: "center" },
  createRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  createAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: RED, justifyContent: "center", alignItems: "center" },
  createAvatarText: { color: "white", fontWeight: "700", fontSize: 14 },
  createTitle: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  createSub: { fontSize: 12, color: "#9ca3af" },
  createBtn: { backgroundColor: "#fef2f2", borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: "#fecaca" },
  createBtnText: { color: RED, fontSize: 13, fontWeight: "700" },
  createActions: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 12 },
  createAction: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  createActionText: { fontSize: 12, color: "#6b7280", fontWeight: "500" },
  card: { backgroundColor: "white", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: RED, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  avatarImg: { width: 40, height: 40 },
  avatarText: { color: "white", fontWeight: "700", fontSize: 15 },
  displayName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  username: { fontSize: 12, color: "#9ca3af", marginTop: 1 },
  moreBtn: { color: "#9ca3af", fontSize: 16, letterSpacing: 1 },
  gadgetTag: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, gap: 8 },
  gadgetImg: { width: 28, height: 28, borderRadius: 6 },
  gadgetName: { fontSize: 12, fontWeight: "600", flex: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontSize: 11, fontWeight: "700", color: "#f59e0b" },
  content: { fontSize: 14, lineHeight: 22, color: "#111827", marginBottom: 10 },
  mediaGrid: { borderRadius: 12, overflow: "hidden", marginBottom: 10, gap: 2 },
  mediaImg: { width: "100%", height: 200, borderRadius: 12 },
  actions: { flexDirection: "row", alignItems: "center", gap: 20, borderTopWidth: 1, borderTopColor: "#f9fafb", paddingTop: 10 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, fontWeight: "500", color: "#9ca3af" },
});
