import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { roomService } from "../../api/room.service";
import type {
  ActiveStatus,
  CreateRoomPayload,
  Room,
} from "../../api/types";

interface RoomFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Room | null;
}

const STATUS_OPTIONS: { value: ActiveStatus; label: string }[] = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

export default function RoomForm({
  open,
  onClose,
  onSaved,
  initialData,
}: RoomFormProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [hasComputer, setHasComputer] = useState(false);
  const [status, setStatus] = useState<ActiveStatus>("active");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setError(null);
      setFieldErrors({});

      if (initialData) {
        setCode(initialData.code);
        setName(initialData.name);
        setCapacity(String(initialData.capacity ?? ""));
        setLocation(initialData.location ?? "");
        setHasComputer(initialData.has_computer);
        setStatus(initialData.status);
      } else {
        setCode("");
        setName("");
        setCapacity("");
        setLocation("");
        setHasComputer(false);
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

    const payload: CreateRoomPayload = {
      code: code.trim(),
      name: name.trim(),
      capacity: Number(capacity),
      location: location.trim() || null,
      has_computer: hasComputer,
      status,
    };

    try {
      if (initialData) {
        await roomService.update(initialData.id, payload);
        toast.success("Ruangan berhasil diperbarui.");
      } else {
        await roomService.create(payload);
        toast.success("Ruangan berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan ruangan", {
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
      title={isEdit ? "Edit Ruangan" : "Tambah Ruangan"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="room-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="room-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kode" required error={fieldErrors.code?.[0]}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="R-001"
              maxLength={20}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Nama Ruangan" required error={fieldErrors.name?.[0]}>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ruang Kelas 1A"
              maxLength={100}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kapasitas" required error={fieldErrors.capacity?.[0]}>
            <Input
              type="number"
              min={0}
              max={10000}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="30"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Lokasi" error={fieldErrors.location?.[0]}>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Gedung A, Lantai 1"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              checked={hasComputer}
              onChange={(e) => setHasComputer(e.target.checked)}
              disabled={submitting}
              className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
            />
            <span className="text-sm font-semibold text-on-surface">
              Tersedia Komputer
            </span>
          </label>

          <FormField label="Status" required error={fieldErrors.status?.[0]}>
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v ?? "active") as ActiveStatus)}
              options={STATUS_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
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