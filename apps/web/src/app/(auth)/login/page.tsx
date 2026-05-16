"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormData = z.infer<typeof schema>;

function isNetworkError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const e = err as any;
  // No response = network/timeout error (server unreachable)
  if (!e.response) return true;
  // 503 / 504 = server down
  if (e.response?.status >= 500) return true;
  return false;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const doLogin = async (data: FormData, isRetry = false) => {
    try {
      setError("");
      const res = await api.post("/auth/login", data);
      setAuth(res.data.user, res.data.token);
      router.push("/");
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        if (!isRetry) {
          // Auto-retry once after 3s — Railway might be waking up
          setError("Server sedang memulai... mencoba lagi otomatis.");
          setRetrying(true);
          setTimeout(async () => {
            setRetrying(false);
            await doLogin(data, true);
          }, 3000);
        } else {
          setError("Server tidak dapat dijangkau. Coba beberapa saat lagi.");
        }
      } else {
        const msg = (err as any)?.response?.data?.message;
        setError(msg ?? "Email atau password salah.");
      }
    }
  };

  const onSubmit = (data: FormData) => doLogin(data);

  const isLoading = isSubmitting || retrying;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">DEKAT</h1>
          <p className="text-muted-foreground text-sm">Masuk ke akunmu</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="kamu@email.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                Lupa password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-xs">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className={`text-sm text-center rounded-lg p-3 ${
              error.includes("memulai") || error.includes("dijangkau")
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-red-50 text-red-600 border border-red-100"
            }`}>
              {retrying && (
                <span className="inline-block w-3 h-3 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2 align-middle" />
              )}
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {retrying ? "Menghubungkan..." : isSubmitting ? "Masuk..." : "Masuk"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
