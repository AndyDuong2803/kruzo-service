"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { FiDownload, FiFileText } from "react-icons/fi";

import ProcessingHistoryPagination from "./ProcessingHistoryPagination";
import type { HistoryStatus, ProcessedUpload } from "./types";

type HistoryFilter = "all" | "processing" | "done" | "failed";

type ProcessingHistoryProps = {
  history: ProcessedUpload[];
  activeResultId?: string;
  highlighted?: boolean;
  modalHighlighted?: boolean;
  onViewResult: (id: string) => void;
  onDownloadCsv: (id: string) => void;
};

const pageSize = 10;

const filterOptions: { value: HistoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "processing", label: "Processing" },
  { value: "done", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const statusLabel: Record<HistoryStatus, string> = {
  queued: "Queued",
  processing: "Processing",
  done: "Completed",
  failed: "Failed",
};

const statusClassName: Record<HistoryStatus, string> = {
  queued: "border-border bg-card text-muted",
  processing: "border-amber-300/70 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100",
  done: "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary",
  failed: "border-red-300/70 bg-red-100 text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100",
};

const resultSummary = (item: ProcessedUpload) => {
  if (item.status === "failed") {
    return "No result";
  }

  if (item.status === "queued" || item.status === "processing") {
    return item.message ?? "Waiting for result";
  }

  const fieldCount = item.preview?.rows.length ?? 0;
  const tableRowCount = item.preview?.tables.reduce((total, table) => total + table.rows.length, 0) ?? 0;

  if (fieldCount === 0 && tableRowCount === 0) {
    return "No structured fields";
  }

  return `${fieldCount} field${fieldCount === 1 ? "" : "s"}${tableRowCount > 0 ? `, ${tableRowCount} table row${tableRowCount === 1 ? "" : "s"}` : ""}`;
};

const actionLabel = (item: ProcessedUpload) => {
  if (item.status === "failed") {
    return "Details";
  }

  if (item.status === "done") {
    return "View result";
  }

  return "View status";
};

const ProcessingHistory: React.FC<ProcessingHistoryProps> = ({
  history,
  activeResultId,
  highlighted = false,
  modalHighlighted = false,
  onViewResult,
  onDownloadCsv,
}) => {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const filteredHistory = useMemo(() => {
    if (filter === "all") {
      return history;
    }

    if (filter === "processing") {
      return history.filter((item) => item.status === "queued" || item.status === "processing");
    }

    return history.filter((item) => item.status === filter);
  }, [filter, history]);
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const visibleHistory = filteredHistory.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  const changeFilter = (value: HistoryFilter) => {
    setFilter(value);
    setCurrentPage(1);
  };

  return (
    <div
      data-tour-target="history"
      className={clsx(
        "soft-glow min-w-0 overflow-hidden rounded-2xl border border-border bg-card",
        highlighted && "guided-target-active"
      )}
    >
      <div className="border-b border-border bg-card-muted px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-secondary">Session results</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">Processing history</h2>
            <p className="mt-1 text-sm text-muted">
              {history.length > 0
                ? `${history.length} submitted file${history.length === 1 ? "" : "s"}`
                : "Submitted files will appear here."}
            </p>
            <p
              data-tour-target="modalPreview"
              className={clsx("mt-2 text-sm text-muted", modalHighlighted && "guided-target-active rounded-lg px-2 py-1")}
            >
              Open a result to review the workbook and download CSV.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={clsx(
                "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                filter === option.value
                  ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                  : "border-border bg-card text-muted hover:border-[var(--accent-border)] hover:text-foreground"
              )}
              onClick={() => changeFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 md:p-6">
        {history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card-muted p-5 text-sm text-muted">
            No processing history yet. Submit documents to save results for this session.
          </div>
        ) : visibleHistory.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card-muted p-5 text-sm text-muted">
            No files match this filter.
          </div>
        ) : (
          <div className="grid gap-3">
            {visibleHistory.map((item) => {
              const canDownload = item.status === "done" && Boolean(item.preview?.hasUsableData);

              return (
                <div
                  key={item.id}
                  className={clsx(
                    "rounded-xl border bg-card-muted p-4 transition-colors",
                    activeResultId === item.id ? "border-[var(--accent-border)]" : "border-border"
                  )}
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="brand-icon icon-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                        <FiFileText aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground" title={item.file.name}>
                          {item.file.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span>{item.processedAtLabel ?? item.submittedAtLabel}</span>
                          <span className={clsx("rounded-full border px-2 py-0.5 font-semibold", statusClassName[item.status])}>
                            {statusLabel[item.status]}
                          </span>
                          <span>{resultSummary(item)}</span>
                        </div>
                        {item.status === "failed" && item.message && (
                          <p className="mt-2 text-xs text-muted">{item.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        className="brand-button brand-button-secondary button-pop px-3 py-2 text-sm"
                        onClick={() => onViewResult(item.id)}
                      >
                        {actionLabel(item)}
                      </button>
                      {canDownload && (
                        <button
                          type="button"
                          className="brand-button brand-button-primary button-pop gap-2 px-3 py-2 text-sm"
                          onClick={() => onDownloadCsv(item.id)}
                        >
                          <FiDownload aria-hidden="true" />
                          Download CSV
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TODO: Replace client-side session history with backend paginated history when user accounts/history API are available. */}
        <ProcessingHistoryPagination
          currentPage={effectivePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default ProcessingHistory;
