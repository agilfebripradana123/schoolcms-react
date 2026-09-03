import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, Camera, Pencil, X, Save } from "lucide-react";
import { api } from "@/lib/api";
import { toApiError } from "@/lib/api/error";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/useAuth";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type Student = Record<string, unknown> & {
  name: string;
  photo?: string | null;
  parent?: Record<string, unknown> | null;
  guardians?: unknown[];
};
type Field = {
  key: string;
  label: string;
  type?: "text" | "date" | "number" | "email";
  render?: (v: unknown) => string;
  options?: { value: string; label: string }[];
  noRed?: boolean;
  readOnly?: boolean;
};
type Group = {
  title: string;
  fields: Field[];
  editable: boolean;
  noRed?: boolean;
};

const GROUPS: Group[] = [
  {
    title: "Identitas Siswa",
    editable: true,
    fields: [
      { key: "name", label: "Nama Lengkap" },
      { key: "nis", label: "NIS" },
      { key: "nisn", label: "NISN" },
      { key: "nik", label: "NIK" },
      {
        key: "gender",
        label: "Jenis Kelamin",
        render: (v) =>
          v === "L" ? "Laki-laki" : v === "P" ? "Perempuan" : String(v ?? "—"),
        options: [
          { value: "L", label: "Laki-laki" },
          { value: "P", label: "Perempuan" },
        ],
      },
      { key: "religion", label: "Agama" },
      { key: "birth_place", label: "Tempat Lahir" },
      { key: "birth_date", label: "Tanggal Lahir", type: "date" },
      { key: "special_needs", label: "Kebutuhan Khusus", noRed: true },
    ],
  },
  {
    title: "Alamat & Domisili",
    editable: true,
    fields: [
      { key: "address", label: "Alamat" },
      { key: "rt", label: "RT" },
      { key: "rw", label: "RW" },
      { key: "hamlet", label: "Dusun" },
      { key: "village", label: "Desa/Kelurahan" },
      { key: "district", label: "Kecamatan" },
      { key: "postal_code", label: "Kode Pos" },
      { key: "residence_type", label: "Jenis Tinggal" },
      { key: "transportation", label: "Transportasi" },
    ],
  },
  {
    title: "Data Akademik",
    editable: true,
    fields: [
      { key: "class_name", label: "Kelas" },
      { key: "previous_school", label: "Asal Sekolah" },
      { key: "skhun", label: "SKHUN" },
      { key: "national_exam_number", label: "No Ujian Nasional" },
      { key: "diploma_serial_number", label: "No Seri Ijazah" },
      { key: "birth_order", label: "Anak Ke", type: "number" },
      { key: "sibling_count", label: "Jumlah Saudara", type: "number" },
    ],
  },
  {
    title: "Fisik & Lokasi",
    editable: true,
    fields: [
      { key: "weight", label: "Berat (kg)", type: "number" },
      { key: "height", label: "Tinggi (cm)", type: "number" },
      {
        key: "head_circumference",
        label: "Lingkar Kepala (cm)",
        type: "number",
      },
      {
        key: "school_distance",
        label: "Jarak ke Sekolah (km)",
        type: "number",
      },
      { key: "latitude", label: "Lintang", type: "number" },
      { key: "longitude", label: "Bujur", type: "number" },
    ],
  },
  {
    title: "Administrasi",
    editable: true,
    fields: [
      { key: "family_card_number", label: "No KK" },
      { key: "birth_certificate_registration_number", label: "No Akta Lahir" },
      { key: "telephone", label: "Telepon Rumah" },
    ],
  },
  {
    title: "Bantuan",
    editable: true,
    noRed: true,
    fields: [
      {
        key: "kps_recipient",
        label: "Penerima KPS",
        render: (v) => (v ? "Ya" : "Tidak"),
      },
      { key: "kps_number", label: "No KPS" },
      {
        key: "kip_recipient",
        label: "Penerima KIP",
        render: (v) => (v ? "Ya" : "Tidak"),
      },
      { key: "kip_number", label: "No KIP" },
      { key: "kip_name", label: "Nama di KIP" },
      { key: "kks_number", label: "No KKS" },
      {
        key: "pip_eligible",
        label: "Layak PIP",
        render: (v) => (v ? "Ya" : "Tidak"),
      },
      { key: "pip_reason", label: "Alasan PIP" },
    ],
  },
  {
    title: "Bank",
    editable: true,
    fields: [
      { key: "bank_name", label: "Nama Bank" },
      { key: "bank_account_number", label: "No Rekening" },
      { key: "bank_account_holder", label: "Atas Nama" },
    ],
  },
  {
    title: "Kontak",
    editable: true,
    fields: [
      { key: "phone", label: "No HP" },
      { key: "email", label: "Email", type: "email" },
    ],
  },
];

