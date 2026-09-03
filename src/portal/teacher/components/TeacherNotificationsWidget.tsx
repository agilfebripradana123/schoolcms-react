import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Bell } from "lucide-react";
import { notificationService } from "@/features/notifications";
import type { UserNotification } from "@/features/notifications";
import { toApiError } from "@/lib/api/error";
import TeacherEmptyData from "./TeacherEmptyData";

function formatRelative(dateIso?: string): string {
  if (!dateIso) return "";
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

/**
 * Menampilkan notifikasi milik user yang sedang login melalui
 * `GET /api/notifications/my` — endpoint identity-derived, aman untuk role Guru.
 */
export default function TeacherNotificationsWidget() {
  const [items, setItems] = useState<UserNotification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    notificationService
      .list({ per_page: 5 })
      .then((res) => {
        if (active)       setItems(res.data ?? []);
      })
      .catch((err) => {
        if (active) setError(toApiError(err).message);
      });
    return () => {
      active = false;
    };
  }, []);


  if (error) {
    return (
      <p className="text-sm text-error">Gagal memuat notifikasi: {error}</p>
    );
  }

  if (items === null) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return <TeacherEmptyData title="Tidak ada notifikasi" />;
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.map((item) => (
        <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed/20 text-on-primary-fixed">
            <Bell className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-on-surface">{item.title}</p>
            {item.message && (
              <p className="mt-0.5 line-clamp-2 text-sm text-on-surface-variant">
                {item.message}
              </p>
            )}
            <p className="mt-1 text-xs text-outline">{formatRelative(item.created_at)}</p>
          </div>
        </div>
      ))}
      <div className="pt-3">
        <Link
          to="/guru/notifications"
          className="text-sm font-semibold text-primary hover:text-primary-container"
        >
          Lihat semua notifikasi
        </Link>
      </div>
    </div>
  );
}
