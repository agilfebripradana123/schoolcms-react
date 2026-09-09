import { useMemo, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface DataTableColumn<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T>({
  columns,
  data,
  className = "",
  loading = false,
  emptyMessage = "Data tidak tersedia",
}: DataTableProps<T>) {
  const displayedData = useMemo(() => (loading ? [] : data), [loading, data]);

  return (
    <div className={`${className} w-full`}>
      {loading ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-outline">Memuat data...</p>
        </div>
      ) : displayedData.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-1">
          <p className="text-sm font-medium text-on-surface-variant">{emptyMessage}</p>
          <p className="text-xs text-outline">Data akan tampil di sini setelah tersedia.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className={`${col.headerClassName ?? "px-6 py-3.5 text-left text-xs font-semibold text-outline uppercase tracking-wider"}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {displayedData.map((row, index) => (
                <tr
                  key={`${index}-${JSON.stringify(row)}`}
                  className="transition-colors hover:bg-surface-container-low/80"
                >
                  {columns.map((col) => {
                    const value = row[col.accessor];
                    const cellContent = col.render ? col.render(value, row) : String(value ?? "");
                    return (
                      <td
                        key={col.header}
                        className={col.className ?? "px-6 py-4 text-sm text-on-surface"}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}