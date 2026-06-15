import { ApiEnvelope } from "@/lib/api/types";
import { confidenceLevelFromValue, type ConfidenceLevel } from "@/lib/ocr/confidence";

export type ReviewState = "Approved" | "Needs review" | "Unknown";

export type PreviewRow = {
  field: string;
  value: string;
  confidence: ConfidenceLevel;
  review: ReviewState;
};

export type DetectedTable = {
  name: string;
  columns: string[];
  rows: string[][];
};

export type WorkbookSheet = {
  id: string;
  name: string;
  columns: string[];
  rows: string[][];
};

export type OcrPreview = {
  rows: PreviewRow[];
  tables: DetectedTable[];
  sheets: WorkbookSheet[];
  rawJson: string;
  rawText: string;
  debug?: unknown;
  hasUsableData: boolean;
  isSample?: boolean;
  usedFallback: boolean;
  message?: string;
};

const maxPreviewValueLength = 180;
const maxRawTextLength = 6000;

export const samplePreviewRows: PreviewRow[] = [
  { field: "Customer name", value: "Maria Nguyen", confidence: "High", review: "Approved" },
  { field: "Invoice number", value: "INV-1048", confidence: "High", review: "Approved" },
  { field: "Total amount", value: "$428.60", confidence: "High", review: "Approved" },
  { field: "Service notes", value: "Brake inspection and oil change", confidence: "Medium", review: "Needs review" },
];

export const sampleOcrData = {
  fields: {
    customer_name: {
      value: "Maria Nguyen",
      confidence: 0.96,
      review_required: false,
    },
    invoice_number: {
      value: "INV-1048",
      confidence: 0.94,
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

const hiddenFieldKeys = new Set([
  "completion",
  "confidence",
  "confidencelevel",
  "content",
  "debug",
  "documenttype",
  "error",
  "errorcode",
  "exception",
  "json",
  "language",
  "markdown",
  "message",
  "metadata",
  "needsreview",
  "prompt",
  "provider",
  "providername",
  "raw",
  "rawcontent",
  "rawjson",
  "rawmarkdown",
  "rawoutput",
  "rawresponse",
  "rawtext",
  "requestid",
  "response",
  "review",
  "stack",
  "status",
  "success",
  "text",
  "trace",
  "traceid",
  "usage",
]);

const hiddenFieldFragments = [
  "debug",
  "metadata",
  "openrouter",
  "provider",
  "requestid",
  "traceid",
  "rawtext",
  "rawjson",
  "prompt",
  "tokenusage",
  "stacktrace",
];

const rawTextKeys = new Set([
  "fulltext",
  "markdown",
  "ocrtext",
  "plaintext",
  "rawmarkdown",
  "rawtext",
  "text",
]);

const normalizeKeyForMatch = (value: string) => value.replace(/[^a-z0-9]/gi, "").toLowerCase();

const sheetIdFromName = (value: string, index: number) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized ? `${normalized}-${index}` : `sheet-${index}`;
};

export const shouldHideFieldKey = (key: string) => {
  const normalized = normalizeKeyForMatch(key);

  return (
    hiddenFieldKeys.has(normalized) ||
    hiddenFieldFragments.some((fragment) => normalized.includes(fragment))
  );
};

const isRawTextKey = (key: string) => rawTextKeys.has(normalizeKeyForMatch(key));

const hasStableContractShape = (value: unknown) =>
  isRecord(value) && (
    isRecord(value.fields) ||
    Array.isArray(value.tables) ||
    isRecord(value.review)
  );

export const humanizeFieldName = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/\./g, " / ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase())
    .replace(/\bId\b/g, "ID")
    .replace(/\bUrl\b/g, "URL")
    .replace(/\bApi\b/g, "API")
    .replace(/\bPdf\b/g, "PDF")
    .replace(/\bSku\b/g, "SKU");

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

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

const isLargeTextBlob = (value: string) => {
  const trimmed = value.trim();
  const lineBreaks = (trimmed.match(/\n/g) ?? []).length;
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  return trimmed.length > 280 && (lineBreaks >= 3 || wordCount >= 45);
};

const clampValue = (value: string, maxLength = maxPreviewValueLength) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}...`;
};

const sanitizePreviewValue = (value: unknown) => {
  const text = normalizeWhitespace(stringifyValue(value));

  if (!text || text === "null" || text === "undefined") {
    return "";
  }

  return clampValue(text);
};

const sanitizeRawText = (value: string) => {
  const trimmed = value.trim();

  if (trimmed.length <= maxRawTextLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxRawTextLength).trimEnd()}\n\n[Raw text truncated for preview.]`;
};

