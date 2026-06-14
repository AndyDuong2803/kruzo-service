export const LOCAL_API_BASE_URL = "http://localhost:8000";
export const PRODUCTION_API_BASE_URL = "https://api.smartocr.kruzo.tech";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
export const DISPLAY_API_BASE_URL = API_BASE_URL || LOCAL_API_BASE_URL;

export const OCR_STANDARD_PATH = "/api/v1/ocr/extract";
export const OCR_CUSTOM_PATH = "/api/v1/ocr/extract-custom";

export const hasConfiguredApiBaseUrl = API_BASE_URL.length > 0;

export const buildApiUrl = (path: string, baseUrl = API_BASE_URL) => {
  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export const buildDisplayApiUrl = (path: string) => buildApiUrl(path, DISPLAY_API_BASE_URL);
