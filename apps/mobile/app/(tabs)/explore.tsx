import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Jelajah</Text>
      <Text style={styles.sub}>Fitur jelajah gadget coming soon</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  sub: { color: "#9ca3af", marginTop: 8 },
});
