import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input, Textarea } from "@/components/ui/Form";
import AppSelect from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { assetService } from "../../api/asset.service";
import { roomService } from "../../api/room.service";
import type { Asset, Room } from "../../api/types";
import { maintenanceService } from "../../api/maintenance.service";
import type {
  CreateMaintenancePayload,
  Maintenance,
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceType,
} from "../../api/types";

interface MaintenanceFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Maintenance | null;
}

const MAINTENANCE_TYPE_OPTIONS: { value: MaintenanceType; label: string }[] = [
  { value: "corrective", label: "Korektif" },
  { value: "preventive", label: "Preventif" },
  { value: "emergency", label: "Darurat" },
  { value: "inspection", label: "Inspeksi" },
];

const PRIORITY_OPTIONS: { value: MaintenancePriority; label: string }[] = [
  { value: "low", label: "Rendah" },
  { value: "medium", label: "Sedang" },
  { value: "high", label: "Tinggi" },
  { value: "urgent", label: "Sangat Tinggi" },
];

const STATUS_OPTIONS: { value: MaintenanceStatus; label: string }[] = [
  { value: "pending", label: "Menunggu" },
  { value: "in_progress", label: "Dalam Proses" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export default function MaintenanceForm({
  open,
  onClose,
  onSaved,
  initialData,
}: MaintenanceFormProps) {
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assetId, setAssetId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [reportedBy, setReportedBy] = useState("");
  const [maintenanceType, setMaintenanceType] =
    useState<MaintenanceType>("corrective");
  const [priority, setPriority] = useState<MaintenancePriority>("medium");
  const [status, setStatus] = useState<MaintenanceStatus>("pending");
  const [scheduledDate, setScheduledDate] = useState("");
  const [startedDate, setStartedDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [actualCost, setActualCost] = useState("");
  const [notes, setNotes] = useState("");
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsError, setAssetsError] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsError, setRoomsError] = useState(false);

  const isEdit = Boolean(initialData);

  const loadAssets = useCallback(() => {
    setAssetsError(false);
    assetService
      .list({ per_page: 100 })
      .then((res) => setAssets(res.data))
      .catch(() => setAssetsError(true));
  }, []);

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
      loadAssets();
      loadRooms();

      if (initialData) {
        setCode(initialData.code);
        setTitle(initialData.title);
        setDescription(initialData.description ?? "");
        setAssetId(initialData.asset_id ? String(initialData.asset_id) : "");
        setRoomId(initialData.room_id ? String(initialData.room_id) : "");
        setReportedBy(initialData.reported_by ?? "");
        setMaintenanceType(initialData.maintenance_type);
        setPriority(initialData.priority);
        setStatus(initialData.status);
        setScheduledDate(initialData.scheduled_date ?? "");
        setStartedDate(initialData.started_date ?? "");
        setCompletedDate(initialData.completed_date ?? "");
        setEstimatedCost(
          initialData.estimated_cost !== null && initialData.estimated_cost !== undefined
            ? String(initialData.estimated_cost)
            : "",
        );
        setActualCost(
          initialData.actual_cost !== null && initialData.actual_cost !== undefined
            ? String(initialData.actual_cost)
            : "",
        );
        setNotes(initialData.notes ?? "");
        setResolution(initialData.resolution ?? "");
      } else {
        setCode("");
        setTitle("");
        setDescription("");
        setAssetId("");
        setRoomId("");
        setReportedBy("");
        setMaintenanceType("corrective");
        setPriority("medium");
        setStatus("pending");
        setScheduledDate("");
        setStartedDate("");
        setCompletedDate("");
        setEstimatedCost("");
        setActualCost("");
        setNotes("");
        setResolution("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload: CreateMaintenancePayload = {
      code: code.trim(),
      title: title.trim(),
      description: description.trim() || null,
      asset_id: assetId ? Number(assetId) : null,
      room_id: roomId ? Number(roomId) : null,
      reported_by: reportedBy.trim() || null,
      maintenance_type: maintenanceType,
      priority,
      status,
      scheduled_date: scheduledDate || null,
      started_date: startedDate || null,
      completed_date: completedDate || null,
      estimated_cost: estimatedCost.trim() ? Number(estimatedCost) : null,
      actual_cost: actualCost.trim() ? Number(actualCost) : null,
      notes: notes.trim() || null,
      resolution: resolution.trim() || null,
    };

    try {
      if (initialData) {
        await maintenanceService.update(initialData.id, payload);
        toast.success("Pemeliharaan berhasil diperbarui.");
      } else {
        await maintenanceService.create(payload);
        toast.success("Pemeliharaan berhasil ditambahkan.");
      }
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error("Gagal menyimpan pemeliharaan", {
        description: apiError.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const assetOptions = assets.map((asset) => ({
    value: String(asset.id),
    label: asset.name,
  }));

  const roomOptions = rooms.map((room) => ({
    value: String(room.id),
    label: room.name,
  }));

  const statusNote =
    status === "completed"
      ? "Tanggal selesai wajib diisi saat status Selesai."
      : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Pemeliharaan" : "Tambah Pemeliharaan"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="maintenance-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form
        id="maintenance-form"
        onSubmit={handleSubmit}
        className="space-y-6"
        noValidate
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Kode" required error={fieldErrors.code?.[0]}>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MNT-001"
              maxLength={20}
              disabled={submitting}
            />
          </FormField>

          <FormField label="Judul" required error={fieldErrors.title?.[0]}>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Perbaikan AC Ruang Lab"
              maxLength={150}
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Deskripsi" error={fieldErrors.description?.[0]}>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deskripsi kerusakan atau pekerjaan"
            rows={2}
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Aset" error={fieldErrors.asset_id?.[0]}>
            {assetsError ? (
              <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm text-error">
                <span>Gagal memuat data aset.</span>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={loadAssets}
                >
                  Muat Ulang
                </Button>
              </div>
            ) : assets.length === 0 && !assetsError ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-on-surface-variant">
                Memuat data...
              </p>
            ) : (
              <AppSelect
                value={assetId}
                onChange={(v) => setAssetId(v ?? "")}
                options={assetOptions}
                placeholder="Pilih Aset"
                isClearable
                isDisabled={submitting}
              />
            )}
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
                isClearable
                isDisabled={submitting}
              />
            )}
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField label="Pelapor" error={fieldErrors.reported_by?.[0]}>
            <Input
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              placeholder="Nama pelapor"
              maxLength={100}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Jenis Pemeliharaan"
            required
            error={fieldErrors.maintenance_type?.[0]}
          >
            <AppSelect
              value={maintenanceType}
              onChange={(v) =>
                setMaintenanceType((v as MaintenanceType) ?? "corrective")
              }
              options={MAINTENANCE_TYPE_OPTIONS}
              isDisabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FormField label="Prioritas" required error={fieldErrors.priority?.[0]}>
            <AppSelect
              value={priority}
              onChange={(v) => setPriority((v as MaintenancePriority) ?? "medium")}
              options={PRIORITY_OPTIONS}
              isDisabled={submitting}
            />
          </FormField>

          <FormField
            label="Status"
            required
            error={fieldErrors.status?.[0]}
            hint={statusNote}
          >
            <AppSelect
              value={status}
              onChange={(v) => setStatus((v as MaintenanceStatus) ?? "pending")}
              options={STATUS_OPTIONS}
              isSearchable={false}
              isDisabled={submitting}
            />
          </FormField>

          <FormField
            label="Tanggal Jadwal"
            error={fieldErrors.scheduled_date?.[0]}
          >
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Tanggal Mulai"
            error={fieldErrors.started_date?.[0]}
          >
            <Input
              type="date"
              value={startedDate}
              min={scheduledDate || undefined}
              onChange={(e) => setStartedDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Tanggal Selesai"
            error={fieldErrors.completed_date?.[0]}
          >
            <Input
              type="date"
              value={completedDate}
              min={startedDate || undefined}
              onChange={(e) => setCompletedDate(e.target.value)}
              disabled={submitting}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label="Estimasi Biaya"
            error={fieldErrors.estimated_cost?.[0]}
            hint="Opsional, dalam Rupiah"
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="500000"
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Biaya Aktual"
            error={fieldErrors.actual_cost?.[0]}
            hint="Opsional, dalam Rupiah"
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              placeholder="450000"
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Catatan" error={fieldErrors.notes?.[0]}>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan tambahan"
            rows={2}
            disabled={submitting}
          />
        </FormField>

        <FormField label="Hasil / Solusi" error={fieldErrors.resolution?.[0]}>
          <Textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Hasil perbaikan atau solusi yang dilakukan"
            rows={2}
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