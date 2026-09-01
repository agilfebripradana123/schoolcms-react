import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import loginBg from "@/assets/images/gambar_login.webp";
import { toast } from "sonner";
import { toApiError } from "@/lib/api/error";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    if (!showPreloader) return;
    const timer = setTimeout(() => {
      setShowPreloader(false);
      navigate("/dashboard", { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [showPreloader, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ login: email, password });
      toast.success("Login berhasil", {
        description: "Mempersiapkan dashboard...",
      });
      setShowPreloader(true);
    } catch (err) {
      const apiErr = toApiError(err);
      const message = apiErr.message;
      toast.error("Login gagal", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface text-on-surface">
      {/* Background decoration mobile */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
        {/* LEFT SIDE: Background image with gradient overlay */}
        <section
          className="relative hidden flex-col justify-between bg-slate-950 px-10 py-10 text-white lg:flex"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.94) 0%, rgba(30,41,59,0.82) 45%, rgba(88,28,135,0.68) 100%), url(${loginBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

          <div className="relative z-10 flex h-full w-full flex-col justify-center p-10 xl:p-14">
            <div className="max-w-xl">
              <ShieldCheck className="mb-4 h-8 w-8 text-primary-fixed" />
              <h2 className="text-2xl font-bold">SchoolCMS</h2>
              <p className="mt-1 text-sm text-slate-300">
                Sistem Pengelolaan Sekolah
              </p>

              <h1 className="mt-10 text-4xl font-bold leading-tight tracking-tight">
                Kelola sekolah{" "}
                <span className="text-primary-container">dengan mudah</span>
              </h1>
              <p className="mt-4 max-w-md text-base text-slate-200">
                Satu platform untuk mengelola siswa, guru, akademik, keuangan,
                dll.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Data siswa & guru terpusat",
                  "Akses cepat & aman",
                  "Dashboard untuk monitoring",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-100"
                  >
                    <div className="h-5 w-5 rounded-full bg-primary-container/20" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT SIDE: Login Form */}
        <section className="flex items-center justify-center px-4 py-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="mb-10 flex justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-container text-white shadow-lg">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">SchoolCMS</h2>
                  <p className="text-xs text-slate-500">Manajemen Sekolah</p>
                </div>
              </div>
            </div>

            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Halo! Selamat datang
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Masukkan akun Anda untuk masuk ke dashboard.
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-8">
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
                      disabled={isLoading || authLoading}
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
                      disabled={isLoading || authLoading}
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
                  disabled={isLoading || authLoading}
                  className="w-full rounded-xl bg-primary-container px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-container/20 transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isLoading || authLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Memproses...
                    </span>
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                </button>
              </form>
            </div>

            {/* Demo Note */}
            <p className="mt-6 text-center text-xs text-slate-400">
              Aman dan terintegrasi untuk manajemen sekolah modern.
            </p>
          </div>
        </section>
      </div>

      {/* Preloader tema 3 detik setelah login berhasil */}
      {showPreloader && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary-container" />
          </div>
        </div>
      )}
    </div>
  );
}
