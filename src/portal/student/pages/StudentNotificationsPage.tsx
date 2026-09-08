import { useEffect, useState } from "react";
import { Loader2, Bell, CheckCheck, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/format";
import { COMMUNICATION } from "@/lib/api/endpoints";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface NotificationItem {
  id: number;
  title: string;
  message?: string | null;
  type?: string | null;
  is_read: boolean;
  created_at: string;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get<{ success: boolean; data: NotificationItem[] }>(
          COMMUNICATION.NOTIFICATIONS_MY,
        );
        if (active) setNotifications(res.data ?? []);
      } catch (err) {
        if (active) setError(toApiError(err).message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!unreadCount) return;
    setMarkingAll(true);
    try {
      await api.post("/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card>
          <div className="flex items-center gap-3 p-6 text-sm text-error">
            <AlertTriangle className="h-5 w-5" />
            Gagal memuat notifikasi: {error}
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title="Notifikasi"
          description={unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"}
        />
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}{" "}
            Tandai semua dibaca
          </Button>
        )}
      </div>

      <Card>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm font-medium text-slate-500">Belum ada notifikasi</p>
            <p className="mt-1 text-xs text-slate-400">Pemberitahuan dari sekolah akan muncul di sini.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`flex gap-3 px-4 py-4 transition-colors first:pt-3 last:pb-3 sm:px-6 ${
                  n.is_read ? "" : "bg-primary-container/5"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      n.is_read
                        ? "bg-slate-100 text-slate-400"
                        : "bg-primary-container/20 text-primary-container"
                    }`}
                  >
                    <Bell className="h-4 w-4" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm leading-snug ${
                        n.is_read ? "font-medium text-slate-700" : "font-semibold text-slate-900"
                      }`}
                    >
                      {n.title}
                    </p>
                    {!n.is_read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-container" />
                    )}
                  </div>
                  {n.message && (
                    <p className="mt-1 text-sm leading-relaxed text-slate-500 line-clamp-2">
                      {n.message}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-slate-400">
                    {formatDate(n.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageContainer>
  );
}