const reviewStateFromField = (fieldValue: Record<string, unknown>, confidence: unknown): ReviewState => {
  if (fieldValue.review_required === true || fieldValue.needs_review === true) {
    return "Needs review";
  }

  if (fieldValue.review_required === false || fieldValue.needs_review === false) {
    return "Approved";
  }

  if (typeof confidence === "number") {
    return confidence <= 0.8 || (confidence > 1 && confidence <= 80) ? "Needs review" : "Approved";
  }

  return "Unknown";
};

const looksLikeExtractedField = (value: Record<string, unknown>) =>
  "value" in value ||
  "extracted_value" in value ||
  "raw_value" in value ||
  "confidence" in value ||
  "score" in value ||
  "review_required" in value ||
  "needs_review" in value;

const getExtractedFieldValue = (value: Record<string, unknown>) => {
  if ("value" in value) {
    return value.value;
  }

  if ("extracted_value" in value) {
    return value.extracted_value;
  }

  if ("raw_value" in value) {
    return value.raw_value;
  }

  return value.text;
};

const rowFromField = (key: string, value: unknown): PreviewRow | null => {
  if (shouldHideFieldKey(key)) {
    return null;
  }

  if (isRecord(value) && looksLikeExtractedField(value)) {
    const extractedValue = getExtractedFieldValue(value);
    const stringValue = stringifyValue(extractedValue);

    if (isRawTextKey(key) || isLargeTextBlob(stringValue)) {
      return null;
    }

    const sanitizedValue = sanitizePreviewValue(extractedValue);

    if (!sanitizedValue) {
      return null;
    }

    const confidence = value.confidence ?? value.score ?? value.confidence_level;

    return {
      field: humanizeFieldName(key),
      value: sanitizedValue,
      confidence: confidenceLevelFromValue(confidence),
      review: reviewStateFromField(value, confidence),
    };
  }

  if (Array.isArray(value) || isRecord(value)) {
    return null;
  }

  const stringValue = stringifyValue(value);

  if (isLargeTextBlob(stringValue)) {
    return null;
  }

  const sanitizedValue = sanitizePreviewValue(value);

  if (!sanitizedValue) {
    return null;
  }

  return {
    field: humanizeFieldName(key),
    value: sanitizedValue,
    confidence: "Medium",
    review: "Approved",
  };
};

const normalizeFields = (fields: unknown): PreviewRow[] => {
  if (Array.isArray(fields)) {
    return fields
      .map((field, index) => {
        if (!isRecord(field)) {
          return rowFromField(`Field ${index + 1}`, field);
        }

        const key = stringifyValue(field.field ?? field.name ?? field.key ?? field.label ?? `Field ${index + 1}`);
        return rowFromField(key, field);
      })
      .filter((row): row is PreviewRow => Boolean(row));
  }

  if (!isRecord(fields)) {
    return [];
  }

  return Object.entries(fields)
    .map(([key, value]) => rowFromField(key, value))
    .filter((row): row is PreviewRow => Boolean(row));
};

const flattenBusinessFields = (
  value: Record<string, unknown>,
  prefix = "",
  rows: PreviewRow[] = []
) => {
  Object.entries(value).forEach(([key, entry]) => {
    if (key === "tables" || key === "fields" || shouldHideFieldKey(key)) {
      return;
    }

    const path = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(entry)) {
      return;
    }

    if (isRecord(entry) && !looksLikeExtractedField(entry)) {
      flattenBusinessFields(entry, path, rows);
      return;
    }

    const row = rowFromField(path, entry);

    if (row) {
      rows.push(row);
    }
  });

  return rows;
};

