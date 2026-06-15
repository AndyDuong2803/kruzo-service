"use client";

import { ChangeEvent, useMemo, useState } from "react";

import Container from "@/components/Container";
import {
  buildDisplayApiUrl,
  hasConfiguredApiBaseUrl,
  OCR_CUSTOM_PATH,
  OCR_STANDARD_PATH,
} from "@/lib/api/config";
import { ApiError } from "@/lib/api/errors";
import { extractCustomOcr, extractOcr } from "@/lib/api/ocr";
import { sampleOcrResponse } from "@/lib/ocr/normalizeOcrResult";
import ApiRequestForm from "./api/ApiRequestForm";
import ApiResponsePanel from "./api/ApiResponsePanel";
import { defaultSchemaSample, modeOptions, tabs } from "./api/constants";
import type { ExtractMode, PlaygroundTab, SendState } from "./api/types";

const ApiPlayground: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<ExtractMode>("standard");
  const [schemaSample, setSchemaSample] = useState(defaultSchemaSample);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [message, setMessage] = useState("Sample response remains visible until a real request succeeds.");
  const [responsePreview, setResponsePreview] = useState<unknown | null>(null);
  const [debugDetails, setDebugDetails] = useState("");
  const [copiedLabel, setCopiedLabel] = useState("");
  const [activeTab, setActiveTab] = useState<PlaygroundTab>("request");

  const endpointPath = mode === "custom" ? OCR_CUSTOM_PATH : OCR_STANDARD_PATH;
  const endpoint = buildDisplayApiUrl(endpointPath);
  const filePart = file?.name || "repair-order.pdf";
  const schemaSampleForExamples = schemaSample.trim() || defaultSchemaSample;
  const compactSchemaSample = schemaSampleForExamples.replace(/\s+/g, " ");
  const sampleResponse = useMemo(() => ({
    ...sampleOcrResponse,
    message: mode === "custom"
      ? "Custom template data extracted successfully."
      : "Data extracted successfully.",
  }), [mode]);
  const visibleResponse = responsePreview ?? sampleResponse;
  const responseJson = JSON.stringify(visibleResponse, null, 2);

  const requestSummary = useMemo(() => {
    const customLine = mode === "custom"
      ? "\n  schema_sample: JSON schema string"
      : "";

    return `Method: POST
URL: ${endpoint}
Content-Type: multipart/form-data
Authentication: Not required for current OCR endpoints

Fields:
  file: ${filePart}${customLine}`;
  }, [endpoint, filePart, mode]);

  const curlCommand = useMemo(() => {
    const customPart = mode === "custom"
      ? ` \\\n  -F 'schema_sample=${compactSchemaSample}'`
      : "";

    return `curl -X POST "${endpoint}" \\
  -F "file=@${filePart}"${customPart}`;
  }, [compactSchemaSample, endpoint, filePart, mode]);

  const fetchExample = useMemo(() => {
    const customPart = mode === "custom"
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
    response: responseJson,
  }[activeTab];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setMessage(selectedFile ? `${selectedFile.name} selected.` : "Sample response remains visible until a real request succeeds.");
  };

  const copyActiveTab = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopiedLabel(activeTab);
      window.setTimeout(() => setCopiedLabel(""), 1400);
    } catch {
      setMessage("Copy failed in this browser. You can still select the text manually.");
    }
  };

  const sendRequest = async () => {
    if (sendState === "loading") {
      return;
    }

    setResponsePreview(null);
    setDebugDetails("");
    setActiveTab("response");

    if (!file) {
      setSendState("error");
      setMessage("Choose a PDF, JPG, PNG, or WEBP before sending. Sample response remains visible.");
      return;
    }

    if (mode === "custom" && !schemaSample.trim()) {
      setSendState("error");
      setMessage("Custom template mode requires schema_sample. Sample response remains visible.");
      return;
    }

    if (!hasConfiguredApiBaseUrl) {
      setSendState("error");
      setMessage("NEXT_PUBLIC_API_BASE_URL is not configured locally. Showing the sample response.");
      return;
    }

    setSendState("loading");
    setMessage("Sending test request...");

    try {
      const result = mode === "custom"
        ? await extractCustomOcr(file, schemaSample)
        : await extractOcr(file);

      setResponsePreview(result);
      setSendState("success");
      setMessage("Real API response loaded.");
    } catch (error) {
      setSendState("error");
      setMessage(error instanceof ApiError
        ? `${error.friendlyMessage} Showing the sample response instead.`
        : "Something went wrong while processing the document. Showing the sample response instead."
      );
      setDebugDetails(error instanceof ApiError && error.details ? JSON.stringify(error.details, null, 2) : "");
    }
  };

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 md:pt-32">
      <div className="brand-hero-grid absolute inset-0 -z-10 opacity-70"></div>
      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Developer tool</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">API Playground</h1>
            <p className="mt-3 text-muted">
              Test the current FastAPI OCR endpoints with a real multipart request.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <ApiRequestForm
              debugDetails={debugDetails}
              endpointPath={endpointPath}
              file={file}
              message={message}
              mode={mode}
              modeOptions={modeOptions}
              schemaSample={schemaSample}
              sendState={sendState}
              onFileChange={handleFileChange}
              onModeChange={setMode}
              onSchemaSampleChange={setSchemaSample}
              onSubmit={sendRequest}
            />

            <ApiResponsePanel
              activeContent={activeContent}
              activeTab={activeTab}
              copiedLabel={copiedLabel}
              endpoint={endpoint}
              tabs={tabs}
              onCopy={copyActiveTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ApiPlayground;
