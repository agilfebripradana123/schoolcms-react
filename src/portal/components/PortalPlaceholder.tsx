interface PortalPlaceholderProps {
  title: string;
  description?: string;
}

export default function PortalPlaceholder({ title, description }: PortalPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-secondary">{description}</p>}
      </div>
      <div className="rounded-xl border border-dashed border-outline bg-surface p-12 text-center shadow-sm">
        <p className="text-sm text-secondary">Modul belum tersedia.</p>
      </div>
    </div>
  );
}
