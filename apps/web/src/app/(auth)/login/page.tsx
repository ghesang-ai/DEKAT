"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type FormData = z.infer<typeof schema>;

function isNetworkError(err: unknown) {
  if (!err || typeof err !== "object") return false;
  const e = err as any;
  if (!e.response) return true;
  if (e.response?.status >= 500) return true;
  return false;
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-white flex flex-col px-6 pt-10 pb-8 max-w-md mx-auto">

      {/* ── Hero Section ── */}
      <div className="relative flex items-start justify-between mb-8">
        {/* Left: logo + headline */}
        <div className="flex-1 pt-2 z-10">
          <div
            className="mb-5 overflow-hidden"
            style={{
              width: 300,
              height: 78,
              backgroundImage: `url(/gueposting-logo-wide.png)`,
              backgroundSize: "auto 78px",
              backgroundPosition: "-13px center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            Selamat datang<br />
            di{" "}
            <span className="text-[#d42b2b]">GUEPOSTING</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-[200px]">
            Masuk untuk melanjutkan perjalanan berbagi dan menemukan hal terbaik seputar gadget.
          </p>
        </div>

        {/* Right: gadget illustration */}
        <div className="relative w-44 h-44 flex-shrink-0 -mr-2">
          {/* Pink gradient circle */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle at 60% 40%, #ffd6d6 0%, #ffecec 60%, transparent 100%)" }}
          />
          {/* Gadget emojis */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl drop-shadow-sm" style={{ marginLeft: 16, marginTop: 8 }}>📱</span>
            <span className="absolute bottom-5 right-3 text-4xl drop-shadow-sm">🎧</span>
            <span className="absolute top-4 right-5 text-3xl drop-shadow-sm">⌚</span>
          </div>
          {/* Floating badges */}
          <div className="absolute top-2 left-6 bg-white rounded-full w-9 h-9 shadow-md flex items-center justify-center text-lg">
            ❤️
          </div>
          <div className="absolute bottom-6 left-2 bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center text-base">
            🔥
          </div>
          <div className="absolute bottom-2 right-10 bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center text-base">
            👍
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-[#d42b2b]" />
            </div>
            <input
              type="email"
              placeholder="kamu@email.com"
              autoComplete="email"
              {...register("email")}
              className={cn(
                "w-full pl-14 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-colors",
                "bg-white placeholder:text-gray-400 text-gray-900",
                errors.email
                  ? "border-red-300 focus:border-[#d42b2b]"
                  : "border-gray-200 focus:border-[#d42b2b]"
              )}
            />
          </div>
          {errors.email && <p className="text-xs text-[#d42b2b] pl-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold text-[#d42b2b] hover:opacity-80">
              Lupa password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-[#d42b2b]" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              {...register("password")}
              className={cn(
                "w-full pl-14 pr-12 py-3.5 rounded-2xl border text-sm outline-none transition-colors",
                "bg-white placeholder:text-gray-400 text-gray-900",
                errors.password
                  ? "border-red-300 focus:border-[#d42b2b]"
                  : "border-gray-200 focus:border-[#d42b2b]"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-[#d42b2b] pl-1">{errors.password.message}</p>}
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-5 h-5 rounded-md border-2 border-gray-200 peer-checked:bg-[#d42b2b] peer-checked:border-[#d42b2b] flex items-center justify-center transition-colors">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="text-white">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <span className="text-sm text-gray-600">Ingat saya</span>
        </label>

        {/* Error */}
        {error && (
          <div className={cn(
            "text-sm rounded-2xl px-4 py-3 flex items-center gap-2",
            error.includes("memulai") || error.includes("dijangkau")
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-red-50 text-[#d42b2b] border border-red-100"
          )}>
            {retrying && (
              <span className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            )}
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-[0.98]",
            isLoading
              ? "bg-[#d42b2b]/60 cursor-not-allowed"
              : "bg-[#d42b2b] hover:bg-[#c0281f] shadow-lg shadow-red-200"
          )}
        >
          {retrying ? "Menghubungkan..." : isSubmitting ? "Masuk..." : "Masuk"}
        </button>
      </form>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">atau masuk dengan</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* ── Social Buttons ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Google", icon: "G", color: "#4285F4" },
          { label: "Facebook", icon: "f", color: "#1877F2" },
          { label: "Apple", icon: "", color: "#000" },
        ].map(({ label, icon, color }) => (
          <button
            key={label}
            type="button"
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            {label === "Apple" ? (
              <svg width="16" height="16" viewBox="0 0 814 1000" fill="black">
                <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.8 0 663.4 0 541.8c0-207.4 135.4-316.9 268.9-316.9 71 0 130.3 47.2 174.5 47.2 42.8 0 109.7-50.2 190.8-50.2zm-234.6-126.6c32.7-38.7 56.5-92.7 56.5-146.7 0-7.4-.6-14.9-1.9-21.3-53.1 1.9-116.6 35.2-154.7 80.3-29.7 33.9-57.8 87.9-57.8 142.5 0 8.3 1.3 16.6 1.9 19.2 3.2.6 8.3 1.3 13.5 1.3 47.9 0 108.2-31.5 142.5-75.3z"/>
              </svg>
            ) : (
              <span className="font-bold text-sm" style={{ color }}>{icon}</span>
            )}
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Trust Badge ── */}
      <div className="flex items-center gap-4 bg-red-50/60 border border-red-100 rounded-2xl px-4 py-3 mb-6">
        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#d42b2b" opacity="0.15"/>
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="#d42b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="#d42b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-800">Aman &amp; Terpercaya</p>
          <p className="text-xs text-gray-500 mt-0.5">Data kamu aman bersama GUEPOSTING. Kami tidak akan membagikannya.</p>
        </div>
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#d42b2b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ── Register Link ── */}
      <p className="text-center text-sm text-gray-500">
        Belum punya akun?{" "}
        <Link href="/register" className="text-[#d42b2b] font-bold hover:opacity-80">
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
