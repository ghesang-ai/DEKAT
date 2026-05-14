"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { ProfileView } from "@/components/profile/ProfileView";

export default function MyProfilePage() {
  const { token, user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) router.push("/login");
  }, [token, router, _hasHydrated]);

  if (!user) return null;
  return <ProfileView username={user.username} isOwn />;
}
