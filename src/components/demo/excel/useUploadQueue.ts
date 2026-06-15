"use client";

import { useMemo, useState } from "react";

import { hasConfiguredApiBaseUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { extractOcr } from "@/lib/api/ocr";
import { buildCsvFromSheet } from "@/lib/ocr/exportCsv";
import { buildWorkbookBlob } from "@/lib/ocr/exportWorkbook";
import { normalizeOcrResult, type WorkbookSheet } from "@/lib/ocr/normalizeOcrResult";

import {
  defaultPreviewMessage,
  documentTypeOptions,
  excelTemplateOptions,
  noResultPreviewMessage,
  reviewPreviewMessage,
} from "./constants";
import { createUploadId, fileKey, getFileRelativePath, isSupportedFile } from "./fileCollection";
import type { CollectedFile, ProcessedUpload, SelectedUpload, ToastMessage, ToastTone } from "./types";

const timeLabel = (date = new Date()) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const pluralFile = (count: number) => `${count} file${count === 1 ? "" : "s"}`;

const filenameBase = (filename: string) =>
  filename.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "kruzo-document";

const sheetFilenamePart = (sheetName: string) =>
  sheetName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sheet";

export const useUploadQueue = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedUpload[]>([]);
  const [processingHistory, setProcessingHistory] = useState<ProcessedUpload[]>([]);
  const [documentType, setDocumentType] = useState(documentTypeOptions[0].value);
  const [excelTemplate, setExcelTemplate] = useState(excelTemplateOptions[0].value);
  const [previewMessage, setPreviewMessage] = useState(defaultPreviewMessage);
  const [activeResultId, setActiveResultId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const completedFiles = useMemo(
    () => processingHistory.filter((item) => item.status === "done" && item.preview),
    [processingHistory]
  );
  const activeProcessingCount = useMemo(
    () => processingHistory.filter((item) => item.status === "queued" || item.status === "processing").length,
    [processingHistory]
  );
  const failedFileCount = useMemo(
    () => processingHistory.filter((item) => item.status === "failed").length,
    [processingHistory]
  );
  const activeResultFile = activeResultId
    ? processingHistory.find((item) => item.id === activeResultId)
    : undefined;
  const isResultModalOpen = Boolean(activeResultFile);
  const submitLabel = selectedFiles.length === 1
    ? "Submit 1 file"
    : selectedFiles.length > 1
      ? `Submit ${selectedFiles.length} files`
      : "Submit";
  const processingLabel =
    activeProcessingCount > 0 ? `${activeProcessingCount} ${activeProcessingCount === 1 ? "file is" : "files are"} processing in history.` : "";

  const dismissToast = (id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = (message: string, tone: ToastTone = "info") => {
    const id = createUploadId();

    setToasts((current) => [...current, { id, message, tone }]);

    if (typeof window !== "undefined") {
      window.setTimeout(() => dismissToast(id), 4200);
    }
  };

  const updateHistoryItem = (id: string, patch: Partial<ProcessedUpload>) => {
    setProcessingHistory((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const downloadBlob = (blob: Blob, filename: string, successMessage: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
    pushToast(successMessage, "success");
  };

  const downloadSheetCsv = (sheet: WorkbookSheet | undefined, sourceFilename: string) => {
    if (!sheet || sheet.rows.length === 0) {
      return;
    }

    const blob = new Blob([buildCsvFromSheet(sheet)], { type: "text/csv;charset=utf-8" });
    downloadBlob(
      blob,
      `${filenameBase(sourceFilename)}-${sheetFilenamePart(sheet.name)}-kruzo.csv`,
      "CSV downloaded. Excel can open this file."
    );
  };

  const downloadWorkbook = (sheets: WorkbookSheet[] | undefined, sourceFilename: string) => {
    const usableSheets = sheets?.filter((sheet) => sheet.rows.length > 0) ?? [];

    if (usableSheets.length === 0) {
      return;
    }

    downloadBlob(
      buildWorkbookBlob(usableSheets),
      `${filenameBase(sourceFilename)}-kruzo.xlsx`,
      "XLSX downloaded. Excel can open this workbook."
    );
  };

  const addCollectedFiles = (items: CollectedFile[]) => {
    if (items.length === 0) {
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

    if (uploadsToAdd.length > 0) {
      setSelectedFiles((current) => [...current, ...uploadsToAdd]);
      setPreviewMessage(reviewPreviewMessage);
    }

    if (unsupportedCount > 0) {
      pushToast("Unsupported file ignored. Please use PDF, JPG, PNG, or WEBP.", "warning");
    }
  };

  const showFolderUnsupportedToast = () => {
    pushToast("Folder upload is not supported yet. Please choose files instead.", "warning");
  };

  const removeFile = (id: string) => {
    setSelectedFiles((current) => current.filter((item) => item.id !== id));
  };

  const clearFiles = () => {
    setSelectedFiles([]);

    if (processingHistory.length === 0) {
      setHasSubmitted(false);
      setPreviewMessage(defaultPreviewMessage);
    }
  };

  const selectActiveResult = (id: string) => {
    setActiveResultId(id);
  };

  const closeResultModal = () => {
    setActiveResultId(null);
  };

  const downloadHistoryCsv = (id: string) => {
    const historyItem = processingHistory.find((item) => item.id === id);

    if (!historyItem || historyItem.status !== "done" || !historyItem.preview?.hasUsableData) {
      return;
    }

    downloadSheetCsv(historyItem.preview.sheets.find((sheet) => sheet.rows.length > 0), historyItem.file.name);
  };

  const downloadHistoryWorkbook = (id: string) => {
    const historyItem = processingHistory.find((item) => item.id === id);

    if (!historyItem || historyItem.status !== "done" || !historyItem.preview?.hasUsableData) {
      return;
    }

    downloadWorkbook(historyItem.preview.sheets, historyItem.file.name);
  };

  const downloadActiveCsv = (sheet?: WorkbookSheet) => {
    if (!activeResultFile || activeResultFile.status !== "done" || !activeResultFile.preview?.hasUsableData) {
      return;
    }

    downloadSheetCsv(sheet ?? activeResultFile.preview.sheets[0], activeResultFile.file.name);
  };

  const downloadActiveWorkbook = () => {
    if (!activeResultFile || activeResultFile.status !== "done" || !activeResultFile.preview?.hasUsableData) {
      return;
    }

    downloadWorkbook(activeResultFile.preview.sheets, activeResultFile.file.name);
  };

  const processSubmittedFiles = async (filesToProcess: ProcessedUpload[]) => {
    let structuredSuccessCount = 0;
    let unstructuredSuccessCount = 0;
    let failedCount = 0;

    for (const item of filesToProcess) {
      updateHistoryItem(item.id, { status: "processing", message: "Extracting document..." });

      try {
        const result = await extractOcr(item.file);
        const preview = normalizeOcrResult(result);
        const hasStructuredData = preview.hasUsableData;
        const now = new Date();

        updateHistoryItem(item.id, {
          status: "done",
          message: hasStructuredData
            ? "Structured fields extracted."
            : "Kruzo could not find structured fields in this document.",
          preview,
          debugDetails: "",
          processedAt: now.toISOString(),
          processedAtLabel: timeLabel(now),
        });

        if (hasStructuredData) {
          structuredSuccessCount += 1;
        } else {
          unstructuredSuccessCount += 1;
        }
      } catch (error) {
        const friendlyMessage =
          error instanceof ApiError ? error.friendlyMessage : "Something went wrong while processing the document.";
        const debugDetails =
          error instanceof ApiError && error.details ? JSON.stringify(error.details, null, 2) : "";
        const now = new Date();

        updateHistoryItem(item.id, {
          status: "failed",
          message: friendlyMessage,
          debugDetails,
          processedAt: now.toISOString(),
          processedAtLabel: timeLabel(now),
        });

        failedCount += 1;
      }
    }

    const completedCount = structuredSuccessCount + unstructuredSuccessCount;

    if (completedCount > 0 && failedCount > 0) {
      pushToast(`${completedCount} ${completedCount === 1 ? "file" : "files"} completed, ${failedCount} failed.`, "warning");
      setPreviewMessage("Some documents need attention. Review file messages in history.");
      return;
    }

    if (completedCount > 0) {
      pushToast(`${completedCount} ${completedCount === 1 ? "file" : "files"} completed.`, "success");
      setPreviewMessage("Finished processing. Open results from Processing history.");
      return;
    }

    pushToast(`${failedCount} ${failedCount === 1 ? "file" : "files"} failed.`, "error");
    setPreviewMessage(noResultPreviewMessage);
  };

  const submitSelectedFiles = () => {
    if (selectedFiles.length === 0) {
      return;
    }

    setHasSubmitted(true);

    if (!hasConfiguredApiBaseUrl) {
      pushToast("NEXT_PUBLIC_API_BASE_URL is not configured locally.", "error");
      setPreviewMessage("NEXT_PUBLIC_API_BASE_URL is not configured locally. No extraction preview is available.");
      return;
    }

    const submittedAt = new Date();
    const filesToProcess: ProcessedUpload[] = selectedFiles.map((item) => ({
      ...item,
      status: "queued",
      message: "Waiting to process...",
      submittedAt: submittedAt.toISOString(),
      submittedAtLabel: timeLabel(submittedAt),
    }));

    setSelectedFiles([]);
    setProcessingHistory((current) => [...filesToProcess, ...current]);
    setPreviewMessage(`${pluralFile(filesToProcess.length)} submitted. Track progress in Processing history.`);
    pushToast(`Submitted ${filesToProcess.length} ${filesToProcess.length === 1 ? "file" : "files"} for extraction.`, "info");

    void processSubmittedFiles(filesToProcess);
  };

  return {
    selectedFiles,
    processingHistory,
    documentType,
    excelTemplate,
    previewMessage,
    processingLabel,
    submitLabel,
    hasSubmitted,
    completedFiles,
    failedFileCount,
    activeProcessingCount,
    activeResultFile,
    isResultModalOpen,
    toasts,
    setDocumentType,
    setExcelTemplate,
    addCollectedFiles,
    showFolderUnsupportedToast,
    removeFile,
    clearFiles,
    submitSelectedFiles,
    selectActiveResult,
    closeResultModal,
    downloadActiveCsv,
    downloadActiveWorkbook,
    downloadHistoryCsv,
    downloadHistoryWorkbook,
    dismissToast,
  };
};
