"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";

import type { WorkbookSheet } from "./types";

type ExcelSheetViewerProps = {
  sheets: WorkbookSheet[];
  sheetStateKey?: string;
};

const getColumnLetter = (index: number) => {
  let value = index + 1;
  let result = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }

  return result;
};

const badgeClassName = (column: string, value: string) => {
  if (!value || !/confidence|review/i.test(column)) {
    return "";
  }

  if (/needs review/i.test(value)) {
    return "inline-flex rounded-full border border-amber-300/60 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200";
  }

  if (/high|approved/i.test(value)) {
    return "inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-0.5 text-xs font-semibold text-secondary";
  }

  if (/medium/i.test(value)) {
    return "inline-flex rounded-full border border-border bg-card px-2 py-0.5 text-xs font-semibold text-muted";
  }

  return "";
};

const ExcelSheetViewer: React.FC<ExcelSheetViewerProps> = ({ sheets, sheetStateKey }) => {
  const [activeSheetId, setActiveSheetId] = useState(sheets[0]?.id ?? "");
  const firstSheetId = sheets[0]?.id ?? "";

  useEffect(() => {
    setActiveSheetId(firstSheetId);
  }, [firstSheetId, sheetStateKey]);

  useEffect(() => {
    if (!sheets.some((sheet) => sheet.id === activeSheetId)) {
      setActiveSheetId(firstSheetId);
    }
  }, [activeSheetId, firstSheetId, sheets]);

  const activeSheet = useMemo(
    () => sheets.find((sheet) => sheet.id === activeSheetId) ?? sheets[0],
    [activeSheetId, sheets]
  );

  if (!activeSheet) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-border bg-card">
      <div className="border-b border-border bg-card-muted px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{activeSheet.label}</p>
            {activeSheet.description && <p className="text-xs text-muted">{activeSheet.description}</p>}
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted">
            {activeSheet.rows.length} row{activeSheet.rows.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 w-14 min-w-[3.5rem] border-b border-r border-border bg-card-muted px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                #
              </th>
              {activeSheet.columns.map((column, index) => (
                <th
                  key={`${activeSheet.id}-${column}-${index}`}
                  className="min-w-[180px] border-b border-border bg-card px-4 py-3 align-bottom"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                    {getColumnLetter(index)}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-foreground md:text-sm">{column}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeSheet.rows.length > 0 ? (
              activeSheet.rows.map((row, rowIndex) => (
                <tr key={`${activeSheet.id}-row-${rowIndex}`} className="odd:bg-card even:bg-card-muted/40">
                  <th className="sticky left-0 z-10 border-b border-r border-border bg-card-muted px-3 py-3 text-center text-xs font-semibold text-muted">
                    {rowIndex + 2}
                  </th>
                  {activeSheet.columns.map((_, cellIndex) => (
                    <td
                      key={`${activeSheet.id}-row-${rowIndex}-cell-${cellIndex}`}
                      className="border-b border-border px-4 py-3 text-sm text-foreground/90"
                    >
                      {badgeClassName(activeSheet.columns[cellIndex] ?? "", row[cellIndex] || "") ? (
                        <span className={badgeClassName(activeSheet.columns[cellIndex] ?? "", row[cellIndex] || "")}>
                          {row[cellIndex] || ""}
                        </span>
                      ) : (
                        <div className="max-w-[360px] truncate" title={row[cellIndex] || ""}>
                          {row[cellIndex] || ""}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-border bg-card-muted px-3 py-3 text-center text-xs font-semibold text-muted">
                  2
                </th>
                <td
                  className="border-b border-border px-4 py-4 text-sm text-muted"
                  colSpan={Math.max(activeSheet.columns.length, 1)}
                >
                  No rows were detected for this sheet yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-card-muted px-3 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sheets.map((sheet) => (
            <button
              key={sheet.id}
              type="button"
              className={clsx(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                sheet.id === activeSheet.id
                  ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                  : "border-border bg-card text-muted hover:border-[var(--accent-border)] hover:text-foreground"
              )}
              aria-pressed={sheet.id === activeSheet.id}
              onClick={() => setActiveSheetId(sheet.id)}
            >
              {sheet.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExcelSheetViewer;
