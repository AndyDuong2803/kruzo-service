"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { FiDownload, FiX } from "react-icons/fi";

import ExcelSheetViewer from "./ExcelSheetViewer";
import type { ProcessedUpload, WorkbookSheet } from "./types";

type ResultPreviewModalProps = {
  result?: ProcessedUpload;
  onClose: () => void;
  onDownloadCsv: (sheet?: WorkbookSheet) => void;
  onDownloadWorkbook: () => void;
};

const statusClassName: Record<ProcessedUpload["status"], string> = {
  queued: "border-border bg-card text-muted",
  processing: "border-amber-500 bg-amber-100 text-amber-950 dark:border-amber-400 dark:bg-amber-500/20 dark:text-amber-100",
  done: "border-emerald-600 bg-emerald-100 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-100",
  failed: "border-red-700 bg-red-600 text-white dark:border-red-400 dark:bg-red-500 dark:text-white",
};

const statusLabel: Record<ProcessedUpload["status"], string> = {
  queued: "Queued",
  processing: "Processing",
  done: "Completed",
  failed: "Failed",
};

const ResultPreviewModal: React.FC<ResultPreviewModalProps> = ({
  result,
  onClose,
  onDownloadCsv,
  onDownloadWorkbook,
}) => {
  const [activeSheetId, setActiveSheetId] = useState("");
  const preview = result?.status === "done" ? result.preview : undefined;
  const canDownload = Boolean(result?.status === "done" && preview?.hasUsableData);
  const sheets = useMemo<WorkbookSheet[]>(() => {
    if (!preview?.hasUsableData) {
      return [];
    }

    return preview.sheets.filter((sheet) => sheet.rows.length > 0);
  }, [preview]);
  const activeSheet = sheets.find((sheet) => sheet.id === activeSheetId) ?? sheets[0];

  useEffect(() => {
    if (!result) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, result]);

  useEffect(() => {
    setActiveSheetId(sheets[0]?.id ?? "");
  }, [result?.id, sheets]);

  if (!result) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:p-5">
      <div
        data-tour-target="modalPreview"
        role="dialog"
        aria-modal="true"
        aria-labelledby="result-preview-title"
        className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
      >
        <div className="flex flex-col gap-4 border-b border-border bg-card-muted px-5 py-4 md:flex-row md:items-start md:justify-between md:px-6">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-secondary">Result preview</p>
            <h2 id="result-preview-title" className="mt-1 truncate text-2xl font-semibold text-foreground">
              {result.file.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className={clsx("rounded-full border px-2.5 py-1 text-xs font-semibold", statusClassName[result.status])}>
                {statusLabel[result.status]}
              </span>
              {result.status === "done" && (
                <span>
                  {preview?.rows.length ?? 0} extracted field{preview?.rows.length === 1 ? "" : "s"}
                </span>
              )}
              <span>{result.processedAtLabel ?? result.submittedAtLabel}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {canDownload && (
              <>
                <button
                  type="button"
                  className="brand-button brand-button-primary button-pop gap-2 px-4 py-2 text-sm"
                  onClick={onDownloadWorkbook}
                >
                  <FiDownload aria-hidden="true" />
                  Download XLSX
                </button>
                <button
                  type="button"
                  className="brand-button brand-button-secondary button-pop gap-2 px-4 py-2 text-sm"
                  onClick={() => onDownloadCsv(activeSheet)}
                >
                  <FiDownload aria-hidden="true" />
                  Download CSV
                </button>
              </>
            )}
            <button
              type="button"
              className="brand-button brand-button-secondary button-pop px-4 py-2 text-sm"
              onClick={onClose}
              aria-label="Close result preview"
            >
              <FiX aria-hidden="true" />
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[calc(92vh-8rem)] overflow-y-auto p-5 md:p-6">
          {result.status === "failed" ? (
            <div className="rounded-2xl border border-border bg-card-muted p-5">
              <h3 className="text-xl font-semibold text-foreground">Extraction failed</h3>
              <p className="mt-2 text-sm text-muted">
                The AI could not structure this document. Try another file or request workflow help.
              </p>
              <p className="mt-3 text-sm text-muted">Try another file, or request a workflow audit for a custom template.</p>
            </div>
          ) : result.status === "queued" || result.status === "processing" ? (
            <div className="rounded-2xl border border-border bg-card-muted p-5">
              <h3 className="text-xl font-semibold text-foreground">Result is not ready yet</h3>
              <p className="mt-2 text-sm text-muted">{result.message || "Kruzo is still processing this file."}</p>
            </div>
          ) : sheets.length > 0 ? (
            <ExcelSheetViewer
              sheets={sheets}
              sheetStateKey={result.id}
              activeSheetId={activeSheet?.id}
              onActiveSheetChange={setActiveSheetId}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card-muted p-5 text-sm text-muted">
              Kruzo could not find structured fields in this document.
            </div>
          )}

          {preview?.rawText && (
            <details className="mt-4 rounded-2xl border border-border bg-card-muted">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground">
                Raw extracted text
              </summary>
              <div className="border-t border-border px-4 pb-4 pt-3">
                <pre className="max-h-72 whitespace-pre-wrap break-words overflow-auto rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
                  <code>{preview.rawText}</code>
                </pre>
              </div>
            </details>
          )}

          {((result.status === "failed" && result.debugDetails) || (preview?.usedFallback && preview.rawJson)) && (
            <details className="mt-4 rounded-2xl border border-border bg-card-muted">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-foreground">
                Technical details
              </summary>
              <div className="border-t border-border px-4 pb-4 pt-3">
                <pre className="max-h-72 overflow-auto rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
                  <code>{result.status === "failed" ? result.debugDetails : preview?.rawJson}</code>
                </pre>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultPreviewModal;
