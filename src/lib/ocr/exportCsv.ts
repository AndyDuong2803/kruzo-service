import type { PreviewRow, WorkbookSheet } from "@/lib/ocr/normalizeOcrResult";
import { isUserFacingPreviewRow } from "@/lib/ocr/normalizeOcrResult";

const csvBom = "\uFEFF";

const escapeCsvCell = (cell: unknown) => `"${String(cell ?? "").replace(/"/g, '""')}"`;

export const buildCsvFromSheet = (sheet: WorkbookSheet) => {
  const csvRows = [sheet.columns, ...sheet.rows].map((row) => row.map(escapeCsvCell).join(","));

  return `${csvBom}${csvRows.join("\n")}`;
};

export const buildCsvFromPreviewRows = (rows: PreviewRow[]) => {
  const visibleRows = rows.filter(isUserFacingPreviewRow);

  return buildCsvFromSheet({
    id: "extracted-fields",
    name: "Extracted fields",
    columns: ["Field", "Extracted value", "Confidence", "Review"],
    rows: visibleRows.map((row) => [row.field, row.value, row.confidence, row.review]),
  });
};
