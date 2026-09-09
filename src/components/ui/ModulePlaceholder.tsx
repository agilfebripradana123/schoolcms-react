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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low">
          <Construction className="h-8 w-8 text-outline" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-on-surface">{title}</h2>
        <p className="mt-1 text-sm text-outline">{domain}</p>
        <p className="mt-3 max-w-md text-sm text-outline">
          {description ??
            "Modul ini sedang dalam persiapan untuk implementasi frontend."}
        </p>
      </div>
    </div>
  );
}
