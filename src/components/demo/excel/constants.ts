import type { DemoOption, FileStatus } from "./types";

export const tourStorageKey = "kruzo-try-tour-dismissed";
export const defaultPreviewMessage = "Add documents on the left and click Submit to preview extracted data.";
export const reviewPreviewMessage = "Review the selected documents, then click Submit.";
export const samplePreviewMessage = "Previewing the sample workbook. Submit a real file to replace it with an extracted result.";
export const noResultPreviewMessage = "No documents were successfully processed. Review the file errors or open the sample workbook.";
export const templateMatchingNote = "Kruzo can later match your real Excel template during the workflow audit.";
export const supportedTypesLabel = "PDF, JPG, PNG, WEBP";
export const maxFileListHeightClass = "max-h-[220px]";
export const fileInputAccept = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";

export const supportedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
export const supportedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

export const documentTypeOptions: DemoOption[] = [
  { value: "Auto detect", label: "Auto detect" },
  { value: "Invoice", label: "Invoice" },
  { value: "Repair order", label: "Repair order" },
  { value: "Customer form", label: "Customer form" },
  { value: "Scanned form", label: "Scanned form" },
];

export const excelTemplateOptions: DemoOption[] = [
  { value: "Basic extraction table", label: "Basic extraction table" },
  { value: "Invoice tracking template", label: "Invoice tracking template" },
  { value: "Repair service template", label: "Repair service template" },
  { value: "Customer intake template", label: "Customer intake template" },
];

export const statusLabels: Record<FileStatus, string> = {
  ready: "Ready",
  processing: "Processing",
  done: "Done",
  failed: "Failed",
};
