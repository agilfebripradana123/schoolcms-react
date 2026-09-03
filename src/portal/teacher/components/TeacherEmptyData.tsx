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
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <Inbox className="mx-auto h-8 w-8 text-slate-300" />
      <p className="mt-2 text-sm font-semibold text-slate-600">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-xs text-slate-400">{description}</p>}
    </div>
  );
}