const extractRawText = (payload: unknown, parentKey = "", collected: string[] = []) => {
  if (typeof payload === "string") {
    if (isRawTextKey(parentKey) || isLargeTextBlob(payload)) {
      collected.push(payload);
    }

    return collected;
  }

  if (Array.isArray(payload)) {
    payload.forEach((entry) => extractRawText(entry, parentKey, collected));
    return collected;
  }

  if (isRecord(payload)) {
    Object.entries(payload).forEach(([key, value]) => {
      extractRawText(value, key, collected);
    });
  }

  return collected;
};

const extractExplicitRawText = (payload: unknown, parentKey = "", collected: string[] = []) => {
  if (typeof payload === "string") {
    if (isRawTextKey(parentKey)) {
      collected.push(payload);
    }

    return collected;
  }

  if (Array.isArray(payload)) {
    payload.forEach((entry) => extractExplicitRawText(entry, parentKey, collected));
    return collected;
  }

  if (isRecord(payload)) {
    Object.entries(payload).forEach(([key, value]) => {
      extractExplicitRawText(value, key, collected);
    });
  }

  return collected;
};

const normalizeRows = (rows: unknown): { columns: string[]; rows: string[][] } => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { columns: [], rows: [] };
  }

  const firstRow = rows[0];

  if (Array.isArray(firstRow)) {
    const width = Math.max(...rows.map((row) => (Array.isArray(row) ? row.length : 0)));
    const columns = Array.from({ length: width }, (_, index) => `Column ${index + 1}`);

    return {
      columns,
      rows: rows.map((row) =>
        Array.isArray(row)
          ? row.map((cell) => sanitizePreviewValue(cell))
          : [sanitizePreviewValue(row)]
      ),
    };
  }

  if (isRecord(firstRow)) {
    const rawColumns = Array.from(
      new Set(rows.flatMap((row) => (isRecord(row) ? Object.keys(row) : [])))
    ).filter((column) => !shouldHideFieldKey(column));

    const columns = rawColumns.filter((column) =>
      rows.some((row) => {
        if (!isRecord(row)) {
          return false;
        }

        const value = row[column];
        const text = stringifyValue(value);
        return !Array.isArray(value) && !isRecord(value) && sanitizePreviewValue(value).length > 0 && !isLargeTextBlob(text);
      })
    );

    return {
      columns: columns.map(humanizeFieldName),
      rows: rows
        .map((row) => {
          if (!isRecord(row)) {
            return columns.map(() => "");
          }

          return columns.map((column) => {
            const value = row[column];

            if (Array.isArray(value) || isRecord(value)) {
              return "";
            }

            return sanitizePreviewValue(value);
          });
        })
        .filter((row) => row.some(Boolean)),
    };
  }

  return {
    columns: ["Index", "Value"],
    rows: rows
      .map((row, index) => [String(index + 1), sanitizePreviewValue(row)])
      .filter((row) => row.some(Boolean)),
  };
};

const normalizeTables = (tables: unknown): DetectedTable[] => {
  if (!Array.isArray(tables)) {
    return [];
  }

  return tables
    .map((table, index) => {
      if (isRecord(table)) {
        const rowPayload = table.rows ?? table.data ?? table.items ?? [];
        const normalized = normalizeRows(rowPayload);
        const providedColumns = Array.isArray(table.columns)
          ? table.columns
              .map(stringifyValue)
              .filter((column) => column && !shouldHideFieldKey(column))
              .map(humanizeFieldName)
          : [];
        const columns = providedColumns.length > 0 ? providedColumns : normalized.columns;

        return {
          name: shouldHideFieldKey(stringifyValue(table.name)) ? `Table ${index + 1}` : stringifyValue(table.name ?? `Table ${index + 1}`),
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
    })
    .filter((table) => table.rows.length > 0 && table.columns.length > 0);
};

const extractArrayTables = (
  payload: Record<string, unknown>,
  prefix = "",
  tables: DetectedTable[] = []
) => {
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "tables" || key === "fields" || shouldHideFieldKey(key)) {
      return;
    }

    const path = prefix ? `${prefix}.${key}` : key;

    if (Array.isArray(value)) {
      const normalized = normalizeRows(value);

      if (normalized.columns.length > 0 && normalized.rows.length > 0) {
        tables.push({
          name: humanizeFieldName(path),
          columns: normalized.columns,
          rows: normalized.rows,
        });
      }

      value.forEach((entry) => {
        if (isRecord(entry)) {
          extractArrayTables(entry, path, tables);
        }
      });
      return;
    }

    if (isRecord(value) && !looksLikeExtractedField(value)) {
      extractArrayTables(value, path, tables);
    }
  });

  return tables;
};

