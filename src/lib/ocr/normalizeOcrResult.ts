import { ApiEnvelope } from "@/lib/api/types";

export type PreviewRow = {
  field: string;
  value: string;
  confidence: string;
  review: "Approved" | "Needs review";
};

export type DetectedTable = {
  name: string;
  columns: string[];
  rows: string[][];
};

export type OcrPreview = {
  rows: PreviewRow[];
  tables: DetectedTable[];
  rawJson: string;
  usedFallback: boolean;
};

export const samplePreviewRows: PreviewRow[] = [
  { field: "Customer name", value: "Maria Nguyen", confidence: "96%", review: "Approved" },
  { field: "Document type", value: "Repair order", confidence: "94%", review: "Approved" },
  { field: "Total amount", value: "$428.60", confidence: "91%", review: "Approved" },
  { field: "Service notes", value: "Brake inspection and oil change", confidence: "72%", review: "Needs review" },
];

export const sampleOcrData = {
  document_type: "repair_order",
  language: "en",
  fields: {
    customer_name: {
      value: "Maria Nguyen",
      confidence: 0.96,
      review_required: false,
    },
    total_amount: {
      value: "428.60",
      confidence: 0.91,
      review_required: false,
    },
    service_notes: {
      value: "Brake inspection and oil change",
      confidence: 0.72,
      review_required: true,
    },
  },
  tables: [
    {
      name: "line_items",
      rows: [
        { item: "Oil change", qty: 1, amount: "89.00" },
        { item: "Brake inspection", qty: 1, amount: "120.00" },
      ],
    },
  ],
  review: {
    status: "needs_review",
    reason: "Some service notes have lower confidence.",
  },
};

export const sampleOcrResponse: ApiEnvelope<Record<string, unknown>> = {
  success: true,
  error_code: null,
  message: "Data extracted successfully.",
  data: sampleOcrData,
};

export const humanizeFieldName = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\./g, " / ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === "object" && !Array.isArray(value));

const stringifyValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
};

const formatConfidence = (value: unknown): string => {
  if (typeof value === "number") {
    return value <= 1 ? `${Math.round(value * 100)}%` : `${Math.round(value)}%`;
  }

  if (typeof value === "string") {
    return value.includes("%") ? value : value;
  }

  return "-";
};

const isReviewRequired = (fieldValue: Record<string, unknown>, confidence: unknown) => {
  if (fieldValue.review_required === true || fieldValue.needs_review === true) {
    return true;
  }

  if (typeof confidence === "number") {
    return confidence <= 0.8 || (confidence > 1 && confidence <= 80);
  }

  return false;
};

const looksLikeExtractedField = (value: Record<string, unknown>) =>
  "value" in value || "text" in value || "extracted_value" in value || "confidence" in value || "score" in value;

const rowFromField = (key: string, value: unknown): PreviewRow => {
  if (isRecord(value) && looksLikeExtractedField(value)) {
    const confidence = value.confidence ?? value.score;

    return {
      field: humanizeFieldName(key),
      value: stringifyValue(value.value ?? value.text ?? value.extracted_value ?? value),
      confidence: formatConfidence(confidence),
      review: isReviewRequired(value, confidence) ? "Needs review" : "Approved",
    };
  }

  return {
    field: humanizeFieldName(key),
    value: stringifyValue(value),
    confidence: "-",
    review: "Approved",
  };
};

const normalizeFields = (fields: unknown): PreviewRow[] => {
  if (!isRecord(fields)) {
    return [];
  }

  return Object.entries(fields).map(([key, value]) => rowFromField(key, value));
};

const flattenObjectFields = (
  value: Record<string, unknown>,
  prefix = "",
  rows: PreviewRow[] = []
) => {
  Object.entries(value).forEach(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(entry)) {
      return;
    }

    if (isRecord(entry) && !looksLikeExtractedField(entry)) {
      flattenObjectFields(entry, path, rows);
      return;
    }

    rows.push(rowFromField(path, entry));
  });

  return rows;
};

const normalizeRows = (rows: unknown): { columns: string[]; rows: string[][] } => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { columns: [], rows: [] };
  }

  const firstRow = rows[0];

  if (Array.isArray(firstRow)) {
    const width = Math.max(...rows.map((row) => Array.isArray(row) ? row.length : 0));
    const columns = Array.from({ length: width }, (_, index) => `Column ${index + 1}`);

    return {
      columns,
      rows: rows.map((row) => Array.isArray(row) ? row.map(stringifyValue) : [stringifyValue(row)]),
    };
  }

  if (isRecord(firstRow)) {
    const columns = Array.from(new Set(rows.flatMap((row) => isRecord(row) ? Object.keys(row) : [])));

    return {
      columns,
      rows: rows.map((row) => {
        if (!isRecord(row)) {
          return columns.map(() => "");
        }

        return columns.map((column) => stringifyValue(row[column]));
      }),
    };
  }

  return {
    columns: ["Value"],
    rows: rows.map((row) => [stringifyValue(row)]),
  };
};

const normalizeTables = (tables: unknown): DetectedTable[] => {
  if (!Array.isArray(tables)) {
    return [];
  }

  return tables.map((table, index) => {
    if (isRecord(table)) {
      const normalized = normalizeRows(table.rows ?? table.data ?? []);
      const providedColumns = Array.isArray(table.columns)
        ? table.columns.map(stringifyValue)
        : [];
      const columns = providedColumns.length > 0 ? providedColumns : normalized.columns;

      return {
        name: stringifyValue(table.name ?? `Table ${index + 1}`),
        columns,
        rows: normalized.rows,
      };
    }

    const normalized = normalizeRows(table);

    return {
      name: `Table ${index + 1}`,
      columns: normalized.columns,
      rows: normalized.rows,
    };
  }).filter((table) => table.rows.length > 0 || table.columns.length > 0);
};

const extractArrayTables = (payload: Record<string, unknown>): DetectedTable[] =>
  Object.entries(payload)
    .filter(([key, value]) => key !== "tables" && Array.isArray(value) && value.length > 0)
    .flatMap(([key, value]) =>
      normalizeTables([{ name: humanizeFieldName(key), rows: value }])
    );

const unwrapEnvelope = (payload: unknown) => {
  if (isRecord(payload) && "success" in payload && "data" in payload) {
    return payload.data;
  }

  return payload;
};

export const normalizeOcrResult = (payload: unknown): OcrPreview => {
  const rawJson = JSON.stringify(payload, null, 2);
  const data = unwrapEnvelope(payload);

  if (!isRecord(data)) {
    return {
      rows: samplePreviewRows,
      tables: [],
      rawJson,
      usedFallback: true,
    };
  }

  const fieldRows = normalizeFields(data.fields);
  const rows = fieldRows.length > 0 ? fieldRows : flattenObjectFields(
    Object.fromEntries(Object.entries(data).filter(([key]) => key !== "tables"))
  );
  const tables = [...normalizeTables(data.tables), ...extractArrayTables(data)];
  const hasKnownShape = rows.length > 0 || tables.length > 0;

  return {
    rows: rows.length > 0 ? rows : samplePreviewRows,
    tables,
    rawJson,
    usedFallback: !hasKnownShape,
  };
};
