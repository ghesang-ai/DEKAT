import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ImagePlus, X, Send } from "lucide-react-native";
import { api, API_URL } from "../../src/lib/api";
import * as SecureStore from "expo-secure-store";

const POST_TYPES = ["review", "unboxing", "discussion"] as const;
type PostType = typeof POST_TYPES[number];

export default function PostScreen() {
  const [content, setContent] = useState("");
  const [type, setType] = useState<PostType>("review");
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Izin Diperlukan", "Izinkan akses ke galeri foto untuk upload gambar.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 4,
    });
    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris].slice(0, 4));
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const token = await SecureStore.getItemAsync("token");
    const urls: string[] = [];
    for (const uri of images) {
      const form = new FormData();
      form.append("file", { uri, name: "photo.jpg", type: "image/jpeg" } as any);
      const res = await fetch(`${API_URL}/media/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    return urls;
  };

  const submit = async () => {
    if (!content.trim()) {
      Alert.alert("Oops", "Tulis konten postingan dulu ya.");
      return;
    }
    setSubmitting(true);
    try {
      let mediaUrls: string[] = [];
      if (images.length > 0) {
        setUploading(true);
        mediaUrls = await uploadImages();
        setUploading(false);
      }
      await api.post("/posts", {
        content: content.trim(),
        type,
        rating: type === "review" && rating > 0 ? rating : undefined,
        mediaUrls,
      });
      Alert.alert("Berhasil!", "Postingan kamu sudah dipublish.", [
        { text: "OK", onPress: () => { setContent(""); setImages([]); setRating(0); } },
      ]);
    } catch {
      Alert.alert("Gagal", "Gagal memposting. Coba lagi.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Buat Post</Text>
          <TouchableOpacity
            style={[styles.postBtn, (!content.trim() || submitting) && styles.postBtnDisabled]}
            onPress={submit}
            disabled={!content.trim() || submitting}
          >
            {submitting ? <ActivityIndicator color="#fff" size="small" /> : <Send size={16} color="#fff" />}
            <Text style={styles.postBtnText}>{uploading ? "Upload..." : "Post"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {/* Type picker */}
          <View style={styles.typeRow}>
            {POST_TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
              >
                <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <TextInput
            style={styles.textarea}
            placeholder="Tulis review, unboxing, atau diskusi gadget kamu..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            maxLength={2000}
          />
          <Text style={styles.charCount}>{content.length}/2000</Text>

          {/* Rating (review only) */}
          {type === "review" && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Text style={[styles.star, rating >= star && styles.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Images */}
          <View style={styles.imageRow}>
            {images.map((uri, i) => (
              <View key={i} style={styles.imageWrap}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                >
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 4 && (
              <TouchableOpacity style={styles.addImage} onPress={pickImage}>
                <ImagePlus size={24} color="#9ca3af" />
                <Text style={styles.addImageText}>Foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  title: { fontSize: 18, fontWeight: "700" },
  postBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#111", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  body: { padding: 16, gap: 12 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: "#e5e7eb" },
  typeChipActive: { backgroundColor: "#111", borderColor: "#111" },
  typeText: { fontSize: 13, color: "#6b7280", fontWeight: "500", textTransform: "capitalize" },
  typeTextActive: { color: "#fff" },
  textarea: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 14, fontSize: 15, color: "#111", minHeight: 140, lineHeight: 22 },
  charCount: { fontSize: 11, color: "#9ca3af", textAlign: "right" },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingLabel: { fontSize: 14, color: "#374151", fontWeight: "500" },
  star: { fontSize: 28, color: "#d1d5db" },
  starActive: { color: "#f59e0b" },
  imageRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  imageWrap: { position: "relative" },
  imageThumb: { width: 80, height: 80, borderRadius: 10 },
  removeBtn: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, padding: 3 },
  addImage: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: "#e5e7eb", borderStyle: "dashed", justifyContent: "center", alignItems: "center", gap: 4 },
  addImageText: { fontSize: 11, color: "#9ca3af" },
});
