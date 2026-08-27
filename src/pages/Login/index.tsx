import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useAuth } from "@/features/auth/useAuth";
import { toApiError } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ login: email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md rounded-xl bg-slate-800 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">SchoolCMS</h1>
          <p className="mt-2 text-slate-400">Masuk ke akun Anda</p>
        </div>

        {error && (
          <div
            className="mb-6 rounded-lg bg-red-900/30 p-4 text-sm text-red-300"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@schoolcms.com"
                disabled={isLoading || authLoading}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-1.5"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-12 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={isLoading || authLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading || authLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Masuk...
              </span>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Demo: admin@schoolcms.com / password</p>
        </div>
      </div>
    </div>
  );
}