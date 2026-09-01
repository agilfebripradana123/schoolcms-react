import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Form";
import Modal from "@/components/ui/Modal";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import { staffService } from "../api/staff.service";
import type { CreateStaffPayload, Staff } from "../api/types";

interface StaffFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: Staff | null;
}

export default function StaffForm({
  open,
  onClose,
  onSaved,
  initialData,
}: StaffFormProps) {
  const isEdit = Boolean(initialData);

  const [staffNumber, setStaffNumber] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const [previousOpen, setPreviousOpen] = useState(open);
  const [previousInitialData, setPreviousInitialData] = useState(initialData);

  if (open !== previousOpen || initialData !== previousInitialData) {
    setPreviousOpen(open);
    setPreviousInitialData(initialData);

    if (open) {
      setStaffNumber(initialData?.staff_number ?? "");
      setName(initialData?.name ?? "");
      setPosition(initialData?.position ?? "");
      setDepartment(initialData?.department ?? "");
      setPhone(initialData?.phone ?? "");
      setEmail(initialData?.email ?? "");
      setIsActive(initialData?.is_active ?? true);
      setError(null);
      setFieldErrors({});
    }
  }

  // Auto-generate no. staf (STF-001..) hanya untuk staf baru
  useEffect(() => {
    if (open && !initialData) {
      let active = true;
      staffService
        .list({ per_page: 100 })
        .then((res) => {
          if (!active) return;
          const max = res.data.reduce((m, s) => {
            const n = parseInt((s.staff_number ?? "").replace(/^STF-0*/, ""), 10);
            return Number.isNaN(n) ? m : Math.max(m, n);
          }, 0);
          setStaffNumber(`STF-${String(max + 1).padStart(3, "0")}`);
        })
        .catch(() => {
          // biarkan kosong bila gagal memuat
        });
      return () => {
        active = false;
      };
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    if (!name.trim()) {
      setError({ message: "Nama lengkap wajib diisi." });
      setSubmitting(false);
      return;
    }

    const payload: CreateStaffPayload = {
      staff_number: staffNumber.trim() || undefined,
      name: name.trim(),
      position: position.trim() || undefined,
      department: department.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      is_active: isActive,
    };

    try {
      if (initialData) {
        await staffService.update(initialData.id, payload);
      } else {
        await staffService.create(payload);
      }
      toast.success(
        isEdit
          ? "Data staf berhasil diperbarui."
          : "Data staf berhasil ditambahkan.",
      );
      onSaved();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError);
      if (apiError.errors) {
        setFieldErrors(apiError.errors);
      }
      toast.error(apiError.message || "Gagal menyimpan data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Data Staf" : "Tambah Staf Baru"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button type="submit" form="staff-form" loading={submitting}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="staff-form" onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {isEdit && (
            <FormField label="No. Staf" error={fieldErrors.staff_number?.[0]}>
              <Input
                value={staffNumber}
                onChange={(e) => setStaffNumber(e.target.value)}
                placeholder="Contoh: STF-006"
                disabled
                maxLength={20}
              />
            </FormField>
          )}

          <FormField label="Telepon / WhatsApp" error={fieldErrors.phone?.[0]}>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08123456789"
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Nama Lengkap" required error={fieldErrors.name?.[0]}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama lengkap staf"
            disabled={submitting}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Jabatan" error={fieldErrors.position?.[0]}>
            <Input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Contoh: Operator Sekolah, Pustakawan"
              disabled={submitting}
            />
          </FormField>

          <FormField label="Departemen / Bagian" error={fieldErrors.department?.[0]}>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Contoh: Tata Usaha, Perpustakaan"
              disabled={submitting}
            />
          </FormField>
        </div>

        <FormField label="Email" error={fieldErrors.email?.[0]}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@sekolah.sch.id"
            disabled={submitting}
          />
        </FormField>

        <label className="flex items-center gap-2 text-sm font-medium text-on-surface">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={submitting}
            className="h-4 w-4 rounded border-slate-300 text-primary-container focus:ring-primary-container"
          />
          Staf aktif
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