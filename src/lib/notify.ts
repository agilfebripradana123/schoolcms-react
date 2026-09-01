import { toast } from "sonner";

// ponytail: helper tipis — ubah ke i18n/queue saat pola berulang

type EntityName = string;

export const notifyCreated = (entity: EntityName, label = "Data berhasil ditambahkan") => {
  toast.success(label, {
    description: `${entity} baru sudah tersimpan.`,
  });
};

export const notifyUpdated = (entity: EntityName, label = "Perubahan disimpan") => {
  toast.success(label, {
    description: `${entity} sudah diperbarui.`,
  });
};

export const notifyDeleted = (entity: EntityName, label = "Data dihapus") => {
  toast.warning(label, {
    description: `${entity} sudah dihapus dari sistem.`,
  });
};

export const notifyNotFound = (entity: EntityName, label = "Data tidak ditemukan") => {
  toast.error(label, {
    description: `${entity} yang Anda cari tidak tersedia.`,
  });
};

export const notifyError = (message: string, description?: string) => {
  toast.error(message, description ? { description } : undefined);
};