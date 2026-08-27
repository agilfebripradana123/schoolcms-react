import { useMemo, type ReactNode } from "react";

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
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-slate-500">Memuat data...</p>
        </div>
      ) : displayedData.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-slate-500">{emptyMessage}</p>
        </div>
      ) : (
        <table className="w-full border-collapse bg-white rounded-xl overflow-hidden border border-slate-200">
          <thead>
            <tr className="bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`${col.headerClassName ?? "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {displayedData.map((row, index) => (
              <tr
                key={`${index}-${JSON.stringify(row)}`}
                className="hover:bg-slate-50"
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
      )}
    </div>
  );
}