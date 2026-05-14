import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Heart, MessageCircle } from "lucide-react-native";
import { api } from "../../src/lib/api";

interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
  user: { username: string; displayName: string; avatarUrl: string | null };
}

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/feed/trending?limit=20");
      setPosts(res.data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>DEKAT</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada postingan</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.user.displayName[0]}</Text>
              </View>
              <View>
                <Text style={styles.name}>{item.user.displayName}</Text>
                <Text style={styles.username}>@{item.user.username}</Text>
              </View>
            </View>
            <Text style={styles.content}>{item.content}</Text>
            {item.mediaUrls.length > 0 && (
              <Image source={{ uri: item.mediaUrls[0] }} style={styles.media} resizeMode="cover" />
            )}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.action}>
                <Heart size={18} color="#666" />
                <Text style={styles.count}>{item.likeCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action}>
                <MessageCircle size={18} color="#666" />
                <Text style={styles.count}>{item.commentCount}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  logo: { fontSize: 20, fontWeight: "800" },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 60, fontSize: 14 },
  card: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e5e7eb", justifyContent: "center", alignItems: "center" },
  avatarText: { fontWeight: "700", fontSize: 14 },
  name: { fontWeight: "600", fontSize: 14 },
  username: { color: "#9ca3af", fontSize: 12 },
  content: { fontSize: 14, lineHeight: 20, color: "#111", marginBottom: 10 },
  media: { width: "100%", height: 200, borderRadius: 12, marginBottom: 10 },
  actions: { flexDirection: "row", gap: 20 },
  action: { flexDirection: "row", alignItems: "center", gap: 6 },
  count: { color: "#666", fontSize: 13 },
});
