import { Inbox } from "lucide-react";

interface TeacherEmptyDataProps {
  title?: string;
  description?: string;
}

/**
 * Empty state untuk section Dashboard Guru yang datanya belum
 * tersedia melalui API yang dapat diakses role Guru secara aman.
 */
export default function TeacherEmptyData({
  title = "Data belum tersedia",
  description,
}: TeacherEmptyDataProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-surface-container-low p-6 text-center">
      <Inbox className="mx-auto h-8 w-8 text-outline" />
      <p className="mt-2 text-sm font-semibold text-on-surface">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-xs text-on-surface-variant">{description}</p>
      )}
    </div>
  );
}
