import { Construction } from "lucide-react";

interface ModulePlaceholderProps {
  title: string;
  domain: string;
  description?: string;
}

export default function ModulePlaceholder({
  title,
  domain,
  description,
}: ModulePlaceholderProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Construction className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{domain}</p>
        <p className="mt-3 max-w-md text-sm text-slate-400">
          {description ??
            "Modul ini sedang dalam persiapan untuk implementasi frontend."}
        </p>
      </div>
    </div>
  );
}
