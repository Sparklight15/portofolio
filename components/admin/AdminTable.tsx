import type { ReactNode } from "react";

export type AdminTableRow = {
  id: string;
  no: number;
  title: string;
  time: string;
  category: string;
  actions?: ReactNode;
};

type AdminTableProps = {
  rows: AdminTableRow[];
};

export function AdminTable({ rows }: AdminTableProps) {
  return (
    <div className="overflow-x-auto border border-foreground">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-foreground bg-surface">
            <th className="w-16 px-4 py-3 text-label uppercase text-muted">
              No
            </th>
            <th className="px-4 py-3 text-label uppercase text-muted">Judul</th>
            <th className="px-4 py-3 text-label uppercase text-muted">Waktu</th>
            <th className="px-4 py-3 text-label uppercase text-muted">Jenis</th>
            <th className="px-4 py-3 text-right text-label uppercase text-muted">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-b-0 hover:bg-surface"
            >
              <td className="px-4 py-3 text-body text-muted">{row.no}</td>
              <td className="px-4 py-3 text-body font-medium text-foreground">
                {row.title}
              </td>
              <td className="px-4 py-3 text-body text-charcoal">{row.time}</td>
              <td className="px-4 py-3 text-body text-charcoal capitalize">
                {row.category}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">{row.actions}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}