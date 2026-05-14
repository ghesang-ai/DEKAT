import { Tabs } from "expo-router";
import { Home, Compass, PlusCircle, GitCompare, User } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e5e7eb" },
      tabBarActiveTintColor: "#000",
      tabBarInactiveTintColor: "#9ca3af",
      tabBarLabelStyle: { fontSize: 10 },
    }}>
      <Tabs.Screen name="feed" options={{ title: "Beranda", tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: "Jelajah", tabBarIcon: ({ color, size }) => <Compass size={size} color={color} /> }} />
      <Tabs.Screen name="post" options={{ title: "Post", tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} /> }} />
      <Tabs.Screen name="compare" options={{ title: "Compare", tabBarIcon: ({ color, size }) => <GitCompare size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profil", tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
    </Tabs>
  );
}
