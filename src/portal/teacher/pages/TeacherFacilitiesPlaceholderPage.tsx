import PortalPlaceholder from "@/portal/components/PortalPlaceholder";

/**
 * Scaffold placeholder untuk modul tambahan Sarana & Prasarana pada Portal Guru.
 * Halaman nyata diimplementasikan pada phase modul; halaman ini hanya
 * menunjukkan bahwa akses route dikunci oleh permission `manage-facilities`.
 */
export default function TeacherFacilitiesPlaceholderPage() {
  return (
    <PortalPlaceholder
      title="Sarana & Prasarana"
      description="Modul Sarana & Prasarana untuk Portal Guru sedang dalam persiapan. Akses halaman ini dibatasi oleh permission tambahan."
    />
  );
}
