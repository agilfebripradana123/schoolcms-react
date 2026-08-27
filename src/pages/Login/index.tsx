import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ShieldCheck,
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import Card from "@/components/ui/Card";
import loginBg from "@/assets/images/gambar_login.webp";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loading = isLoading || authLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Background decoration mobile */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* ================= LEFT SIDE ================= */}

        <section
          className="relative hidden overflow-hidden lg:flex"
          style={{
            backgroundImage: `
              linear-gradient(
                135deg,
                rgba(15,23,42,0.94) 0%,
                rgba(30,41,59,0.82) 45%,
                rgba(88,28,135,0.68) 100%
              ),
              url(${loginBg})
            `,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Decorative overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  SchoolCMS
                </h2>
                <p className="text-xs text-slate-300">
                  School Management System
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white xl:text-6xl">
                Kelola sekolah
                <span className="block bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  dengan lebih mudah.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 xl:text-lg">
                Satu platform untuk mengelola siswa, guru, akademik, keuangan,
                fasilitas, dan seluruh aktivitas sekolah.
              </p>

              {/* Feature list */}
              <div className="mt-8 space-y-4">
                {[
                  "Kelola data sekolah dalam satu sistem",
                  "Akses informasi dengan cepat dan aman",
                  "Dashboard lengkap untuk monitoring sekolah",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-100"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
                <Card className="border-white/10 bg-white/10 p-4 text-white shadow-none backdrop-blur-md">
                  <Users className="mb-3 h-5 w-5 text-violet-200" />
                  <p className="text-xl font-bold">Students</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Data siswa terpusat
                  </p>
                </Card>

                <Card className="border-white/10 bg-white/10 p-4 text-white shadow-none backdrop-blur-md">
                  <GraduationCap className="mb-3 h-5 w-5 text-violet-200" />
                  <p className="text-xl font-bold">Teachers</p>
                  <p className="mt-1 text-xs text-slate-300">Manajemen guru</p>
                </Card>

                <Card className="border-white/10 bg-white/10 p-4 text-white shadow-none backdrop-blur-md">
                  <BookOpen className="mb-3 h-5 w-5 text-violet-200" />
                  <p className="text-xl font-bold">Academic</p>
                  <p className="mt-1 text-xs text-slate-300">Sistem akademik</p>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <p className="text-sm text-slate-400">
              © 2026 SchoolCMS. School Management System.
            </p>
          </div>
        </section>

        {/* ================= RIGHT SIDE ================= */}

        <section className="relative flex items-center justify-center px-4 py-10 sm:px-6 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-10 flex justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container text-white shadow-lg shadow-primary-container/20">
                  <GraduationCap className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">SchoolCMS</h2>
                  <p className="text-xs text-slate-500">
                    School Management System
                  </p>
                </div>
              </div>
            </div>

            {/* Welcome */}
            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-container/10 text-primary-container">
                <ShieldCheck className="h-6 w-6" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Selamat datang kembali
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Masukkan informasi akun Anda untuk melanjutkan ke dashboard.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                role="alert"
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="admin@schoolcms.com"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-container focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-container/10 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Kata sandi
                  </label>

                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      placeholder="Masukkan kata sandi"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-container focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-container/10 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Sembunyikan kata sandi"
                          : "Tampilkan kata sandi"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-container/20 transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk ke Dashboard
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-slate-400">
              Aman dan terintegrasi untuk manajemen sekolah modern.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
