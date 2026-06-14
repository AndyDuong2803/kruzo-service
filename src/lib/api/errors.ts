export const UNKNOWN_OCR_ERROR_MESSAGE = "Something went wrong while processing the document.";

const friendlyMessages: Record<string, string> = {
  CRI_OCR_EXT_1000: "The OCR service could not authenticate with its AI provider. Please try again later.",
  ERR_OCR_BIZ_2000: "The custom template JSON is invalid. Check schema_sample and try again.",
  WAR_OCR_BIZ_2001: "The file is too large for this demo. Try a smaller document.",
  WAR_OCR_BIZ_2002: "This file type is not supported. Upload a PDF, JPG, PNG, or WEBP file.",
  WAR_OCR_BIZ_2003: "The uploaded file appears to be empty. Choose another document.",
  WAR_OCR_BIZ_2004: "The custom template is too large. Shorten schema_sample and try again.",
  ERR_OCR_EXT_3000: "The OCR provider could not process the request right now. Check backend provider credentials or try again later.",
  ERR_OCR_EXT_3001: "The AI service returned data that could not be parsed. Please try another document.",
};

type ApiErrorOptions = {
  status?: number;
  errorCode?: string | null;
  details?: unknown;
  friendlyMessage?: string;
};

export class ApiError extends Error {
  status?: number;
  errorCode?: string | null;
  details?: unknown;
  friendlyMessage: string;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.errorCode = options.errorCode;
    this.details = options.details;
    this.friendlyMessage = options.friendlyMessage ?? friendlyOcrErrorMessage(options.errorCode);
  }
}

export const friendlyOcrErrorMessage = (errorCode?: string | null, fallbackMessage?: string) => {
  if (errorCode && friendlyMessages[errorCode]) {
    return friendlyMessages[errorCode];
  }

  if (fallbackMessage && !/stack|trace|exception/i.test(fallbackMessage)) {
    return fallbackMessage;
  }

  return UNKNOWN_OCR_ERROR_MESSAGE;
};
