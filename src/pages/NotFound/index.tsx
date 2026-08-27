import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-lg text-slate-600">Halaman tidak ditemukan</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Home className="h-4 w-4" />
          Kembali ke Dasbor
        </Link>
      </div>
    </div>
  );
}
