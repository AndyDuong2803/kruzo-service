import { API_BASE_URL, buildApiUrl } from "@/lib/api/config";
import { ApiError, friendlyOcrErrorMessage } from "@/lib/api/errors";
import { ApiEnvelope } from "@/lib/api/types";

const isEnvelope = <TData>(payload: unknown): payload is ApiEnvelope<TData> =>
  Boolean(
    payload &&
      typeof payload === "object" &&
      "success" in payload &&
      "message" in payload &&
      "data" in payload
  );

const parseJsonResponse = async (response: Response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const postMultipart = async <TData>(
  path: string,
  formData: FormData
): Promise<ApiEnvelope<TData>> => {
  const url = buildApiUrl(path);

  if (!API_BASE_URL || !url) {
    throw new ApiError("NEXT_PUBLIC_API_BASE_URL is not configured.", {
      friendlyMessage: "NEXT_PUBLIC_API_BASE_URL is not configured locally.",
    });
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : "Network request failed.", {
      details: error instanceof Error ? { message: error.message } : error,
      friendlyMessage: UNKNOWN_NETWORK_MESSAGE,
    });
  }

  const payload = await parseJsonResponse(response);
  const envelope = isEnvelope<TData>(payload)
    ? payload
    : {
        success: response.ok,
        error_code: null,
        message: response.ok ? "Success" : response.statusText,
        data: response.ok ? (payload as TData) : null,
      };

  if (!response.ok || envelope.success === false) {
    throw new ApiError(envelope.message || response.statusText, {
      status: response.status,
      errorCode: envelope.error_code,
      details: payload,
      friendlyMessage: friendlyOcrErrorMessage(envelope.error_code, envelope.message),
    });
  }

  return envelope;
};

const UNKNOWN_NETWORK_MESSAGE =
  "Could not reach the OCR API. Check the backend server and NEXT_PUBLIC_API_BASE_URL.";
