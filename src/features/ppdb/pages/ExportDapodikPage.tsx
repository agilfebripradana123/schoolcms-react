import { useCallback, useEffect, useMemo, useState } from "react";
import { Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import { toApiError } from "@/lib/api";
import type { ApiError } from "@/types";
import type { Registrant } from "../api/types";
import { reRegistrantService } from "../api/registration.service";

const PER_PAGE = 20;

export default function ExportDapodikPage() {
  const [data, setData] = useState<Registrant[]>([]);
  const [meta, setMeta] = useState({
    current_page: 1,
    per_page: PER_PAGE,
    total: 0,
    last_page: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [query, setQuery] = useState<
    Record<string, string | number | undefined>
  >({ page: 1, per_page: PER_PAGE });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fetchList = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    reRegistrantService
      .exportList({ ...query })
      .then((res) => {
        if (!active) return;
        setData(res.data);
        if (res.meta) setMeta(res.meta);
      })
      .catch((err) => {
        if (!active) return;
        setError(toApiError(err));
        setData([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query]);

  useEffect(() => {
    return fetchList();
  }, [fetchList]);

  const goToPage = useCallback((target: number) => {
    setQuery((prev) => ({ ...prev, page: target }));
  }, []);

  const handleDownload = useCallback(() => {
    // Backend download via blob link dengan auth header
    const ids = selectedIds.length > 0 ? selectedIds.join(",") : undefined;
    reRegistrantService
      .exportDapodik({ ids })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "export-dapodik.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        void toApiError(err);
      });
  }, [selectedIds]);

const columns = useMemo(() => {
    type Row = Registrant;
    const c = (lbl: string, acc: keyof Row) => ({
      header: lbl,
      accessor: acc,
      render: (_v: unknown, row: Row) => (
        <span className="text-xs text-on-surface-variant whitespace-nowrap">
          {String(row[acc] ?? "-")}
        </span>
      ),
    });
    const e = (lbl: string) => ({
      header: lbl,
      accessor: "id" as const,
      render: () => <span className="text-xs text-on-surface-variant">-</span>,
    });
    return [
      {
        header: "Pilih",
        accessor: "id" as const,
        render: (_v: unknown, row: Row) => (
          <input
            type="checkbox"
            checked={selectedIds.includes(row.id)}
            onChange={(e) => {
              if (e.target.checked) setSelectedIds((p) => [...p, row.id]);
              else setSelectedIds((p) => p.filter((x) => x !== row.id));
            }}
          />
        ),
      },
      c("No", "id"),
      c("Nama", "full_name"),
      c("NIPD", "nisn"),
      c("JK", "gender"),
      c("NISN", "nisn"),
      c("Tempat Lahir", "birth_place"),
      c("Tanggal Lahir", "birth_date"),
      c("NIK", "nik"),
      c("Agama", "religion"),
      c("Alamat", "address"),
      c("RT", "rt"),
      c("RW", "rw"),
      c("Dusun", "village"),
      c("Kelurahan", "village"),
      c("Kecamatan", "district"),
      c("Kode Pos", "postal_code"),
      e("Jenis Tinggal"),
      e("Alat Transportasi"),
      c("Telepon", "phone"),
      c("HP", "phone"),
      c("E-Mail", "email"),
      e("SKHUN"),
      e("Penerima KPS"),
      e("No. KPS"),
      c("Ayah Nama", "father_name"),
      c("Ayah Tgl Lahir", "father_birth_date"),
      c("Ayah Pendidikan", "father_education"),
      c("Ayah Pekerjaan", "father_occupation"),
      c("Ayah Penghasilan", "father_income"),
      c("Ayah NIK", "father_nik"),
      c("Ibu Nama", "mother_name"),
      c("Ibu Tgl Lahir", "mother_birth_date"),
      c("Ibu Pendidikan", "mother_education"),
      c("Ibu Pekerjaan", "mother_occupation"),
      c("Ibu Penghasilan", "mother_income"),
      c("Ibu NIK", "mother_nik"),
      c("Wali Nama", "guardian_name"),
      c("Wali Tgl Lahir", "guardian_birth_date"),
      c("Wali Pendidikan", "guardian_education"),
      c("Wali Pekerjaan", "guardian_occupation"),
      c("Wali NIK", "guardian_nik"),
      e("Rombel Saat Ini"),
      e("No Peserta UN"),
      c("No Seri Ijazah", "diploma_number"),
      e("Penerima KIP"),
      e("Nomor KIP"),
      e("Nama di KIP"),
      e("Nomor KKS"),
      e("No Registrasi Akta Lahir"),
      e("Bank"),
      e("Nomor Rekening Bank"),
      e("Rekening Atas Nama"),
      e("Layak PIP"),
      e("Alasan Layak PIP"),
      c("Kebutuhan Khusus", "special_needs"),
      c("Sekolah Asal", "previous_school"),
      c("Anak ke", "birth_order"),
      e("Lintang"),
      e("Bujur"),
      c("No KK", "document_kk"),
      e("Berat Badan"),
      e("Tinggi Badan"),
      e("Lingkar Kepala"),
      c("Jml Saudara", "sibling_count"),
      e("Jarak Rumah"),
      {
        header: "No. Pendaftaran",
        accessor: "registration_number" as const,
        render: (_v: unknown, row: Row) => (
          <span className="text-xs font-semibold text-on-surface whitespace-nowrap">
            {row.registration_number ?? "-"}
          </span>
        ),
      },
      {
        header: "Tgl Verifikasi",
        accessor: "re_registration_verified_at" as const,
        render: (_v: unknown, row: Row) => (
          <span className="text-xs text-on-surface-variant whitespace-nowrap">
            {row.re_registration_verified_at
              ? String(row.re_registration_verified_at).substring(0, 10)
              : "-"}
          </span>
        ),
      },
    ];
  }, [selectedIds]);

  const from =
    meta.total === 0 ? 0 : (meta.current_page - 1) * meta.per_page + 1;
  const to = Math.min(meta.current_page * meta.per_page, meta.total);

  return (
    <PageContainer className="py-6">
      <PageHeader
        title="Export Dapodik"
        description="Daftar registrant PPDB status: daftar ulang selesai & diverifikasi, belum terintegrasi ke sistem siswa (siap export)."
        actions={
          <Button
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleDownload}
            disabled={meta.total === 0}
          >
            Download Excel
          </Button>
        }
      />
      <Card>
        {error ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl py-10">
            <p className="text-sm text-error">{error.message}</p>
            <Button variant="secondary" onClick={fetchList}>
              Muat Ulang
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            loading={loading}
            emptyMessage="Tidak ada registrant untuk diexport."
          />
        )}
        {!error && !loading && meta.total > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-on-surface-variant">
              Menampilkan {from}-{to} dari {meta.total} data
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.current_page <= 1}
                onClick={() => goToPage(meta.current_page - 1)}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-on-surface-variant">
                Halaman {meta.current_page} dari {meta.last_page}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => goToPage(meta.current_page + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