const PARENT_FIELDS: Field[] = [
  { key: "father_name", label: "Nama Ayah" },
  { key: "mother_name", label: "Nama Ibu" },
  { key: "father_occupation", label: "Pekerjaan Ayah" },
  { key: "mother_occupation", label: "Pekerjaan Ibu" },
  { key: "phone", label: "No HP Orang Tua" },
  { key: "address", label: "Alamat Orang Tua" },
];

function isEmpty(v: unknown) {
  return v == null || v === "" || (v === 0 && false);
}
function fmt(v: unknown, render?: (v: unknown) => string) {
  if (render) return render(v);
  if (v == null || v === "") return "—";
  return String(v);
}

export default function StudentProfilePage() {
  const [data, setData] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const { updateUser } = useAuth();

  useEffect(() => {
    let a = true;
    (async () => {
      try {
        const r = await api.get<{ success: boolean; data: Student }>(
          "/student/profile",
        );
        if (a) setData(r.data as Student);
      } catch (e) {
        if (a) {
          const m = toApiError(e).message;
          toast.error("Gagal memuat profil", { description: m });
          setError(m);
        }
      } finally {
        if (a) setLoading(false);
      }
    })();
    return () => {
      a = false;
    };
  }, []);

  const startEdit = (
    title: string,
    fields: Field[],
    source: Record<string, unknown>,
  ) => {
    const d: Record<string, string> = {};
    for (const f of fields) {
      const v = source[f.key];
      d[f.key] = v == null ? "" : String(v);
    }
    setDraft(d);
    setEditing(title);
  };

  const saveGroup = async (
    title: string,
    fields: Field[],
    isParent = false,
  ) => {
    // frontend NIK 16 digit validation
    if (!isParent && draft["nik"] !== undefined) {
      const nik = (draft["nik"] ?? "").trim();
      if (nik !== "" && !/^\d{16}$/.test(nik)) {
        toast.error("NIK harus 16 digit angka", {
          description: `Saat ini ${nik.length} digit. Kosongkan jika belum punya.`,
        });
        return;
      }
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      const parentPayload: Record<string, unknown> = {};
      for (const f of fields) {
        const raw = draft[f.key] ?? "";
        const val =
          raw === ""
            ? null
            : f.type === "number"
              ? raw === ""
                ? null
                : Number(raw)
              : raw;
        if (isParent) parentPayload[f.key] = val;
        else payload[f.key] = val;
      }
      const body = isParent ? { parent: parentPayload } : payload;
      const r = await api.put<{ success: boolean; data: Student }>(
        "/student/profile",
        body,
      );
      setData(r.data as Student);
      if (!isParent && (payload as Record<string, unknown>).name)
        updateUser({ name: String((payload as Record<string, unknown>).name) });
      toast.success("Profil diperbarui");
      setEditing(null);
    } catch (e) {
      toast.error("Gagal menyimpan", { description: toApiError(e).message });
    } finally {
      setSaving(false);
    }
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const preview = URL.createObjectURL(f);
    setPreviewUrl(preview);
    setImgFailed(false);
    const fd = new FormData();
    fd.append("photo", f);
    setPhotoSaving(true);
    try {
      const r = await api.post<{ success: boolean; data: Student }>(
        "/student/profile/photo",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } } as never,
      );
      const updated = r.data as Student;
      setData(updated);
      if (updated.photo) updateUser({ photo: updated.photo as string });
      toast.success("Foto diperbarui");
    } catch (err) {
      toast.error("Gagal upload foto", {
        description: toApiError(err).message,
      });
    } finally {
      setPhotoSaving(false);
      if (fileRef.current) fileRef.current.value = "";
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (error)
    return (
      <PageContainer>
        <Card>
          <div className="p-6 text-sm text-error">{error}</div>
        </Card>
      </PageContainer>
    );
  if (!data) return null;

  const photoUrl = (data.photo as string) || null;
  const src = data as Record<string, unknown>;

  return (
    <PageContainer>
      <PageHeader
        title="Profil Saya"
        description="Lengkapi data yang bertanda merah. "
      />

      <Card className="mb-6">
        <div className="flex flex-col items-center gap-4 p-2">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={String(data.name)}
              className="h-32 w-32 rounded-2xl object-cover border"
            />
          ) : photoUrl && !imgFailed ? (
            <img
              src={photoUrl}
              alt={String(data.name)}
              className="h-32 w-32 rounded-2xl object-cover border"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-slate-100 border border-dashed">
              <ShieldCheck className="h-10 w-10 text-slate-400" />
            </div>
          )}
          {imgFailed && photoUrl && !previewUrl && (
            <p className="text-xs text-slate-400">
              Foto tersimpan, tap Ubah Foto untuk mengganti.
            </p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhoto}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={photoSaving}
          >
            {photoSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" /> Ubah Foto
              </>
            )}
          </Button>
          <p className="text-xs text-on-surface-variant">
            JPG/PNG/WEBP, maks 2 MB
          </p>
        </div>
      </Card>

      {GROUPS.map((g) => {
        const isEditing = editing === g.title;
        const incomplete =
          g.editable && !g.noRed
            ? g.fields.filter((f) => !f.noRed && isEmpty(src[f.key]))
            : [];
        return (
          <Card key={g.title} className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant flex items-center gap-2">
                {g.title}
                {incomplete.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-error-container px-2 py-0.5 text-xs font-semibold text-error">
                    {incomplete.length} belum lengkap
                  </span>
                )}
              </h2>
              {g.editable && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(g.title, g.fields, src)}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
              )}
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(null)}
                    disabled={saving}
                  >
                    <X className="h-4 w-4" /> Batal
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveGroup(g.title, g.fields)}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}{" "}
                    Simpan
                  </Button>
                </div>
              )}
            </div>
            {!isEditing ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                {g.fields.map((f) => {
                  const v = src[f.key];
                  const empty =
                    g.editable && !g.noRed && !f.noRed && isEmpty(v);
                  return (
                    <div
                      key={f.key}
                      className={
                        empty
                          ? "rounded-xl border border-error/30 bg-error-container/20 p-3"
                          : ""
                      }
                    >
                      <dt
                        className={`text-xs ${empty ? "text-error font-semibold" : "text-on-surface-variant"}`}
                      >
                        {f.label}{" "}
                        {empty && (
                          <span className="ml-1 text-error">• belum diisi</span>
                        )}
                      </dt>
                      <dd
                        className={`mt-1 font-medium break-words ${empty ? "text-error" : "text-on-surface"}`}
                      >
                        {fmt(v, f.render)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {g.fields.map((f) => (
                  <label key={f.key} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-on-surface-variant">
                      {f.label}
                    </span>
                    {f.options ? (
                      <select
                        value={draft[f.key] ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                        }
                        className="rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">— Pilih —</option>
                        {f.options.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type ?? "text"}
                        value={draft[f.key] ?? ""}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                        }
                        className={`rounded-xl border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary ${!g.noRed && !f.noRed && isEmpty(src[f.key]) ? "border-error/40 bg-error-container/10" : "border-slate-200"}`}
                        placeholder={f.label}
                      />
                    )}
                  </label>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      {/* Orang Tua / Wali */}
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-on-surface-variant flex items-center gap-2">
            Orang Tua / Wali
            {(() => {
              const p = data.parent as Record<string, unknown> | null;
              const miss = !p
                ? PARENT_FIELDS.length
                : PARENT_FIELDS.filter((f) => isEmpty(p[f.key])).length;
              return miss > 0 ? (
                <span className="inline-flex rounded-full bg-error-container px-2 py-0.5 text-xs font-semibold text-error">
                  {miss} belum lengkap
                </span>
              ) : null;
            })()}
          </h2>
          {editing !== "Orang Tua / Wali" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                startEdit(
                  "Orang Tua / Wali",
                  PARENT_FIELDS,
                  (data.parent as Record<string, unknown>) ?? {},
                )
              }
            >
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                <X className="h-4 w-4" /> Batal
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  saveGroup("Orang Tua / Wali", PARENT_FIELDS, true)
                }
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}{" "}
                Simpan
              </Button>
            </div>
          )}
        </div>
        {editing !== "Orang Tua / Wali" ? (
          data.parent ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              {PARENT_FIELDS.map((f) => {
                const v = (data.parent as Record<string, unknown>)[f.key];
                const empty = isEmpty(v);
                return (
                  <div
                    key={f.key}
                    className={
                      empty
                        ? "rounded-xl border border-error/30 bg-error-container/20 p-3"
                        : ""
                    }
                  >
                    <dt
                      className={`text-xs ${empty ? "text-error font-semibold" : "text-on-surface-variant"}`}
                    >
                      {f.label}{" "}
                      {empty && (
                        <span className="ml-1 text-error">• belum diisi</span>
                      )}
                    </dt>
                    <dd
                      className={`mt-1 font-medium break-words ${empty ? "text-error" : "text-on-surface"}`}
                    >
                      {fmt(v)}
                    </dd>
                  </div>
                );
              })}
            </dl>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Belum ada data orang tua.
            </p>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {PARENT_FIELDS.map((f) => (
              <label key={f.key} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-on-surface-variant">
                  {f.label}
                </span>
                <input
                  value={draft[f.key] ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [f.key]: e.target.value }))
                  }
                  className="rounded-xl border border-slate-200 bg-surface px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={f.label}
                />
              </label>
            ))}
          </div>
        )}
        {Array.isArray(data.guardians) &&
          (data.guardians as unknown[]).length > 0 &&
          editing !== "Orang Tua / Wali" && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-on-surface-variant">
                Wali Tambahan
              </h3>
              <ul className="mt-2 space-y-2 text-sm">
                {(data.guardians as { name: string; relation: string }[]).map(
                  (g, i) => (
                    <li
                      key={i}
                      className="rounded-xl bg-surface-container-low p-3"
                    >
                      {g.name} — {g.relation}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
      </Card>
    </PageContainer>
  );
}
