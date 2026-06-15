import { isUserFacingPreviewRow, PreviewRow } from "@/lib/ocr/normalizeOcrResult";

export const buildCsvFromPreviewRows = (rows: PreviewRow[]) => {
  const headers = ["Field", "Extracted value", "Confidence", "Review"];
  const visibleRows = rows.filter(isUserFacingPreviewRow);
  const csvRows = [headers, ...visibleRows.map((row) => [row.field, row.value, row.confidence, row.review])].map((row) =>
    row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
  );

  return csvRows.join("\n");
};
