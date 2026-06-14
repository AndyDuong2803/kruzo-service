"use client";

import Link from "next/link";
import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiGrid,
  FiHelpCircle,
  FiTrash2,
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
  OcrPreview,
  PreviewRow,
  samplePreviewRows,
} from "@/lib/ocr/normalizeOcrResult";

type TourTarget = "upload" | "fileList" | "documentType" | "template" | "previewButton" | "table" | "export";
type FileStatus = "ready" | "processing" | "done" | "failed";

type SelectedUpload = {
  id: string;
  file: File;
  label: string;
  status: FileStatus;
  message?: string;
  debugDetails?: string;
  preview?: OcrPreview;
};

type CollectedFile = {
  file: File;
  relativePath?: string;
};

type BrowserFileEntry = {
  isFile: boolean;
  isDirectory: boolean;
  name: string;
  fullPath?: string;
  file?: (success: (file: File) => void, error?: (error: DOMException) => void) => void;
  createReader?: () => {
    readEntries: (
      success: (entries: BrowserFileEntry[]) => void,
      error?: (error: DOMException) => void
    ) => void;
  };
};

type DataTransferItemWithEntry = DataTransferItem & {
  webkitGetAsEntry?: () => BrowserFileEntry | null;
};

type TourStep = {
  target: TourTarget;
  title: string;
  description: string;
};

