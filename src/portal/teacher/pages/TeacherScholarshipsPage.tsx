import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";
import Card from "@/components/ui/Card";
import { PiggyBank } from "lucide-react";

export default function TeacherScholarshipsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Beasiswa"
        description="Melihat data beasiswa siswa pada kelas yang menjadi scope mengajar Anda."
      />

      <Card>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <PiggyBank className="h-16 w-16 text-outline mb-4" />
          <h3 className="text-lg font-semibold text-on-surface mb-2">
            Data Beasiswa Siswa
          </h3>
          <p className="text-sm text-on-surface-variant max-w-md">
            Halaman ini menampilkan informasi beasiswa siswa di kelas Anda.
            Fitur dalam pengembangan.
          </p>
        </div>
      </Card>
    </PageContainer>
  );
}
