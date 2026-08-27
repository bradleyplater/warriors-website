import type { ReactNode } from "react";
import "./ds.css";

export type DataTableColumn = {
  header: ReactNode;
  align?: "left" | "right";
  numeric?: boolean;
  strong?: boolean;
  sortKey?: string;
};

type Props = {
  columns: DataTableColumn[];
  rows: ReactNode[][];
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (sortKey: string) => void;
  className?: string;
};

export function DataTable({ columns, rows, sortKey, sortDirection, onSort, className }: Props) {
  const classes = ["ds-table", className].filter(Boolean).join(" ");
  return (
    <table className={classes}>
      {columns.length > 0 && (
        <thead>
          <tr>
            {columns.map((c, i) => {
              const sortable = Boolean(onSort && c.sortKey);
              const active = sortable && sortKey === c.sortKey;
              return (
                <th
                  key={i}
                  data-align={c.align === "right" ? "right" : undefined}
                  data-sortable={sortable ? "true" : undefined}
                  aria-sort={
                    active ? (sortDirection === "asc" ? "ascending" : "descending") : undefined
                  }
                  onClick={sortable ? () => onSort!(c.sortKey!) : undefined}
                >
                  {c.header}
                  {active ? (sortDirection === "asc" ? " ▲" : " ▼") : ""}
                </th>
              );
            })}
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => {
              const col = columns[ci];
              return (
                <td
                  key={ci}
                  data-numeric={col?.numeric ? "true" : undefined}
                  data-align={col?.align === "right" ? "right" : undefined}
                  data-strong={col?.strong ? "true" : undefined}
                >
                  {cell}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
