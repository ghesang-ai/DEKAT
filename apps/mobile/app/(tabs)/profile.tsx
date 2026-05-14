import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../src/stores/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user?.displayName?.[0] ?? "?"}</Text>
      </View>
      <Text style={styles.name}>{user?.displayName}</Text>
      <Text style={styles.username}>@{user?.username}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Keluar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", paddingTop: 60 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#e5e7eb", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: "700" },
  name: { fontSize: 18, fontWeight: "700" },
  username: { color: "#9ca3af", marginTop: 4 },
  button: { marginTop: 32, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, paddingHorizontal: 32, paddingVertical: 12 },
  buttonText: { fontWeight: "600" },
});
