import { useEffect, useState, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity,
  Image, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Star } from "lucide-react-native";
import { api } from "../../src/lib/api";

interface Gadget {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string | null;
  avgScore: number;
}

const CATEGORIES = ["semua", "smartphone", "laptop", "tablet", "wearable", "audio"];

export default function ExploreScreen() {
  const router = useRouter();
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("semua");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "semua") params.set("category", category);
      const res = await api.get(`/gadgets?${params}`);
      setGadgets(res.data.data ?? res.data);
    } catch {
      setGadgets([]);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Jelajah</Text>
        <View style={styles.searchBox}>
          <Search size={14} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari gadget..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.filterChip, category === cat && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, category === cat && styles.filterTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#000" />
      ) : gadgets.length === 0 ? (
        <Text style={styles.empty}>Gadget tidak ditemukan</Text>
      ) : (
        <FlatList
          data={gadgets}
          keyExtractor={(g) => g.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/gadget/${item.id}` as any)}
            >
              <View style={styles.imgBox}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.img} resizeMode="contain" />
                ) : (
                  <Text style={styles.emoji}>📱</Text>
                )}
              </View>
              <Text style={styles.brand}>{item.brand}</Text>
              <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
              <View style={styles.bottom}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.category}</Text>
                </View>
                <View style={styles.rating}>
                  <Star size={10} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.ratingText}>{item.avgScore.toFixed(1)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: "800", paddingHorizontal: 16, paddingTop: 12, marginBottom: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, marginHorizontal: 16, backgroundColor: "#f3f4f6", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10 },
  searchInput: { flex: 1, fontSize: 14, color: "#111" },
  filterRow: { paddingHorizontal: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: "#f3f4f6", marginHorizontal: 4 },
  filterChipActive: { backgroundColor: "#111" },
  filterText: { fontSize: 12, color: "#6b7280", fontWeight: "500", textTransform: "capitalize" },
  filterTextActive: { color: "#fff" },
  list: { padding: 12 },
  row: { gap: 10, marginBottom: 10 },
  card: { flex: 1, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 16, padding: 12, gap: 6 },
  imgBox: { width: "100%", aspectRatio: 1, backgroundColor: "#f9fafb", borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  img: { width: "100%", height: "100%" },
  emoji: { fontSize: 36 },
  brand: { fontSize: 10, color: "#9ca3af" },
  name: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  badge: { backgroundColor: "#f3f4f6", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 9, color: "#6b7280" },
  rating: { flexDirection: "row", alignItems: "center", gap: 2 },
  ratingText: { fontSize: 10, fontWeight: "600", color: "#111" },
  empty: { textAlign: "center", color: "#9ca3af", marginTop: 60, fontSize: 14 },
});
