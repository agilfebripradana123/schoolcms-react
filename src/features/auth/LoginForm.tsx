import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, IdCard, Loader2, Lock, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import loginBg from "@/assets/images/gambar_login.webp";
import { toast } from "sonner";
import { toApiError } from "@/lib/api/error";

interface LoginFormProps {
  mode: "siswa" | "guru" | "admin";
}

const configs = {
  siswa: {
    label: "NIS",
    placeholder: "Masukkan NIS Anda",
    icon: IdCard,
    inputType: "text",
    autocomplete: "username",
    title: "Halo! Selamat datang",
    description: "Masukkan NIS dan kata sandi untuk masuk ke portal siswa.",
    shell: "student",
  },
  guru: {
    label: "Email",
    placeholder: "guru@sekolah.edu",
    icon: Mail,
    inputType: "email",
    autocomplete: "email",
    title: "Portal Guru",
    description: "Masuk menggunakan email guru yang terdaftar.",
    shell: "teacher",
  },
  admin: {
    label: "Username",
    placeholder: "username admin",
    icon: User,
    inputType: "text",
    autocomplete: "username",
    title: "Admin Console",
    description: "Masuk menggunakan username administrator.",
    shell: "admin",
  },
} as const;

function getRedirectPath(role: string): string {
  const normalized = role.toLowerCase();
  if (normalized === "siswa") return "/siswa";
  if (normalized === "guru") return "/guru";
  return "/admin";
}

export function LoginForm({ mode }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cfg = configs[mode];
  const Icon = cfg.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({ login: loginValue, password });
      toast.success("Login berhasil", {
        description: "Mempersiapkan dashboard...",
      });
      navigate(getRedirectPath(user.role), { replace: true });
    } catch (err) {
      const apiErr = toApiError(err);
      toast.error("Login gagal", { description: apiErr.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (cfg.shell === "teacher") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-lg shadow-sky-200/60">
              <Mail className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{cfg.title}</h1>
            <p className="mt-2 text-sm text-slate-500">{cfg.description}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/70">
            <LoginFields
              cfg={cfg}
              Icon={Icon}
              loginValue={loginValue}
              password={password}
              showPassword={showPassword}
              isLoading={isLoading}
              onLoginChange={setLoginValue}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
              onSubmit={handleSubmit}
            />
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">
            Portal Guru · SchoolCMS
          </p>
        </div>
      </div>
    );
  }

  if (cfg.shell === "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container text-white shadow-lg shadow-primary-container/30">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-white">{cfg.title}</h1>
            <p className="mt-2 text-sm text-slate-400">{cfg.description}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <LoginFields
              cfg={cfg}
              Icon={Icon}
              loginValue={loginValue}
              password={password}
              showPassword={showPassword}
              isLoading={isLoading}
              onLoginChange={setLoginValue}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
              onSubmit={handleSubmit}
              dark
            />
          </div>
          <p className="mt-6 text-center text-xs text-slate-500">
            Admin Console · SchoolCMS
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-surface text-on-surface">
      <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
        <section
          className="relative hidden flex-col justify-between bg-slate-950 px-10 py-10 text-white lg:flex"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.94) 0%, rgba(30,41,59,0.82) 45%, rgba(88,28,135,0.68) 100%), url(${loginBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          <div className="relative z-10 flex h-full w-full flex-col justify-center p-10 xl:p-14">
            <div className="max-w-xl">
              <ShieldCheck className="mb-4 h-8 w-8 text-primary-fixed" />
              <h2 className="text-2xl font-bold">SchoolCMS</h2>
              <p className="mt-1 text-sm text-slate-300">Sistem Pengelolaan Sekolah</p>
              <h1 className="mt-10 text-4xl font-bold leading-tight tracking-tight">
                Kelola sekolah <span className="text-primary-container">dengan mudah</span>
              </h1>
              <p className="mt-4 max-w-md text-base text-slate-200">
                Satu platform untuk mengelola siswa, guru, akademik, keuangan, dll.
              </p>
              <div className="mt-6 space-y-3">
                {["Data siswa & guru terpusat", "Akses cepat & aman", "Dashboard untuk monitoring"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-slate-100">
                    <div className="h-5 w-5 rounded-full bg-primary-container/20" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-8 lg:px-12">
          <div className="w-full max-w-md">
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
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">{cfg.title}</h1>
              <p className="mt-2 text-sm text-slate-500">{cfg.description}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-8">
              <LoginFields
                cfg={cfg}
                Icon={Icon}
                loginValue={loginValue}
                password={password}
                showPassword={showPassword}
                isLoading={isLoading}
                onLoginChange={setLoginValue}
                onPasswordChange={setPassword}
                onTogglePassword={() => setShowPassword((p) => !p)}
                onSubmit={handleSubmit}
              />
            </div>
            <p className="mt-6 text-center text-xs text-slate-400">Aman dan terintegrasi untuk manajemen sekolah modern.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function LoginFields({
  cfg,
  Icon,
  loginValue,
  password,
  showPassword,
  isLoading,
  onLoginChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  dark = false,
}: {
  cfg: (typeof configs)[LoginFormProps["mode"]];
  Icon: typeof IdCard;
  loginValue: string;
  password: string;
  showPassword: boolean;
  isLoading: boolean;
  onLoginChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  dark?: boolean;
}) {
  const labelClass = dark ? "text-slate-200" : "text-slate-700";
  const inputClass = dark
    ? "border-white/10 bg-white/10 text-white placeholder:text-slate-400 focus:border-primary-fixed focus:bg-white/15 focus:ring-primary-fixed/10"
    : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-primary-container focus:bg-white focus:ring-primary-container/10";

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="login" className={`mb-2 block text-sm font-semibold ${labelClass}`}>
          {cfg.label}
        </label>
        <div className="relative">
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="login"
            type={cfg.inputType}
            value={loginValue}
            onChange={(e) => onLoginChange(e.target.value)}
            required
            autoComplete={cfg.autocomplete}
            placeholder={cfg.placeholder}
            disabled={isLoading}
            className={`w-full rounded-xl border py-3.5 pl-12 pr-4 text-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className={`mb-2 block text-sm font-semibold ${labelClass}`}>
          Kata sandi
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Masukkan kata sandi"
            disabled={isLoading}
            className={`w-full rounded-xl border py-3.5 pl-12 pr-12 text-sm transition-all hover:border-slate-300 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50 ${inputClass}`}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-primary-container px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-container/20 transition-all hover:-translate-y-0.5 hover:bg-primary hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Memproses...
          </span>
        ) : (
          "Masuk ke Dashboard"
        )}
      </button>
    </form>
  );
}
