import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { DollarSign } from "lucide-react";

export default function TeacherTransactionsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Transaksi"
        description="Melihat transaksi keuangan siswa pada kelas yang menjadi scope mengajar Anda."
      />

      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <DollarSign className="h-16 w-16 text-outline mb-4" />
          <h3 className="text-lg font-semibold text-on-surface mb-2">
            Data Transaksi Siswa
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            Halaman ini menampilkan informasi transaksi keuangan siswa di kelas Anda.
            Fitur dalam pengembangan.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
