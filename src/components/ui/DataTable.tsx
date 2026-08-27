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
          <p className="text-sm text-slate-500">Memuat data...</p>
        </div>
      ) : displayedData.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-1">
          <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
          <p className="text-xs text-slate-400">Data akan tampil di sini setelah tersedia.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-slate-200">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className={`${col.headerClassName ?? "px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedData.map((row, index) => (
                <tr
                  key={`${index}-${JSON.stringify(row)}`}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  {columns.map((col) => {
                    const value = row[col.accessor];
                    const cellContent = col.render ? col.render(value, row) : String(value ?? "");
                    return (
                      <td
                        key={col.header}
                        className={col.className ?? "px-6 py-4 text-sm text-slate-700"}
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