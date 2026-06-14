export type ApiEnvelope<TData = unknown> = {
  success: boolean;
  error_code: string | null;
  message: string;
  data: TData | null;
};

export type OcrData = Record<string, unknown>;

export type OcrExtractResponse = ApiEnvelope<OcrData>;
