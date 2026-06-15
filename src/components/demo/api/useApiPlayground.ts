import { ChangeEvent, useMemo, useState } from "react";

import {
  buildDisplayApiUrl,
  hasConfiguredApiBaseUrl,
  OCR_CUSTOM_PATH,
  OCR_STANDARD_PATH,
} from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { extractCustomOcr, extractOcr } from "@/lib/api/ocr";
import { sampleOcrResponse } from "@/lib/ocr/normalizeOcrResult";
import { defaultSchemaSample } from "./constants";
import { formatJson, validateJson } from "./formatJson";
import type { ApiHistoryItem, ExtractMode, PlaygroundTab, SendState } from "./types";

const HISTORY_PAGE_SIZE = 10;

const timeLabel = () =>
  new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const stringifyJson = (value: unknown) => JSON.stringify(value, null, 2);

const createFailurePayload = (error: unknown) => {
  if (error instanceof ApiError) {
    return {
      success: false,
      status: error.status ?? null,
      error_code: error.errorCode ?? null,
      message: error.friendlyMessage,
      details: error.details ?? null,
    };
  }

  return {
    success: false,
    message: "Something went wrong while processing the document.",
    details: error instanceof Error ? { message: error.message } : error,
  };
};

export const useApiPlayground = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ExtractMode>("standard");
  const [schemaSample, setSchemaSample] = useState(defaultSchemaSample);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [message, setMessage] = useState("Sample response is shown until you send a real request.");
  const [responsePreview, setResponsePreview] = useState<unknown | null>(null);
  const [debugDetails, setDebugDetails] = useState("");
  const [copiedLabel, setCopiedLabel] = useState("");
  const [activeTab, setActiveTab] = useState<PlaygroundTab>("request");
  const [history, setHistory] = useState<ApiHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const endpointPath = mode === "custom" ? OCR_CUSTOM_PATH : OCR_STANDARD_PATH;
  const endpoint = buildDisplayApiUrl(endpointPath);
  const filePart = file?.name || "repair-order.pdf";
  const schemaValidation = useMemo(() => validateJson(schemaSample), [schemaSample]);
  const schemaIsValidForMode = mode !== "custom" || schemaValidation.valid;
  const schemaSampleForExamples = schemaSample.trim() || defaultSchemaSample;
  const compactSchemaSample = schemaSampleForExamples.replace(/\s+/g, " ");

  const sampleResponse = useMemo(
    () => ({
      ...sampleOcrResponse,
      message: "Data extracted successfully.",
    }),
    []
  );

  const loadingResponse = useMemo(
    () => ({
      status: "waiting_for_response",
      endpoint: endpointPath,
      filename: file?.name ?? null,
      mode,
    }),
    [endpointPath, file?.name, mode]
  );

  const responseContent = useMemo(() => {
    if (sendState === "loading") {
      return stringifyJson(loadingResponse);
    }

    if (responsePreview) {
      return stringifyJson(responsePreview);
    }

    return stringifyJson(sampleResponse);
  }, [loadingResponse, responsePreview, sampleResponse, sendState]);

  const requestSummary = useMemo(() => {
    const customLine = mode === "custom" ? "\n  schema_sample: JSON schema string" : "";

    return `Method: POST
URL: ${endpoint}
Content-Type: multipart/form-data
Authentication: Not required for current OCR endpoints

Fields:
  file: ${filePart}${customLine}`;
  }, [endpoint, filePart, mode]);

  const curlCommand = useMemo(() => {
    const customPart =
      mode === "custom" ? ` \\\n  -F 'schema_sample=${compactSchemaSample}'` : "";

    return `curl -X POST "${endpoint}" \\
  -F "file=@${filePart}"${customPart}`;
  }, [compactSchemaSample, endpoint, filePart, mode]);

  const fetchExample = useMemo(() => {
    const customPart =
      mode === "custom"
        ? `\nformData.append("schema_sample", ${JSON.stringify(schemaSampleForExamples)});`
        : "";

    return `const formData = new FormData();
formData.append("file", fileInput.files[0]);${customPart}

const response = await fetch("${endpoint}", {
  method: "POST",
  body: formData,
});

const result = await response.json();`;
  }, [endpoint, mode, schemaSampleForExamples]);

  const pythonExample = useMemo(() => {
    if (mode === "custom") {
      return `import requests

schema_sample = """${schemaSampleForExamples}"""

with open("repair-order.pdf", "rb") as file:
    response = requests.post(
        "${endpoint}",
        files={"file": file},
        data={"schema_sample": schema_sample},
    )

result = response.json()`;
    }

    return `import requests

with open("repair-order.pdf", "rb") as file:
    response = requests.post(
        "${endpoint}",
        files={"file": file},
    )

result = response.json()`;
  }, [endpoint, mode, schemaSampleForExamples]);

  const activeContent = {
    request: requestSummary,
    curl: curlCommand,
    javascript: fetchExample,
    python: pythonExample,
    response: responseContent,
  }[activeTab];

  const sendDisabledReason = !hasConfiguredApiBaseUrl
    ? "NEXT_PUBLIC_API_BASE_URL is not configured locally."
    : !file
      ? "Choose a file before sending."
      : !schemaIsValidForMode
        ? schemaValidation.message
        : "";

  const canSend = sendState !== "loading" && !sendDisabledReason;

  const activeHistoryItem = useMemo(
    () => history.find((item) => item.id === activeHistoryId) ?? null,
    [activeHistoryId, history]
  );

  const historyTotalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
  const boundedHistoryPage = Math.min(historyPage, historyTotalPages - 1);
  const historyPageItems = history.slice(
    boundedHistoryPage * HISTORY_PAGE_SIZE,
    boundedHistoryPage * HISTORY_PAGE_SIZE + HISTORY_PAGE_SIZE
  );

  const pushHistory = (item: Omit<ApiHistoryItem, "id" | "timeLabel">) => {
    setHistory((current) => [
      {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        timeLabel: timeLabel(),
      },
      ...current,
    ]);
    setHistoryPage(0);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setMessage(
      selectedFile
        ? `${selectedFile.name} selected.`
        : "Sample response is shown until you send a real request."
    );
  };

  const handleModeChange = (nextMode: ExtractMode) => {
    setMode(nextMode);
    setSendState("idle");
    setResponsePreview(null);
    setDebugDetails("");
    setMessage(
      nextMode === "custom"
        ? "Custom template mode sends the file plus schema_sample."
        : "Standard mode sends only the document file."
    );
  };

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      window.setTimeout(() => setCopiedLabel(""), 1400);
    } catch {
      setMessage("Copy failed in this browser. You can still select the text manually.");
    }
  };

  const copyActiveTab = () => copyText(activeContent, activeTab);

  const copyHistoryResponse = (item: ApiHistoryItem) =>
    copyText(item.responseJson, `history-${item.id}`);

  const formatSchema = () => {
    const validation = validateJson(schemaSample);

    if (!validation.valid) {
      setMessage(validation.message);
      return;
    }

    setSchemaSample(formatJson(schemaSample));
    setMessage("schema_sample formatted.");
  };

  const useSampleSchema = () => {
    setSchemaSample(defaultSchemaSample);
    setMessage("Sample schema restored.");
  };

  const sendRequest = async () => {
    if (sendState === "loading") {
      return;
    }

    setActiveTab("response");

    if (sendDisabledReason) {
      setSendState("error");
      setResponsePreview(null);
      setDebugDetails("");
      setMessage(sendDisabledReason);
      return;
    }

    setResponsePreview(null);
    setDebugDetails("");
    setSendState("loading");
    setMessage("Sending request to the OCR API...");

    try {
      const result =
        mode === "custom" ? await extractCustomOcr(file as File, schemaSample) : await extractOcr(file as File);
      const responseJson = stringifyJson(result);

      setResponsePreview(result);
      setSendState("success");
      setMessage("Real API response loaded.");
      pushHistory({
        endpointPath,
        filename: (file as File).name,
        mode,
        requestSummary,
        responseJson,
        status: "success",
        message: "Real API response loaded.",
      });
    } catch (error) {
      const failurePayload = createFailurePayload(error);
      const responseJson = stringifyJson(failurePayload);
      const friendlyMessage =
        error instanceof ApiError
          ? error.friendlyMessage
          : "Something went wrong while processing the document.";

      setResponsePreview(failurePayload);
      setSendState("error");
      setMessage(friendlyMessage);
      setDebugDetails(responseJson);
      pushHistory({
        endpointPath,
        filename: (file as File).name,
        mode,
        requestSummary,
        responseJson,
        status: "error",
        message: friendlyMessage,
      });
    }
  };

  return {
    activeContent,
    activeHistoryItem,
    activeTab,
    boundedHistoryPage,
    canSend,
    copiedLabel,
    debugDetails,
    endpoint,
    endpointPath,
    file,
    handleFileChange,
    handleModeChange,
    history,
    historyPageItems,
    historyTotalPages,
    message,
    mode,
    schemaSample,
    schemaValidation,
    sendDisabledReason,
    sendRequest,
    sendState,
    setActiveHistoryId,
    setActiveTab,
    setHistoryPage,
    setSchemaSample,
    copyActiveTab,
    copyHistoryResponse,
    formatSchema,
    useSampleSchema,
  };
};
