import { OCR_CUSTOM_PATH, OCR_STANDARD_PATH } from "@/lib/api/config";
import { postMultipart } from "@/lib/api/http";
import { OcrData, OcrExtractResponse } from "@/lib/api/types";

export const extractOcr = async (file: File): Promise<OcrExtractResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return postMultipart<OcrData>(OCR_STANDARD_PATH, formData);
};

export const extractCustomOcr = async (
  file: File,
  schemaSample: string
): Promise<OcrExtractResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("schema_sample", schemaSample);

  return postMultipart<OcrData>(OCR_CUSTOM_PATH, formData);
};
