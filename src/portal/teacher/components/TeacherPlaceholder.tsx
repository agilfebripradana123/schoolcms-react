import PageContainer from "@/components/layout/PageContainer";
import PageHeader from "@/components/layout/PageHeader";

interface TeacherPlaceholderProps {
  title: string;
  description?: string;
}

/**
 * Placeholder halaman Portal Guru untuk modul yang belum tersedia
 * pada fase pengembangan saat ini. Konsisten dengan design system.
 */
export default function TeacherPlaceholder({
  title,
  description,
}: TeacherPlaceholderProps) {
  return (
    <PageContainer className="py-6">
      <PageHeader title={title} description={description} />
      <div className="rounded-2xl border border-dashed border-slate-200 bg-surface-container-lowest p-12 text-center">
        <p className="text-sm text-on-surface-variant">Modul belum tersedia.</p>
      </div>
    </PageContainer>
  );
}
