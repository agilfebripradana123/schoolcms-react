import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { feeTypeService } from "../../api/fee-type.service";
import type { CreateFeeTypePayload, FeeType } from "../../api/types";

interface FeeTypeFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: FeeType | null;
}

export default function FeeTypeForm({
  open,
  onClose,
  onSaved,
  initialData,
}: FeeTypeFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});

      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount != null ? String(initialData.amount) : "");
        setDescription(initialData.description ?? "");
        setIsActive(initialData.is_active);
      } else {
        setName("");
        setAmount("");
        setDescription("");
        setIsActive(true);
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum)) {
      setError({ message: "Jumlah wajib diisi dengan angka." });
      setSubmitting(false);
      return;
    }
    if (amountNum < 0) {
      setError({ message: "Jumlah tidak boleh kurang dari 0." });
      setSubmitting(false);
      return;
    }

    const payload: CreateFeeTypePayload = {
      name: name.trim(),
      amount: amountNum,
      description: description.trim() || undefined,
      is_active: isActive,
    };

    try {
      if (initialData) {
        await feeTypeService.update(initialData.id, payload);
        toast.success("Jenis tagihan berhasil diperbarui.");
      } else {
        await feeTypeService.create(payload);
        toast.success("Jenis tagihan berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan jenis tagihan", {
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
      title={isEdit ? "Edit Jenis Tagihan" : "Tambah Jenis Tagihan"}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="fee-type-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="fee-type-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <FormField label="Nama Tagihan" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="SPP Bulanan"
            maxLength={100}
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Jumlah"
          required
          hint="Masukkan nominal rupiah."
          error={fieldErrors.amount?.[0]}
        >
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="250000"
            disabled={submitting}
          />
        </FormField>

        <FormField
          label="Deskripsi"
          hint="Opsional."
          error={fieldErrors.description?.[0]}
        >
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Keterangan jenis tagihan..."
            maxLength={255}
            disabled={submitting}
          />
        </FormField>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
          />
          <div>
            <span className="block text-sm font-semibold text-on-surface">
              Jenis tagihan aktif
            </span>
            <span className="block text-xs text-on-surface-variant">
              Tagihan aktif tersedia untuk digunakan dalam penagihan.
            </span>
          </div>
        </label>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}