import { useCallback, useEffect, useState } from "react";
import { CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageContainer from "@/components/layout/PageContainer";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { notificationService } from "../api/notification.service";
import type { UserNotification } from "../api/types";

const PER_PAGE = 15;

type Filter = "all" | "unread";

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

export default function NotificationsPage() {
  const [data, setData] = useState<UserNotification[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(
    (targetPage: number, targetFilter: Filter) => {
      notificationService
        .list({
          page: targetPage,
          per_page: PER_PAGE,
          is_read: targetFilter === "unread" ? false : undefined,
        })
        .then((res) => {
          setData(res.data);
          setPage(res.meta?.current_page ?? 1);
          setLastPage(res.meta?.last_page ?? 1);
          setTotal(res.meta?.total ?? 0);
        })
        .catch((err) => {
          setError(toApiError(err));
          setData([]);
        })
        .finally(() => setLoading(false));
    },
    [],
  );

  useEffect(() => {
    load(1, filter);
  }, [filter, load]);

  const changeFilter = (next: Filter) => {
    setLoading(true);
    setError(null);
    setFilter(next);
    setPage(1);
  };

  const goToPage = (target: number) => {
    if (target < 1 || target > lastPage) return;
    setLoading(true);
    setError(null);
    load(target, filter);
  };

  const handleMarkAsRead = useCallback(
    async (id: number) => {
      const prev = data;
      setData((cur) =>
        cur.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)),
      );
      if (filter === "unread") {
        setData((cur) => cur.filter((n) => n.id !== id));
        setTotal((t) => Math.max(0, t - 1));
      }
      try {
        await notificationService.markAsRead(id);
      } catch (err) {
        setData(prev);
        toast.error("Gagal menandai notifikasi", {
          description: toApiError(err).message,
        });
      }
    },
    [data, filter],
  );

  const handleMarkAll = useCallback(async () => {
    setData((cur) => cur.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    if (filter === "unread") {
      setData([]);
      setTotal(0);
    }
    try {
      await notificationService.markAllAsRead();
      toast.success("Semua notifikasi telah dibaca.");
    } catch (err) {
      toast.error("Gagal menandai semua", { description: toApiError(err).message });
    }
  }, [filter]);

  const unreadCount = data.filter((n) => !n.is_read).length;
  const from = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const to = Math.min(page * PER_PAGE, total);

  return (
    <PageContainer className="py-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-on-surface">
          Notifikasi
        </h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Kelola dan lihat notifikasi akun Anda.
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "secondary"}
            size="sm"
            onClick={() => changeFilter("all")}
          >
            Semua
          </Button>
          <Button
            variant={filter === "unread" ? "primary" : "secondary"}
            size="sm"
            onClick={() => changeFilter("unread")}
          >
            Belum Dibaca
          </Button>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleMarkAll}
          disabled={unreadCount === 0}
          leftIcon={<CheckCheck className="h-4 w-4" />}
        >
          Tandai semua dibaca
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Memuat notifikasi...
          </div>
        ) : error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">Gagal memuat notifikasi.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setLoading(true);
                setError(null);
                load(page, filter);
              }}
            >
              Muat Ulang
            </Button>
          </div>
        ) : data.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium text-on-surface">
              {filter === "unread" ? "Tidak ada notifikasi yang belum dibaca." : "Belum ada notifikasi"}
            </p>
            <p className="mt-1 text-xs text-on-surface-variant">
              {filter === "unread"
                ? "Anda telah membaca semua notifikasi."
                : "Anda belum memiliki notifikasi baru."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (!n.is_read) handleMarkAsRead(n.id);
                }}
                className={`flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-container-low ${
                  n.is_read ? "opacity-70" : ""
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
                  <span className="mt-0.5 block text-sm text-on-surface-variant">
                    {n.message}
                  </span>
                  <span className="mt-1 block text-xs text-outline">
                    {timeAgo(n.created_at)}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {!loading && !error && total > 0 && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-on-surface-variant">
            Menampilkan {from}-{to} dari {total} data
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Sebelumnya
            </Button>
            <span className="text-sm text-on-surface-variant">
              Halaman {page} dari {lastPage}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= lastPage}
              onClick={() => goToPage(page + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
