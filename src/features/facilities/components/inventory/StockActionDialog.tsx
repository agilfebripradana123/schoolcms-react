import { useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { inventoryService } from "../../api/inventory.service";
import type {
  AdjustmentType,
  Inventory,
  StockMovementType,
} from "../../api/types";

interface StockActionDialogProps {
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
  inventory: Inventory | null;
  type: StockMovementType;
}

const ADJUSTMENT_TYPE_OPTIONS: { value: AdjustmentType; label: string }[] = [
  { value: "increase", label: "Penambahan" },
  { value: "decrease", label: "Pengurangan" },
];

const CONFIG: Record<
  StockMovementType,
  { title: string; description: string; button: string }
> = {
  stock_in: {
    title: "Stok Masuk",
    description: "Tambahkan stok masuk untuk barang ini.",
    button: "Simpan Stok Masuk",
  },
  stock_out: {
    title: "Stok Keluar",
    description: "Kurangi stok untuk barang ini.",
    button: "Simpan Stok Keluar",
  },
  adjustment: {
    title: "Penyesuaian Stok",
    description: "Sesuaikan stok berdasarkan hasil penghitungan fisik.",
    button: "Simpan Penyesuaian",
  },
};

export default function StockActionDialog({
  open,
  onClose,
  onCompleted,
  inventory,
  type,
}: StockActionDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("increase");
  const [notes, setNotes] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isAdjustment = type === "adjustment";
  const config = CONFIG[type];

  const [previousOpen, setPreviousOpen] = useState(open);

  if (open !== previousOpen) {
    setPreviousOpen(open);

    if (open) {
      setQuantity("");
      setAdjustmentType("increase");
      setNotes("");
      setCreatedBy("");
      setError(null);
      setFieldErrors({});
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventory) return;
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const common = {
        quantity: Number(quantity),
        notes: isAdjustment ? notes.trim() : notes.trim() || undefined,
        created_by: createdBy.trim() || undefined,
      };

      if (isAdjustment) {
        await inventoryService.adjustment(inventory.id, {
          ...common,
          quantity: Number(quantity),
          adjustment_type: adjustmentType,
          notes: notes.trim(),
        });
        toast.success("Penyesuaian stok berhasil.");
      } else if (type === "stock_in") {
        await inventoryService.stockIn(inventory.id, common);
        toast.success("Stok masuk berhasil dicatat.");
      } else {
        await inventoryService.stockOut(inventory.id, common);
        toast.success("Stok keluar berhasil dicatat.");
      }
      onCompleted();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan transaksi stok", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={config.title}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="stock-action-form"
            loading={submitting}
            variant={type === "stock_out" ? "danger" : "secondary"}
          >
            {config.button}
          </Button>
        </>
      }
    >
      <form
        id="stock-action-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <p className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
          <span className="truncate font-medium text-on-surface">
            {inventory?.name}
          </span>
          <span className="whitespace-nowrap">
            Stok saat ini: {inventory?.quantity ?? 0} {inventory?.unit}
          </span>
        </p>

        {isAdjustment && (
          <FormField
            label="Jenis Penyesuaian"
            required
            error={fieldErrors.adjustment_type?.[0]}
          >
            <AppSelect
              value={adjustmentType}
              onChange={(v) => setAdjustmentType((v as AdjustmentType) ?? "increase")}
              options={ADJUSTMENT_TYPE_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        )}

        <FormField
          label="Jumlah"
          required
          error={fieldErrors.quantity?.[0]}
          hint={`Dalam satuan ${inventory?.unit ?? "item"}`}
        >
          <Input
            type="number"
            min={1}
            max={1000000}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Catatan"
          required={isAdjustment}
          error={fieldErrors.notes?.[0]}
        >
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              isAdjustment
                ? "Alasan penyesuaian (wajib diisi)"
                : "Catatan transaksi (opsional)"
            }
            rows={2}
            disabled={submitting}
          />
        </FormField>

        <FormField label="Dibuat oleh" error={fieldErrors.created_by?.[0]}>
          <Input
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            placeholder="Nama petugas"
            maxLength={100}
            disabled={submitting}
          />
        </FormField>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}