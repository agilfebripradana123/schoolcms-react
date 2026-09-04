interface PortalPlaceholderProps {
  title: string;
  description?: string;
}

export default function PortalPlaceholder({ title, description }: PortalPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
        <p className="text-sm text-slate-400">Modul belum tersedia.</p>
      </div>
    </div>
  );
}
