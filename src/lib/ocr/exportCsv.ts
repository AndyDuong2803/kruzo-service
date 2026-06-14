import { PreviewRow } from "@/lib/ocr/normalizeOcrResult";

export const buildCsvFromPreviewRows = (rows: PreviewRow[]) => {
  const headers = ["Field", "Extracted value", "Confidence", "Review"];
  const csvRows = [headers, ...rows.map((row) => [row.field, row.value, row.confidence, row.review])].map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
  );

  return csvRows.join("\n");
};
