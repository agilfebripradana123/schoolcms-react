import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { toApiError } from "@/lib/api";
import { notificationService } from "./api/notification.service";
import type { UserNotification } from "./api/types";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "Baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  if (days < 7) return `${days} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadCount = useCallback(() => {
    notificationService
      .unreadCount()
      .then((res) => setUnreadCount(res.data.unread_count))
      .catch(() => {
        /* keep current count on transient failure */
      });
  }, []);

  const loadList = useCallback(() => {
    notificationService
      .list({ per_page: 8 })
      .then((res) => {
        setItems(res.data);
        setUnreadCount(Math.max(0, res.data.filter((n) => !n.is_read).length));
      })
      .catch(() => {
        setError(true);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch the unread count on mount (Header mount) and refresh when opened.
  useEffect(() => {
    loadCount();
  }, [loadCount]);

  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = useCallback(
    async (id: number) => {
      // Optimistic update; rollback + toast on failure.
      const prev = items;
      setItems((cur) => cur.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await notificationService.markAsRead(id);
      } catch (err) {
        setItems(prev);
        setUnreadCount((c) => c + 1);
        toast.error("Gagal menandai notifikasi", {
          description: toApiError(err).message,
        });
      }
    },
    [items],
  );

  const handleMarkAll = useCallback(async () => {
    setItems((cur) => cur.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
      toast.success("Semua notifikasi telah dibaca.");
    } catch (err) {
      toast.error("Gagal menandai semua", { description: toApiError(err).message });
      loadCount();
    }
  }, [loadCount]);

  const unreadVisible = unreadCount > 0;
  const unreadBadge = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          const next = !open;
          if (next) {
            setLoading(true);
            setError(false);
          }
          setOpen(next);
        }}
        className="relative rounded-2xl border border-slate-200 bg-white p-2 text-on-surface-variant shadow-sm transition-colors hover:border-primary-container hover:text-primary-container"
        aria-label="Notifikasi"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {unreadVisible && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold leading-none text-on-error">
            {unreadBadge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-surface-container-lowest shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-on-surface">Notifikasi</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/admin/communication/notifications");
              }}
              className="text-xs font-medium text-primary-container hover:underline"
            >
              Lihat semua
            </button>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-on-surface-variant">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat notifikasi...
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-sm text-error">
                Gagal memuat notifikasi.
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-on-surface">Belum ada notifikasi</p>
                <p className="mt-1 text-xs text-on-surface-variant">
                  Anda belum memiliki notifikasi baru.
                </p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.is_read) handleMarkAsRead(n.id);
                  }}
                  className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors hover:bg-surface-container-low ${
                    n.is_read ? "opacity-70" : "bg-surface-container-lowest"
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.is_read ? "bg-transparent" : "bg-primary-container"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-on-surface">
                      {n.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-on-surface-variant">
                      {n.message}
                    </span>
                    <span className="mt-1 block text-[11px] text-outline">
                      {timeAgo(n.created_at)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={handleMarkAll}
            disabled={items.length === 0 || unreadCount === 0}
            className="flex w-full items-center justify-center gap-2 border-t border-slate-100 px-4 py-3 text-sm font-medium text-primary-container hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Tandai semua dibaca
          </button>
        </div>
      )}
    </div>
  );
}