const tourStorageKey = "kruzo-try-tour-dismissed";
const supportedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
const supportedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];
const maxListHeightClass = "max-h-[260px]";
const folderInputAttributes = {
  webkitdirectory: "",
  directory: "",
} as React.InputHTMLAttributes<HTMLInputElement> & { webkitdirectory: string; directory: string };

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
    title: "Add documents",
    description: "Click, drag files, or drag a folder when your browser supports it.",
  },
  {
    target: "fileList",
    title: "Review selected files",
    description: "Check the file list and remove anything you do not want to process.",
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
    title: "Extract selected files",
    description: "Extraction starts only after you submit the reviewed file list.",
  },
  {
    target: "table",
    title: "Review extracted result",
    description: "Review fields, tables, and low-confidence values.",
  },
  {
    target: "export",
    title: "Export or request help",
    description: "Download CSV for the active result or send your workflow for review.",
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

const isSupportedFile = (file: File) => {
  const lowerName = file.name.toLowerCase();
  return supportedMimeTypes.has(file.type) || supportedExtensions.some((extension) => lowerName.endsWith(extension));
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getFileRelativePath = (file: File) =>
  (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;

const fileKey = (item: CollectedFile) =>
  `${item.relativePath || getFileRelativePath(item.file)}-${item.file.size}-${item.file.lastModified}`;

const createUploadId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const readFileEntry = (entry: BrowserFileEntry, parentPath = ""): Promise<CollectedFile[]> =>
  new Promise((resolve) => {
    if (!entry.file) {
      resolve([]);
      return;
    }

    entry.file(
      (file) => resolve([{ file, relativePath: `${parentPath}${file.name}` }]),
      () => resolve([])
    );
  });

const readDirectoryEntry = async (entry: BrowserFileEntry, parentPath = ""): Promise<CollectedFile[]> => {
  const reader = entry.createReader?.();

  if (!reader) {
    return [];
  }

  const entries: BrowserFileEntry[] = [];

  await new Promise<void>((resolve) => {
    const readBatch = () => {
      reader.readEntries(
        (batch) => {
          if (batch.length === 0) {
            resolve();
            return;
          }

          entries.push(...batch);
          readBatch();
        },
        () => resolve()
      );
    };

    readBatch();
  });

  const nestedFiles = await Promise.all(
    entries.map((child) => readEntryFiles(child, `${parentPath}${entry.name}/`))
  );

  return nestedFiles.flat();
};

const readEntryFiles = (entry: BrowserFileEntry, parentPath = ""): Promise<CollectedFile[]> => {
  if (entry.isFile) {
    return readFileEntry(entry, parentPath);
  }

  if (entry.isDirectory) {
    return readDirectoryEntry(entry, parentPath);
  }

  return Promise.resolve([]);
};

const collectDroppedFiles = async (dataTransfer: DataTransfer): Promise<CollectedFile[]> => {
  const items = Array.from(dataTransfer.items ?? []);
  const entries = items
    .map((item) => (item as DataTransferItemWithEntry).webkitGetAsEntry?.() as BrowserFileEntry | null | undefined)
    .filter(Boolean) as BrowserFileEntry[];

  if (entries.length > 0) {
    const collected = await Promise.all(entries.map((entry) => readEntryFiles(entry)));
    return collected.flat();
  }

  return Array.from(dataTransfer.files ?? []).map((file) => ({
    file,
    relativePath: getFileRelativePath(file),
  }));
};

const statusLabel: Record<FileStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  done: "Done",
  failed: "Failed",
};

const ExcelDemoWorkspace: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedUpload[]>([]);
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [excelTemplate, setExcelTemplate] = useState(excelTemplates[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [processingTotal, setProcessingTotal] = useState(0);
  const [previewMessage, setPreviewMessage] = useState("Sample preview is shown until a real file/API is connected.");
  const [uploadWarning, setUploadWarning] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  const currentTourStep = tourSteps[tourIndex];
  const completedFiles = selectedFiles.filter((item) => item.status === "done" && item.preview);
  const activeResultFile = completedFiles.find((item) => item.id === activeResultId) ?? completedFiles[completedFiles.length - 1];
  const activePreview = activeResultFile?.preview;
  const previewRows: PreviewRow[] = activePreview?.rows ?? samplePreviewRows;
  const detectedTables: DetectedTable[] = activePreview?.tables ?? [];
  const rawJson = activePreview?.rawJson ?? "";
  const usedFallbackShape = Boolean(activePreview?.usedFallback);
  const progressLabel = useMemo(() => `${tourIndex + 1} of ${tourSteps.length}`, [tourIndex]);
  const processingLabel = isProcessing && processingTotal > 0
    ? `Processing ${processedCount} of ${processingTotal} files`
    : "";

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

  const addCollectedFiles = (items: CollectedFile[]) => {
    if (items.length === 0) {
      setUploadWarning("No files were found. Folder upload may not be supported in this browser.");
      return;
    }

    const supportedItems = items.filter((item) => isSupportedFile(item.file));
    const unsupportedCount = items.length - supportedItems.length;
    const existingKeys = new Set(selectedFiles.map((item) => fileKey({ file: item.file, relativePath: item.label })));
    const uploadsToAdd: SelectedUpload[] = [];

    supportedItems.forEach((item) => {
      const key = fileKey(item);

      if (existingKeys.has(key)) {
        return;
      }

      existingKeys.add(key);
      uploadsToAdd.push({
        id: createUploadId(),
        file: item.file,
        label: item.relativePath || getFileRelativePath(item.file),
        status: "ready",
      });
    });

    setSelectedFiles((current) => [...current, ...uploadsToAdd]);

    const addedCount = uploadsToAdd.length;
    const messages = [];
    if (addedCount > 0) {
      messages.push(`${addedCount} supported file${addedCount === 1 ? "" : "s"} added.`);
    }
    if (unsupportedCount > 0) {
      messages.push(`${unsupportedCount} unsupported file${unsupportedCount === 1 ? "" : "s"} ignored.`);
    }
    if (supportedItems.length > addedCount) {
      messages.push("Duplicate files were skipped.");
    }

    setUploadWarning(messages.join(" "));
    setPreviewMessage(addedCount > 0
      ? "Review selected files, then extract when you are ready."
      : "No new supported files were added."
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).map((file) => ({
      file,
      relativePath: getFileRelativePath(file),
    }));

    if (files.length > 0) {
      addCollectedFiles(files);
    }

    event.target.value = "";
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const files = await collectDroppedFiles(event.dataTransfer);
    addCollectedFiles(files);
  };

  const removeFile = (id: string) => {
    setSelectedFiles((current) => current.filter((item) => item.id !== id));
    setActiveResultId((current) => current === id ? null : current);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setActiveResultId(null);
    setUploadWarning("");
    setPreviewMessage("Sample preview is shown until a real file/API is connected.");
  };

  const updateFile = (id: string, patch: Partial<SelectedUpload>) => {
    setSelectedFiles((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const extractSelectedFiles = async () => {
    if (isProcessing || selectedFiles.length === 0) {
      return;
    }

    if (!hasConfiguredApiBaseUrl) {
      setPreviewMessage("NEXT_PUBLIC_API_BASE_URL is not configured locally. Showing sample preview instead.");
      return;
    }

    const filesToProcess = selectedFiles;
    let completed = 0;
    let successCount = 0;
    let failedCount = 0;

    setIsProcessing(true);
    setProcessedCount(0);
    setProcessingTotal(filesToProcess.length);
    setActiveResultId(null);
    setShowRawJson(false);
    setPreviewMessage(`Processing 0 of ${filesToProcess.length} files...`);
    setSelectedFiles((current) => current.map((item) => ({
      ...item,
      status: "ready",
      message: undefined,
      debugDetails: undefined,
    })));

    const runFile = async (item: SelectedUpload) => {
      updateFile(item.id, { status: "processing", message: "Reading document..." });

      try {
        const result = await extractOcr(item.file);
        const preview = normalizeOcrResult(result);

        updateFile(item.id, {
          status: "done",
          message: preview.usedFallback ? "Done, raw JSON available for review." : "Done",
          preview,
          debugDetails: "",
        });
        successCount += 1;
        setActiveResultId(item.id);
      } catch (error) {
        const friendlyMessage = error instanceof ApiError
          ? error.friendlyMessage
          : "Something went wrong while processing the document.";
        const debugDetails = error instanceof ApiError && error.details
          ? JSON.stringify(error.details, null, 2)
          : "";

        updateFile(item.id, {
          status: "failed",
          message: friendlyMessage,
          debugDetails,
        });
        failedCount += 1;
      } finally {
        completed += 1;
        setProcessedCount(completed);
        setPreviewMessage(`Processing ${completed} of ${filesToProcess.length} files...`);
      }
    };

    for (let index = 0; index < filesToProcess.length; index += 2) {
      await Promise.all(filesToProcess.slice(index, index + 2).map(runFile));
    }

    setIsProcessing(false);
    if (successCount > 0 && failedCount > 0) {
      setPreviewMessage(`Extraction finished. ${successCount} succeeded and ${failedCount} failed.`);
    } else if (successCount > 0) {
      setPreviewMessage("Extraction finished. Select any completed file to preview its result.");
    } else {
      setPreviewMessage("Extraction finished, but no files succeeded. Showing sample preview instead.");
    }
  };

  const downloadSample = () => {
    const blob = new Blob([buildCsvFromPreviewRows(previewRows)], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeResultFile ? `${activeResultFile.file.name.replace(/\.[^.]+$/, "")}-kruzo.csv` : "kruzo-document-ai-sample.csv";
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
                Upload documents, review the extracted table, and export the active result to CSV.
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

          <div className="grid min-w-0 gap-5 xl:grid-cols-[5fr_7fr]">
            <div className="min-w-0 space-y-5">
              <div
                data-tour-target="upload"
                className={clsx("brand-card min-w-0 rounded-2xl p-5 md:p-6", activeTargetClass("upload"))}
              >
                <div
                  className={clsx(
                    "rounded-2xl border-2 border-dashed bg-card-muted p-6 text-center transition-colors md:p-8",
                    isDragActive ? "border-[var(--accent-border)] bg-[var(--accent-soft)]" : "border-border"
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={handleDrop}
                >
                  <div className="brand-icon mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                    <FiUploadCloud size={30} aria-hidden="true" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold">Upload documents</h2>
                  <p className="mt-2 text-muted">PDF, JPG, PNG, or WEBP. Drag files or folders here.</p>

                  <input
                    id="demo-file"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <input
                    id="demo-folder"
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={handleFileChange}
                    {...folderInputAttributes}
                  />
                  <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <label
                      htmlFor="demo-file"
                      className="brand-button brand-button-primary button-pop mx-auto w-fit cursor-pointer gap-2 px-5 py-2.5 sm:mx-0"
                    >
                      Choose files
                      <HiArrowRight aria-hidden="true" />
                    </label>
                    <label
                      htmlFor="demo-folder"
                      className="brand-button brand-button-secondary button-pop mx-auto w-fit cursor-pointer px-5 py-2.5 sm:mx-0"
                    >
                      Choose folder
                    </label>
                  </div>

                  <p className="mt-4 text-sm text-muted" aria-live="polite">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file${selectedFiles.length === 1 ? "" : "s"} selected.`
                      : "No files selected yet. Sample data is shown on the right."}
                  </p>
                  {uploadWarning && <p className="mt-2 text-sm font-semibold text-secondary">{uploadWarning}</p>}
                </div>
              </div>

              <div
                data-tour-target="fileList"
                className={clsx("brand-card rounded-2xl p-5", activeTargetClass("fileList"))}
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Selected files</h2>
                    <p className="text-sm text-muted">{selectedFiles.length} ready for review</p>
                  </div>
                  <button
                    type="button"
                    className="nav-link w-fit text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={clearFiles}
                    disabled={selectedFiles.length === 0 || isProcessing}
                  >
                    Clear all
                  </button>
                </div>

                <div className={clsx("overflow-y-auto pr-1", maxListHeightClass)}>
                  {selectedFiles.length === 0 ? (
                    <div className="rounded-xl border border-border bg-card-muted p-4 text-sm text-muted">
                      Add one or more documents before extracting.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {selectedFiles.map((item) => (
                        <div key={item.id} className="rounded-xl border border-border bg-card-muted p-3">
                          <div className="flex items-start gap-3">
                            <div className="brand-icon flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                              <FiFileText aria-hidden="true" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground" title={item.label}>{item.label}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                                <span>{formatFileSize(item.file.size)}</span>
                                <span
                                  className={clsx(
                                    "rounded-full border px-2 py-0.5 font-semibold",
                                    item.status === "done" && "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary",
                                    item.status === "failed" && "border-border bg-card text-muted",
                                    item.status === "processing" && "border-[var(--accent-border)] bg-card text-secondary",
                                    item.status === "ready" && "border-border bg-card text-muted"
                                  )}
                                >
                                  {statusLabel[item.status]}
                                </span>
                                {item.message && <span>{item.message}</span>}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="rounded-full p-2 text-muted transition-colors hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => removeFile(item.id)}
                              disabled={isProcessing}
                              aria-label={`Remove ${item.label}`}
                            >
                              <FiTrash2 aria-hidden="true" />
                            </button>
                          </div>
                          {item.status === "failed" && item.debugDetails && (
                            <details className="mt-3 rounded-xl border border-border bg-card p-3">
                              <summary className="cursor-pointer text-sm font-semibold text-foreground">Technical details</summary>
                              <pre className="mt-3 max-h-40 overflow-auto text-xs text-foreground">
                                <code>{item.debugDetails}</code>
                              </pre>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
                  <p className="text-sm text-muted">{processingLabel || previewMessage}</p>
                </div>
                <div data-tour-target="previewButton" className={activeTargetClass("previewButton")}>
                  <button
                    type="button"
                    className="brand-button brand-button-primary button-pop gap-2 px-5 py-2.5"
                    onClick={extractSelectedFiles}
                    disabled={isProcessing || selectedFiles.length === 0}
                  >
                    {isProcessing ? "Processing..." : "Extract selected files"}
                    {!isProcessing && <HiArrowRight aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="mb-5 grid gap-3 md:grid-cols-3">
                  {[
                    ["Files", selectedFiles.length > 0 ? String(selectedFiles.length) : "Sample repair order"],
                    ["Type", documentType],
                    ["Template", excelTemplate],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border bg-card-muted p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                    </div>
                  ))}
                </div>

                {completedFiles.length > 0 && (
                  <div className="mb-5 rounded-xl border border-border bg-card-muted p-4">
                    <p className="text-sm font-semibold text-foreground">Completed results</p>
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {completedFiles.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className={clsx(
                            "shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                            activeResultFile?.id === item.id
                              ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                              : "border-border bg-card text-muted hover:text-foreground"
                          )}
                          onClick={() => setActiveResultId(item.id)}
                        >
                          {item.file.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                    <table className="w-full min-w-[600px] border-collapse text-left text-sm">
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
