import type { OcrPreview } from "@/lib/ocr/normalizeOcrResult";

export type TourTarget = "upload" | "fileList" | "submit" | "settings" | "history" | "modalPreview";

export type FileStatus = "ready" | "processing" | "done" | "failed";
export type HistoryStatus = "queued" | "processing" | "done" | "failed";

export type SelectedUpload = {
  id: string;
  file: File;
  label: string;
  status: FileStatus;
  message?: string;
  debugDetails?: string;
  preview?: OcrPreview;
};

export type ProcessedUpload = Omit<SelectedUpload, "status"> & {
  status: HistoryStatus;
  submittedAt: string;
  submittedAtLabel: string;
  processedAt?: string;
  processedAtLabel?: string;
};

export type CollectedFile = {
  file: File;
  relativePath?: string;
};

export type DataTransferItemWithEntry = DataTransferItem & {
  webkitGetAsEntry?: () => { isDirectory?: boolean; isFile?: boolean } | null;
};

export type DroppedFilesResult = {
  files: CollectedFile[];
  folderDropped: boolean;
};

export type ToastTone = "info" | "success" | "warning" | "error";

export type ToastMessage = {
  id: string;
  message: string;
  tone: ToastTone;
};

export type TourStep = {
  target: TourTarget;
  title: string;
  description: string;
};

export type DemoOption = {
  value: string;
  label: string;
};

export type WorkbookSheet = {
  id: string;
  label: string;
  columns: string[];
  rows: string[][];
  description?: string;
};
