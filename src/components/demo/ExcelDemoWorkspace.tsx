"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiUploadCloud,
} from "react-icons/fi";
import { HiArrowRight } from "react-icons/hi2";

import Container from "@/components/Container";
import { hasConfiguredApiBaseUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { extractOcr } from "@/lib/api/ocr";
import { buildCsvFromPreviewRows } from "@/lib/ocr/exportCsv";
import {
  DetectedTable,
  normalizeOcrResult,
  PreviewRow,
  samplePreviewRows,
} from "@/lib/ocr/normalizeOcrResult";

type TourTarget = "upload" | "documentType" | "template" | "previewButton" | "table" | "export";

type TourStep = {
  target: TourTarget;
  title: string;
  description: string;
};

const tourStorageKey = "kruzo-try-tour-dismissed";

const documentTypes = ["Auto detect", "Invoice", "Repair order", "Customer form", "Scanned form"];

const excelTemplates = [
  "Basic extraction table",
  "Invoice tracking template",
  "Repair service template",
  "Customer intake template",
];

const tourSteps: TourStep[] = [
  {
    target: "upload",
    title: "Add a document",
    description: "Start by adding a PDF, JPG, PNG, or WEBP.",
  },
  {
    target: "documentType",
    title: "Choose the document type",
    description: "Choose the document type or keep auto-detect.",
  },
  {
    target: "template",
    title: "Pick an Excel format",
    description: "Pick the Excel format you want.",
  },
  {
    target: "previewButton",
    title: "Preview the table",
    description: "Preview the extracted table before exporting.",
  },
  {
    target: "table",
    title: "Review extracted fields",
    description: "Review fields and low-confidence values.",
  },
  {
    target: "export",
    title: "Export or request help",
    description: "Export a sample or send your real workflow for review.",
  },
];

const getPrefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrollTourTargetIntoView = (target: TourTarget) => {
  const element = document.querySelector<HTMLElement>(`[data-tour-target="${target}"]`);

  if (!element) {
    return false;
  }

  const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 80;
  const comfortOffset = headerHeight + 24;
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const isComfortablyVisible = rect.top >= comfortOffset && rect.bottom <= viewportHeight - 120;

  if (isComfortablyVisible) {
    return true;
  }

  const targetY = window.scrollY + rect.top - Math.max(comfortOffset, (viewportHeight - rect.height) / 2);

  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: getPrefersReducedMotion() ? "auto" : "smooth",
  });

  return true;
};

const ExcelDemoWorkspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [excelTemplate, setExcelTemplate] = useState(excelTemplates[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMessage, setPreviewMessage] = useState("Sample preview is shown until a real file/API is connected.");
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>(samplePreviewRows);
  const [detectedTables, setDetectedTables] = useState<DetectedTable[]>([]);
  const [rawJson, setRawJson] = useState("");
  const [showRawJson, setShowRawJson] = useState(false);
  const [usedFallbackShape, setUsedFallbackShape] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  const currentTourStep = tourSteps[tourIndex];

  useEffect(() => {
    try {
      if (localStorage.getItem(tourStorageKey) !== "true") {
        setTourOpen(true);
      }
    } catch {
      setTourOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!tourOpen) {
      return;
    }

    const scrollFrame = window.requestAnimationFrame(() => {
      const foundTarget = scrollTourTargetIntoView(currentTourStep.target);

      if (!foundTarget) {
        setPreviewMessage("Guide target is not visible yet. You can continue with the next step.");
      }
    });

    return () => window.cancelAnimationFrame(scrollFrame);
  }, [currentTourStep.target, tourOpen]);

  const activeTargetClass = (target: TourTarget) =>
    clsx(tourOpen && currentTourStep.target === target && "guided-target-active");

  const progressLabel = useMemo(() => `${tourIndex + 1} of ${tourSteps.length}`, [tourIndex]);

  const dismissTour = () => {
    try {
      localStorage.setItem(tourStorageKey, "true");
    } catch {
      // localStorage can be unavailable in strict privacy contexts.
    }

    setTourOpen(false);
  };

  const restartTour = () => {
    setTourIndex(0);
    setTourOpen(true);
  };

  const goNext = () => {
    if (tourIndex === tourSteps.length - 1) {
      dismissTour();
      return;
    }

    setTourIndex((current) => current + 1);
  };

  const goBack = () => {
    setTourIndex((current) => Math.max(0, current - 1));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file ?? null);
    setFileName(file?.name ?? "");
    setPreviewMessage(file ? `${file.name} selected. Preview it when you are ready.` : "Sample preview is shown until a real file/API is connected.");
  };

  const previewExcel = async () => {
    if (isProcessing) {
      return;
    }

    if (!hasConfiguredApiBaseUrl || !selectedFile) {
      setPreviewRows(samplePreviewRows);
      setDetectedTables([]);
      setRawJson("");
      setShowRawJson(false);
      setUsedFallbackShape(false);
      setPreviewMessage("Sample preview is shown until a real file/API is connected.");
      return;
    }

    setIsProcessing(true);
    setPreviewMessage("Reading the document...");

    try {
      const result = await extractOcr(selectedFile);
      const preview = normalizeOcrResult(result);

      setPreviewRows(preview.rows);
      setDetectedTables(preview.tables);
      setRawJson(preview.rawJson);
      setShowRawJson(preview.usedFallback);
      setUsedFallbackShape(preview.usedFallback);
      setPreviewMessage(preview.usedFallback
        ? "Response received, but the shape was not recognized. Showing fallback table and raw JSON."
        : "Preview ready. Low-confidence fields are flagged."
      );
    } catch (error) {
      const friendlyMessage = error instanceof ApiError
        ? error.friendlyMessage
        : "Something went wrong while processing the document.";

      setPreviewRows(samplePreviewRows);
      setDetectedTables([]);
      setRawJson(error instanceof ApiError && error.details ? JSON.stringify(error.details, null, 2) : "");
      setShowRawJson(false);
      setUsedFallbackShape(error instanceof ApiError && Boolean(error.details));
      setPreviewMessage(`${friendlyMessage} Showing sample preview instead.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([buildCsvFromPreviewRows(previewRows)], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kruzo-document-ai-sample.csv";
    link.click();
    window.URL.revokeObjectURL(url);
    setPreviewMessage("CSV downloaded. Excel can open this file.");
  };

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 md:pt-32">
      <div className="brand-hero-grid absolute inset-0 -z-10 opacity-70"></div>

      {tourOpen && <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px]" aria-hidden="true"></div>}

      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Excel Demo</p>
              <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">Document to Excel Demo</h1>
              <p className="mt-3 max-w-2xl text-muted">
                Upload a document, review the extracted table, and export it to Excel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="brand-button brand-button-secondary button-pop gap-2 px-4 py-2.5 text-sm"
                onClick={restartTour}
              >
                <FiHelpCircle aria-hidden="true" />
                Guide me
              </button>
              <Link href="/try/api" className="nav-link text-sm font-semibold">
                Developer? Open API Playground
              </Link>
            </div>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="min-w-0 space-y-5">
              <div
                data-tour-target="upload"
                className={clsx("brand-card min-w-0 rounded-2xl p-5 md:p-6", activeTargetClass("upload"))}
              >
                <div className="rounded-2xl border-2 border-dashed border-border bg-card-muted p-6 text-center md:p-8">
                  <div className="brand-icon mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <FiUploadCloud size={30} aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold">Upload document</h2>
                  <p className="mt-2 text-muted">PDF, JPG, PNG, or WEBP</p>

                  <input
                    id="demo-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="demo-file"
                    className="brand-button brand-button-primary button-pop mx-auto mt-6 w-fit cursor-pointer gap-2 px-5 py-2.5"
                  >
                    Choose file
                    <HiArrowRight aria-hidden="true" />
                  </label>

                  <p className="mt-4 text-sm text-muted" aria-live="polite">
                    {fileName || "No file selected yet. Sample data is shown on the right."}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
                <div
                  data-tour-target="documentType"
                  className={clsx("brand-card rounded-2xl p-5", activeTargetClass("documentType"))}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <FiFileText className="text-secondary" size={22} aria-hidden="true" />
                    <h2 className="text-xl font-semibold">Document type</h2>
                  </div>
                  <div className="grid gap-2">
                    {documentTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={documentType === type}
                        className={clsx(
                          "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
                          documentType === type
                            ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                            : "border-border bg-card-muted text-foreground hover:border-[var(--accent-border)]"
                        )}
                        onClick={() => setDocumentType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  data-tour-target="template"
                  className={clsx("brand-card rounded-2xl p-5", activeTargetClass("template"))}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <FiGrid className="text-secondary" size={22} aria-hidden="true" />
                    <h2 className="text-xl font-semibold">Excel template</h2>
                  </div>
                  <div className="grid gap-2">
                    {excelTemplates.map((template) => (
                      <button
                        key={template}
                        type="button"
                        aria-pressed={excelTemplate === template}
                        className={clsx(
                          "rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
                          excelTemplate === template
                            ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                            : "border-border bg-card-muted text-foreground hover:border-[var(--accent-border)]"
                        )}
                        onClick={() => setExcelTemplate(template)}
                      >
                        {template}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="soft-glow min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-col gap-4 border-b border-border bg-card-muted px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-secondary">Excel-ready preview</p>
                  <p className="text-sm text-muted">{previewMessage}</p>
                </div>
                <div data-tour-target="previewButton" className={activeTargetClass("previewButton")}>
                  <button
                    type="button"
                    className="brand-button brand-button-primary button-pop gap-2 px-5 py-2.5"
                    onClick={previewExcel}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Preview Excel"}
                    {!isProcessing && <HiArrowRight aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="mb-5 grid gap-3 md:grid-cols-3">
                  {[
                    ["File", fileName || "Sample repair order"],
                    ["Type", documentType],
                    ["Template", excelTemplate],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-card-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-5 rounded-xl border border-border bg-card-muted p-4">
                  <p className="text-sm font-semibold text-foreground">Template matching</p>
                  <p className="mt-2 text-sm text-muted">
                    For real workflows, Kruzo can match your existing Excel template.
                  </p>
                </div>

                <div
                  data-tour-target="table"
                  className={clsx("overflow-hidden rounded-xl border border-border", activeTargetClass("table"))}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                      <thead className="bg-card-muted text-muted">
                        <tr>
                          <th className="border-b border-border px-4 py-3 font-semibold">Field</th>
                          <th className="border-b border-border px-4 py-3 font-semibold">Extracted value</th>
                          <th className="border-b border-border px-4 py-3 font-semibold">Confidence</th>
                          <th className="border-b border-border px-4 py-3 font-semibold">Review</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row) => {
                          const needsReview = row.review === "Needs review";

                          return (
                            <tr key={row.field} className="border-b border-border last:border-b-0">
                              <td className="px-4 py-3 font-semibold">{row.field}</td>
                              <td className="px-4 py-3 text-muted">{row.value}</td>
                              <td className="px-4 py-3 font-semibold text-secondary">{row.confidence}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={clsx(
                                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold",
                                    needsReview
                                      ? "border-border bg-card-muted text-muted"
                                      : "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                                  )}
                                >
                                  {needsReview ? <FiAlertCircle aria-hidden="true" /> : <FiCheckCircle aria-hidden="true" />}
                                  {row.review}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {detectedTables.length > 0 && (
                  <div className="mt-6 rounded-xl border border-border bg-card-muted p-4">
                    <p className="text-sm font-semibold text-foreground">Detected tables</p>
                    <div className="mt-4 grid gap-4">
                      {detectedTables.map((table) => (
                        <div key={table.name} className="overflow-hidden rounded-xl border border-border bg-card">
                          <div className="border-b border-border px-4 py-3 text-sm font-semibold text-secondary">
                            {table.name}
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left text-sm">
                              <thead className="bg-card-muted text-muted">
                                <tr>
                                  {table.columns.map((column) => (
                                    <th key={column} className="border-b border-border px-4 py-3 font-semibold">
                                      {column}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {table.rows.map((row, rowIndex) => (
                                  <tr key={`${table.name}-${rowIndex}`} className="border-b border-border last:border-b-0">
                                    {row.map((cell, cellIndex) => (
                                      <td key={`${table.name}-${rowIndex}-${cellIndex}`} className="px-4 py-3 text-muted">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {usedFallbackShape && rawJson && (
                  <details className="mt-6 rounded-xl border border-border bg-card-muted p-4" open={showRawJson}>
                    <summary
                      className="cursor-pointer text-sm font-semibold text-foreground"
                      onClick={() => setShowRawJson((current) => !current)}
                    >
                      Raw JSON response
                    </summary>
                    <pre className="mt-4 max-h-72 overflow-auto rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground">
                      <code>{rawJson}</code>
                    </pre>
                  </details>
                )}

                <div
                  data-tour-target="export"
                  className={clsx("mt-6 grid gap-3 sm:grid-cols-2", activeTargetClass("export"))}
                >
                  <button
                    type="button"
                    className="brand-button brand-button-secondary button-pop gap-2 px-5 py-2.5"
                    onClick={downloadSample}
                  >
                    <FiDownload aria-hidden="true" />
                    Download CSV
                  </button>
                  <Link href="/#audit" className="brand-button brand-button-secondary button-pop px-5 py-2.5">
                    Get free workflow audit
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {tourOpen && (
        <div
          className="guided-tour-card fixed bottom-5 left-5 right-5 z-[70] mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl md:bottom-8 md:left-auto md:right-8"
          role="dialog"
          aria-live="polite"
          aria-label="Kruzo demo guide"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{progressLabel}</p>
            <button type="button" className="nav-link text-sm font-semibold" onClick={dismissTour}>
              Skip
            </button>
          </div>
          <h2 className="text-xl font-semibold">{currentTourStep.title}</h2>
          <p className="mt-2 text-muted">{currentTourStep.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              className="brand-button brand-button-secondary button-pop px-4 py-2 text-sm"
              onClick={goBack}
              disabled={tourIndex === 0}
            >
              Back
            </button>
            <button type="button" className="brand-button brand-button-primary button-pop px-5 py-2 text-sm" onClick={goNext}>
              {tourIndex === tourSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExcelDemoWorkspace;
