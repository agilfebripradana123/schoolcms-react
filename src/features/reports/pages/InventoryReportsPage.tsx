import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { FormField, Input } from "@/components/ui/Form";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { reportService } from "../api/report.service";
import type {
  InventoryMovementSummary,
  InventoryStockStatus,
  InventoryStockSummary,
} from "../api/types";

type Section = "stock" | "movement";

const STOCK_STATUS_VARIANTS: Record<
  InventoryStockStatus,
  "danger" | "warning" | "success"
> = {
  low: "danger",
  warning: "warning",
  healthy: "success",
};

const STOCK_STATUS_LABELS: Record<InventoryStockStatus, string> = {
  low: "Stok Menipis",
  warning: "Perhatian",
  healthy: "Aman",
};

export default function InventoryReportsPage() {
  const [section, setSection] = useState<Section>("stock");

  const [stock, setStock] = useState<InventoryStockSummary | null>(null);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState<ApiError | null>(null);

  const [movement, setMovement] = useState<InventoryMovementSummary | null>(null);
  const [movementLoading, setMovementLoading] = useState(true);
  const [movementError, setMovementError] = useState<ApiError | null>(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [movementQuery, setMovementQuery] = useState<{
    date_from: string | undefined;
    date_to: string | undefined;
  }>({ date_from: undefined, date_to: undefined });

  const fetchStock = useCallback(() => {
    let active = true;

    reportService
      .inventoryStockSummary()
      .then((res) => {
        if (!active) return;
        setStock(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setStockError(toApiError(err));
        toast.error("Gagal memuat laporan stok inventaris", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setStockLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return fetchStock();
  }, [fetchStock]);

  useEffect(() => {
    if (section !== "movement") return;
    let active = true;

    reportService
      .inventoryMovementSummary(movementQuery)
      .then((res) => {
        if (!active) return;
        setMovement(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setMovementError(toApiError(err));
        setMovement(null);
        toast.error("Gagal memuat pergerakan stok", {
          description: toApiError(err).message,
        });
      })
      .finally(() => {
        if (active) setMovementLoading(false);
      });

    return () => {
      active = false;
    };
  }, [section, movementQuery]);

  const handleSectionChange = useCallback((next: Section) => {
    setSection(next);
    if (next === "movement") {
      setMovementLoading(true);
      setMovementError(null);
    }
  }, []);

  const handleApplyDates = useCallback(() => {
    setMovementLoading(true);
    setMovementError(null);
    setMovementQuery({
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  }, [dateFrom, dateTo]);

  const itemColumns = [
    {
      header: "Kode",
      accessor: "code" as keyof InventoryStockSummary["items"][number],
      render: (
        _value: unknown,
        row: InventoryStockSummary["items"][number],
      ) => (
        <span className="whitespace-nowrap text-sm font-medium text-on-surface">
          {row.code}
        </span>
      ),
    },
    {
      header: "Nama",
      accessor: "name" as keyof InventoryStockSummary["items"][number],
      render: (
        _value: unknown,
        row: InventoryStockSummary["items"][number],
      ) => (
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-700">{row.name}</p>
          {row.location && (
            <p className="truncate text-xs text-on-surface-variant">{row.location}</p>
          )}
        </div>
      ),
    },
    {
      header: "Kategori",
      accessor: "category" as keyof InventoryStockSummary["items"][number],
      render: (
        _value: unknown,
        row: InventoryStockSummary["items"][number],
      ) => <span className="text-sm text-slate-700">{row.category || "-"}</span>,
    },
    {
      header: "Stok",
      accessor: "quantity" as keyof InventoryStockSummary["items"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (
        _value: unknown,
        row: InventoryStockSummary["items"][number],
      ) => (
        <span className="whitespace-nowrap text-sm text-slate-700">
          {row.quantity} {row.unit ?? ""}
        </span>
      ),
    },
    {
      header: "Min. Stok",
      accessor: "minimum_stock" as keyof InventoryStockSummary["items"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Status",
      accessor: "stock_status" as keyof InventoryStockSummary["items"][number],
      className: "px-6 py-4 text-center text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider",
      render: (
        _value: unknown,
        row: InventoryStockSummary["items"][number],
      ) => (
        <div className="flex justify-center">
          <Badge variant={STOCK_STATUS_VARIANTS[row.stock_status] ?? "neutral"}>
            {STOCK_STATUS_LABELS[row.stock_status] ?? row.stock_status}
          </Badge>
        </div>
      ),
    },
  ];

  const recentColumns = [
    {
      header: "Inventaris",
      accessor: "inventory_name" as keyof InventoryMovementSummary["recent"][number],
      render: (
        _value: unknown,
        row: InventoryMovementSummary["recent"][number],
      ) => (
        <span className="text-sm font-medium text-on-surface">
          {row.inventory_name ?? `#${row.inventory_id}`}
        </span>
      ),
    },
    {
      header: "Tipe",
      accessor: "type" as keyof InventoryMovementSummary["recent"][number],
      render: (
        _value: unknown,
        row: InventoryMovementSummary["recent"][number],
      ) => <span className="text-sm text-slate-700">{row.type || "-"}</span>,
    },
    {
      header: "Jumlah",
      accessor: "quantity" as keyof InventoryMovementSummary["recent"][number],
      className: "px-6 py-4 text-right text-sm text-slate-700",
      headerClassName:
        "px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider",
    },
    {
      header: "Catatan",
      accessor: "notes" as keyof InventoryMovementSummary["recent"][number],
      render: (
        _value: unknown,
        row: InventoryMovementSummary["recent"][number],
      ) => (
        <p className="truncate text-sm text-slate-700">{row.notes ?? "-"}</p>
      ),
    },
  ];

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Laporan Inventaris"
        description="Ringkasan stok inventaris dan pergerakan barang."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant={section === "stock" ? "primary" : "secondary"}
          size="sm"
          onClick={() => handleSectionChange("stock")}
        >
          Ringkasan Stok
        </Button>
        <Button
          variant={section === "movement" ? "primary" : "secondary"}
          size="sm"
          onClick={() => handleSectionChange("movement")}
        >
          Pergerakan Stok
        </Button>
      </div>

      {section === "stock" ? (
        stockLoading ? (
          <Card>
            <div className="py-10 text-center text-sm text-slate-500">Memuat data...</div>
          </Card>
        ) : stockError || !stock ? (
          <Card>
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
              <p className="text-sm text-error">
                {stockError?.message ?? "Gagal memuat laporan stok."}
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setStockLoading(true);
                  setStockError(null);
                  fetchStock();
                }}
              >
                Muat Ulang
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                <p className="text-sm font-medium text-on-surface-variant">Total Item</p>
                <p className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface">
                  {stock.totals.total_items}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-surface-container-lowest p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
                <p className="text-sm font-medium text-on-surface-variant">Stok Menipis</p>
                <p className="mt-3 font-display text-3xl font-bold tracking-tight text-on-surface">
                  {stock.totals.total_low_stock}
                </p>
              </div>
            </div>

            <Card className="mt-6">
              <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
                Ringkasan per Kategori
              </h3>
              {stock.totals.categories.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Belum ada data kategori.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {stock.totals.categories.map((cat) => (
                    <Badge key={cat.category} variant="neutral">
                      {cat.category}: {cat.total_items}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>

            <Card className="mt-6">
              <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
                Daftar Stok
              </h3>
              <DataTable
                columns={itemColumns}
                data={stock.items}
                emptyMessage="Belum ada data inventaris."
              />
            </Card>
          </>
        )
      ) : (
        <>
          <Card>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:max-w-xl">
              <FormField label="Dari Tanggal" className="flex flex-col gap-1">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </FormField>
              <FormField label="Sampai Tanggal" className="flex flex-col gap-1">
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </FormField>
            </div>
            <div className="mt-4">
              <Button variant="secondary" size="sm" onClick={handleApplyDates}>
                Terapkan Filter
              </Button>
            </div>
          </Card>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Total Pergerakan per Tipe
            </h3>
            {movementError ? (
              <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl py-10">
                <p className="text-sm text-error">{movementError.message}</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setMovementLoading(true);
                    setMovementError(null);
                    setMovementQuery((prev) => ({ ...prev }));
                  }}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : movementLoading || !movement ? (
              <div className="py-10 text-center text-sm text-slate-500">Memuat data...</div>
            ) : Object.keys(movement.totals_by_type).length === 0 ? (
              <p className="text-sm text-on-surface-variant">Belum ada data pergerakan.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(movement.totals_by_type).map(([type, total]) => (
                  <div
                    key={type}
                    className="rounded-2xl border border-slate-200 bg-surface-container-low p-4"
                  >
                    <p className="text-xs font-medium text-on-surface-variant">{type}</p>
                    <p className="mt-1 font-display text-2xl font-bold text-on-surface">
                      {total}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="mt-6">
            <h3 className="mb-4 font-display text-base font-semibold text-on-surface">
              Pergerakan Terbaru
            </h3>
            <DataTable
              columns={recentColumns}
              data={movement?.recent ?? []}
              loading={movementLoading}
              emptyMessage="Belum ada pergerakan stok."
            />
          </Card>
        </>
      )}
    </PageContainer>
  );
}