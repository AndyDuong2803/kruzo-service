import { supportedExtensions, supportedMimeTypes } from "./constants";
import type { CollectedFile, DataTransferItemWithEntry, DroppedFilesResult } from "./types";

export const getPrefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isSupportedFile = (file: File) => {
  const lowerName = file.name.toLowerCase();
  return supportedMimeTypes.has(file.type) || supportedExtensions.some((extension) => lowerName.endsWith(extension));
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const getFileRelativePath = (file: File) => file.name;

export const mapInputFiles = (files: FileList | File[] | null | undefined): CollectedFile[] =>
  Array.from(files ?? []).map((file) => ({
    file,
    relativePath: getFileRelativePath(file),
  }));

export const fileKey = (item: CollectedFile) =>
  `${item.relativePath || getFileRelativePath(item.file)}-${item.file.size}-${item.file.lastModified}`;

export const createUploadId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const collectDroppedFiles = (dataTransfer: DataTransfer): DroppedFilesResult => {
  const items = Array.from(dataTransfer.items ?? []);
  const folderDropped = items.some((item) => {
    const entry = (item as DataTransferItemWithEntry).webkitGetAsEntry?.();

    return Boolean(entry?.isDirectory);
  });
  const files = mapInputFiles(dataTransfer.files);

  return { files, folderDropped };
};
