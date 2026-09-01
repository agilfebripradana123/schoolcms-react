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
import { inventoryService } from "../../api/inventory.service";
import type {
  ActiveStatus,
  CreateInventoryPayload,
  Inventory,
  InventoryCategory,
} from "../../api/types";

interface InventoryFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Inventory | null;
}

const CATEGORY_OPTIONS: { value: InventoryCategory; label: string }[] = [
  { value: "stationery", label: "Alat Tulis" },
  { value: "electronics_supplies", label: "Perlengkapan Elektronik" },
  { value: "cleaning", label: "Kebersihan" },
  { value: "lab_supplies", label: "Perlengkapan Lab" },
  { value: "office_supplies", label: "Perlengkapan Kantor" },
  { value: "other", label: "Lainnya" },
];

const STATUS_OPTIONS: { value: ActiveStatus; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

export default function InventoryForm({
  open,
  onClose,
  onSaved,
  initialData,
}: InventoryFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("other");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minimumStock, setMinimumStock] = useState("");
  const [location, setLocation] = useState("");
  const [roomId, setRoomId] = useState("");
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
        setUnit(initialData.unit);
        setQuantity(String(initialData.quantity ?? ""));
        setMinimumStock(String(initialData.minimum_stock ?? ""));
        setLocation(initialData.location ?? "");
        setRoomId(initialData.room_id ? String(initialData.room_id) : "");
        setStatus(initialData.status);
      } else {
        setCode("");
        setName("");
        setDescription("");
        setCategory("other");
        setUnit("");
        setQuantity("");
        setMinimumStock("");
        setLocation("");
        setRoomId("");
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

    const payload: CreateInventoryPayload = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || null,
      category,
      unit: unit.trim(),
      quantity: Number(quantity),
      minimum_stock: Number(minimumStock),
      location: location.trim() || null,
      room_id: roomId ? Number(roomId) : null,
      status,
    };

    try {
      if (initialData) {
        await inventoryService.update(initialData.id, payload);
        toast.success("Inventaris berhasil diperbarui.");
      } else {
        await inventoryService.create(payload);
        toast.success("Inventaris berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan inventaris", {
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
      title={isEdit ? "Edit Inventaris" : "Tambah Inventaris"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="inventory-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="inventory-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kode" required error={fieldErrors.code?.[0]}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="INV-001"
              maxLength={20}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Nama Barang" required error={fieldErrors.name?.[0]}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kertas HVS A4"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Deskripsi" error={fieldErrors.description?.[0]}>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi singkat barang"
            rows={2}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField label="Kategori" required error={fieldErrors.category?.[0]}>
            <AppSelect
              value={category}
              onChange={(v) => setCategory((v as InventoryCategory) ?? "other")}
              options={CATEGORY_OPTIONS}
              isDisabled={submitting}
            />
          </FormField>

          <FormField label="Satuan" required error={fieldErrors.unit?.[0]}>
            <Input
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="rim"
              maxLength={30}
              disabled={submitting}
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
          <FormField
            label="Jumlah Stok"
            required
            error={fieldErrors.quantity?.[0]}
          >
            <Input
              type="number"
              min={0}
              max={1000000}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Stok Minimum"
            required
            error={fieldErrors.minimum_stock?.[0]}
            hint="Peringatan stok menipis saat jumlah di bawah nilai ini"
          >
            <Input
              type="number"
              min={0}
              max={1000000}
              value={minimumStock}
              onChange={(e) => setMinimumStock(e.target.value)}
              placeholder="5"
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                isClearable
                isDisabled={submitting}
              />
            )}
          </FormField>

          <FormField label="Lokasi" error={fieldErrors.location?.[0]}>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Rak A1"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>
        </div>

        {error && !error.errors && (
          <p className="rounded-xl bg-error-container px-3 py-2 text-sm text-error">
            {error.message}
          </p>
        )}
      </form>
    </Modal>
  );
}