const fieldsSheetFromRows = (rows: PreviewRow[]): WorkbookSheet => ({
  id: "extracted-fields",
  name: "Extracted fields",
  columns: ["Field", "Extracted value", "Confidence", "Review"],
  rows: rows.map((row) => [row.field, row.value, row.confidence, row.review]),
});

const workbookSheetsFromTables = (tables: DetectedTable[]): WorkbookSheet[] =>
  tables.map((table, index) => ({
    id: sheetIdFromName(table.name || `Table ${index + 1}`, index + 2),
    name: table.name || `Table ${index + 1}`,
    columns: table.columns,
    rows: table.rows,
  }));

const unwrapEnvelope = (payload: unknown) => {
  if (isRecord(payload) && "success" in payload && "data" in payload) {
    return payload.data;
  }

  return payload;
};

const getFieldContainers = (data: Record<string, unknown>) => {
  const result = isRecord(data.result) ? data.result : undefined;
  const extraction = isRecord(data.extraction) ? data.extraction : undefined;

  return [
    data.fields,
    data.extracted_fields,
    data.extractedFields,
    data.structured_fields,
    data.structuredFields,
    data.entities,
    result?.fields,
    extraction?.fields,
  ];
};

export const isUserFacingPreviewRow = (row: PreviewRow) =>
  Boolean(row.field && row.value) && !shouldHideFieldKey(row.field);

export const normalizeOcrResult = (payload: unknown): OcrPreview => {
  const rawJson = JSON.stringify(payload, null, 2);
  const envelopeData = unwrapEnvelope(payload);
  const rawTextSource = hasStableContractShape(envelopeData)
    ? extractExplicitRawText(payload)
    : extractRawText(payload);
  const rawText = sanitizeRawText(rawTextSource.join("\n\n"));

  if (isRecord(payload) && payload.success === false) {
    return {
      rows: [],
      tables: [],
      sheets: [],
      rawJson,
      rawText,
      debug: payload,
      hasUsableData: false,
      usedFallback: true,
      message: stringifyValue(payload.message),
    };
  }

  const data = envelopeData;

  if (!isRecord(data)) {
    return {
      rows: [],
      tables: [],
      sheets: [],
      rawJson,
      rawText,
      debug: payload,
      hasUsableData: false,
      usedFallback: true,
    };
  }

  const prefersStableContract = hasStableContractShape(data);
  const fieldRows = getFieldContainers(data)
    .map(normalizeFields)
    .find((rows) => rows.length > 0) ?? [];
  const rows = fieldRows.length > 0 ? fieldRows : prefersStableContract ? [] : flattenBusinessFields(data);
  const tables = prefersStableContract
    ? normalizeTables(data.tables)
    : [...normalizeTables(data.tables), ...extractArrayTables(data)];
  const userRows = rows.filter(isUserFacingPreviewRow);
  const sheets = [fieldsSheetFromRows(userRows), ...workbookSheetsFromTables(tables)];
  const hasUsableData = sheets.some((sheet) => sheet.rows.length > 0);

  return {
    rows: userRows,
    tables,
    sheets,
    rawJson,
    rawText,
    debug: hasUsableData ? undefined : payload,
    hasUsableData,
    usedFallback: !hasUsableData,
  };
};
