import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { roomService } from "../../api/room.service";
import type { Room } from "../../api/types";
import { assetService } from "../../api/asset.service";
import type {
  ActiveStatus,
  Asset,
  AssetCategory,
  AssetCondition,
  CreateAssetPayload,
} from "../../api/types";

interface AssetFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Asset | null;
}

const CATEGORY_OPTIONS: { value: AssetCategory; label: string }[] = [
  { value: "electronics", label: "Elektronik" },
  { value: "furniture", label: "Furnitur" },
  { value: "lab_equipment", label: "Peralatan Lab" },
  { value: "sports", label: "Olahraga" },
  { value: "teaching_aids", label: "Alat Peraga" },
  { value: "office", label: "Perkantoran" },
  { value: "other", label: "Lainnya" },
];

const CONDITION_OPTIONS: { value: AssetCondition; label: string }[] = [
  { value: "good", label: "Baik" },
  { value: "fair", label: "Cukup" },
  { value: "poor", label: "Kurang" },
  { value: "damaged", label: "Rusak" },
];

const STATUS_OPTIONS: { value: ActiveStatus; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

export default function AssetForm({
  open,
  onClose,
  onSaved,
  initialData,
}: AssetFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AssetCategory>("other");
  const [quantity, setQuantity] = useState("");
  const [condition, setCondition] = useState<AssetCondition>("good");
  const [location, setLocation] = useState("");
  const [roomId, setRoomId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [status, setStatus] = useState<ActiveStatus>("active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsError, setRoomsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadRooms = useCallback(() => {
    setRoomsError(false);
    roomService
      .list({ per_page: 100 })
      .then((res) => setRooms(res.data))
      .catch(() => setRoomsError(true));
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});
      loadRooms();

      if (initialData) {
        setCode(initialData.code);
        setName(initialData.name);
        setDescription(initialData.description ?? "");
        setCategory(initialData.category);
        setQuantity(String(initialData.quantity ?? ""));
        setCondition(initialData.condition);
        setLocation(initialData.location ?? "");
        setRoomId(initialData.room_id ? String(initialData.room_id) : "");
        setPurchaseDate(initialData.purchase_date ?? "");
        setPurchasePrice(
          initialData.purchase_price !== null && initialData.purchase_price !== undefined
            ? String(initialData.purchase_price)
            : "",
        );
        setStatus(initialData.status);
      } else {
        setCode("");
        setName("");
        setDescription("");
        setCategory("other");
        setQuantity("");
        setCondition("good");
        setLocation("");
        setRoomId("");
        setPurchaseDate("");
        setPurchasePrice("");
        setStatus("active");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateAssetPayload = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || null,
      category,
      quantity: Number(quantity),
      condition,
      location: location.trim() || null,
      room_id: roomId ? Number(roomId) : null,
      purchase_date: purchaseDate || null,
      purchase_price: purchasePrice.trim() ? Number(purchasePrice) : null,
      status,
    };

    try {
      if (initialData) {
        await assetService.update(initialData.id, payload);
        toast.success("Aset berhasil diperbarui.");
      } else {
        await assetService.create(payload);
        toast.success("Aset berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan aset", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const roomOptions = rooms.map((room) => ({
    value: String(room.id),
    label: room.name,
  }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Aset" : "Tambah Aset"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="asset-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="asset-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kode Aset" required error={fieldErrors.code?.[0]}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="AST-001"
              maxLength={20}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Nama Aset" required error={fieldErrors.name?.[0]}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Proyektor LED"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Deskripsi" error={fieldErrors.description?.[0]}>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat aset"
            rows={2}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField label="Kategori" required error={fieldErrors.category?.[0]}>
            <AppSelect
              value={category}
              onChange={(v) => setCategory((v as AssetCategory) ?? "other")}
              options={CATEGORY_OPTIONS}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Kondisi" required error={fieldErrors.condition?.[0]}>
            <AppSelect
              value={condition}
              onChange={(v) => setCondition((v as AssetCondition) ?? "good")}
              options={CONDITION_OPTIONS}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v as ActiveStatus) ?? "active")}
              options={STATUS_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Jumlah" required error={fieldErrors.quantity?.[0]}>
            <Input
              type="number"
              min={1}
              max={10000}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="1"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Ruangan" error={fieldErrors.room_id?.[0]}>
            {roomsError ? (
              <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data ruangan.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadRooms}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : rooms.length === 0 && !roomsError ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Memuat data...
              </p>
            ) : (
              <AppSelect
                value={roomId}
                onChange={(v) => setRoomId(v ?? "")}
                options={roomOptions}
                placeholder="Pilih Ruangan"
                isDisabled={submitting}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Lokasi" error={fieldErrors.location?.[0]}>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Gudang Lab"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Tanggal Pembelian"
            error={fieldErrors.purchase_date?.[0]}
          >
            <Input
              type="date"
              value={purchaseDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setPurchaseDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField
          label="Harga Pembelian"
          error={fieldErrors.purchase_price?.[0]}
          hint="Opsional, dalam Rupiah"
        >
          <Input
            type="number"
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="1500000"
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