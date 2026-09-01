import { useCallback, useEffect, useState } from "react";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { inventoryService } from "../../api/inventory.service";
import type { Inventory, StockMovement, StockMovementType } from "../../api/types";

interface MovementsDialogProps {
  open: boolean;
  onClose: () => void;
  inventory: Inventory | null;
}

const TYPE_BADGE: Record<
  StockMovementType,
  { label: string; variant: "success" | "danger" | "primary" }
> = {
  stock_in: { label: "Stok Masuk", variant: "success" },
  stock_out: { label: "Stok Keluar", variant: "danger" },
  adjustment: { label: "Penyesuaian", variant: "primary" },
};

export default function MovementsDialog({
  open,
  onClose,
  inventory,
}: MovementsDialogProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInventory, setPreviousInventory] = useState(inventory);

  if (open !== previousOpen || inventory !== previousInventory) {
    setPreviousOpen(open);
    setPreviousInventory(inventory);

    if (open) {
      setLoading(true);
      setError(false);
    }
  }

  const load = useCallback(() => {
    if (!inventory) return;
    inventoryService
      .movements(inventory.id)
      .then((res) => setMovements(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [inventory]);

  useEffect(() => {
    if (open && inventory) load();
  }, [open, inventory, load]);

  const signedQuantity = (movement: StockMovement) => {
    if (movement.type === "adjustment") {
      return movement.adjustment_type === "increase"
        ? `+${movement.quantity}`
        : `-${movement.quantity}`;
    }
    return movement.type === "stock_in"
      ? `+${movement.quantity}`
      : `-${movement.quantity}`;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Riwayat Transaksi Stok"
      size="lg"
    >
      <p className="mb-4 flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
        <span className="truncate font-medium text-on-surface">{inventory?.name}</span>
        <span className="whitespace-nowrap">
          Stok saat ini: {inventory?.quantity ?? 0} {inventory?.unit}
        </span>
      </p>

      {loading ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Memuat data...
        </p>
      ) : error ? (
        <p className="py-10 text-center text-sm text-error">
          Gagal memuat riwayat transaksi.
        </p>
      ) : movements.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          Belum ada transaksi untuk barang ini.
        </p>
      ) : (
        <div className="space-y-3">
          {movements.map((movement) => {
            const typeConfig = TYPE_BADGE[movement.type] ?? TYPE_BADGE.stock_in;
            return (
              <div
                key={movement.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                  <div className="min-w-0">
                    {movement.notes && (
                      <p className="truncate text-sm font-medium text-on-surface">
                        {movement.notes}
                      </p>
                    )}
                    <p className="text-xs text-on-surface-variant">
                      {movement.created_at}
                      {movement.created_by ? ` · ${movement.created_by}` : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    signedQuantity(movement).startsWith("+")
                      ? "whitespace-nowrap text-sm font-semibold text-success"
                      : "whitespace-nowrap text-sm font-semibold text-error"
                  }
                >
                  {signedQuantity(movement)} {inventory?.unit}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}