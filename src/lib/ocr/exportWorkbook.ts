import * as XLSX from "xlsx";

import type { WorkbookSheet } from "@/lib/ocr/normalizeOcrResult";

const worksheetName = (name: string, index: number) => {
  const safeName = name.replace(/[\\/?*\[\]:]/g, " ").replace(/\s+/g, " ").trim();
  return (safeName || `Sheet ${index + 1}`).slice(0, 31);
};

const uniqueWorksheetName = (name: string, usedNames: Set<string>) => {
  if (!usedNames.has(name)) {
    usedNames.add(name);
    return name;
  }

  for (let suffix = 2; suffix < 100; suffix += 1) {
    const label = ` ${suffix}`;
    const candidate = `${name.slice(0, 31 - label.length)}${label}`;

    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
  }

  return name;
};

const columnWidths = (sheet: WorkbookSheet) =>
  sheet.columns.map((column, columnIndex) => {
    const longestValue = sheet.rows.reduce((max, row) => {
      const value = row[columnIndex] ?? "";
      return Math.max(max, String(value).length);
    }, column.length);

    return { wch: Math.min(Math.max(longestValue + 2, 12), 42) };
  });

export const buildWorkbookBlob = (sheets: WorkbookSheet[]) => {
  const workbook = XLSX.utils.book_new();
  const usedNames = new Set<string>();

  sheets.forEach((sheet, index) => {
    const rows = [sheet.columns, ...sheet.rows];
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const name = uniqueWorksheetName(worksheetName(sheet.name, index), usedNames);
    worksheet["!cols"] = columnWidths(sheet);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  });

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
