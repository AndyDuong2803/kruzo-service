"use client";

import Link from "next/link";
import { ChangeEvent, useMemo, useState } from "react";
import clsx from "clsx";
import { FiCheckCircle, FiCopy, FiSend } from "react-icons/fi";

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

type SendState = "idle" | "loading" | "success" | "error";
type PlaygroundTab = "request" | "curl" | "javascript" | "python" | "response";
type ExtractMode = "standard" | "custom";

const tabs: { id: PlaygroundTab; label: string }[] = [
  { id: "request", label: "Request" },
  { id: "curl", label: "cURL" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "response", label: "Response" },
];

const modeOptions: { id: ExtractMode; label: string; description: string }[] = [
  {
    id: "standard",
    label: "Standard extract",
    description: "Send only the document file to the default OCR extractor.",
  },
  {
    id: "custom",
    label: "Custom template extract",
    description: "Send the document file plus a JSON schema_sample.",
  },
];

const defaultSchemaSample = `{
  "type": "object",
  "properties": {
    "customer_name": { "type": "string" },
    "invoice_total": { "type": "string" },
    "service_date": { "type": "string" }
  },
  "required": ["customer_name"]
}`;

const FieldLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <label className="text-sm font-semibold text-foreground">{children}</label>
);

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
            <div className="brand-card min-w-0 rounded-2xl p-5 md:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold text-secondary">Request configuration</p>
                <p className="text-sm text-muted">POST {endpointPath}</p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-3">
                  <FieldLabel>Extraction mode</FieldLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {modeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        aria-pressed={mode === option.id}
                        className={clsx(
                          "rounded-2xl border p-4 text-left transition-colors",
                          mode === option.id
                            ? "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                            : "border-border bg-card-muted text-foreground hover:border-[var(--accent-border)]"
                        )}
                        onClick={() => setMode(option.id)}
                      >
                        <span className="block text-sm font-bold">{option.label}</span>
                        <span className="mt-1 block text-sm text-muted">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <FieldLabel>Upload file</FieldLabel>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:font-semibold file:text-secondary"
                  />
                  <p className="text-sm text-muted">{file?.name || "PDF, JPG, PNG, or WEBP"}</p>
                </div>

                {mode === "custom" && (
                  <div className="grid gap-2">
                    <FieldLabel>schema_sample</FieldLabel>
                    <textarea
                      value={schemaSample}
                      onChange={(event) => setSchemaSample(event.target.value)}
                      rows={9}
                      className="rounded-xl border border-border bg-card-muted px-4 py-3 font-mono text-sm"
                    />
                    <p className="text-sm text-muted">
                      Current backend expects schema_sample as a JSON schema string.
                    </p>
                  </div>
                )}

                <details className="rounded-2xl border border-border bg-card-muted p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">
                    Future API key support
                  </summary>
                  <div className="mt-3 grid gap-2 text-sm text-muted">
                    <p>Current OCR endpoints are public and do not require an API key.</p>
                    <Link href="/api-keys" className="nav-link font-semibold">View placeholder API keys page</Link>
                  </div>
                </details>

                <details className="rounded-2xl border border-border bg-card-muted p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-foreground">
                    Future options not sent
                  </summary>
                  <p className="mt-3 text-sm text-muted">
                    document_type, output_format, language, include_confidence, include_raw_text, and human_review are planned options only.
                  </p>
                </details>

                <button
                  type="button"
                  className="brand-button brand-button-primary button-pop gap-2 px-5 py-2.5"
                  onClick={sendRequest}
                  disabled={sendState === "loading"}
                >
                  {sendState === "loading" ? "Sending..." : "Send test request"}
                  <FiSend aria-hidden="true" />
                </button>

                <p
                  className={clsx(
                    "rounded-xl border px-4 py-3 text-sm",
                    sendState === "error"
                      ? "border-border bg-card-muted text-muted"
                      : "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                  )}
                  aria-live="polite"
                >
                  {message}
                </p>

                {debugDetails && (
                  <details className="rounded-2xl border border-border bg-card-muted p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-foreground">
                      Technical details
                    </summary>
                    <pre className="mt-3 max-h-56 overflow-auto rounded-xl border border-border bg-card p-4 text-sm text-foreground">
                      <code>{debugDetails}</code>
                    </pre>
                  </details>
                )}
              </div>
            </div>

            <div className="brand-card min-w-0 overflow-hidden rounded-2xl">
              <div className="border-b border-border bg-card-muted p-3">
                <div className="flex gap-2 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={clsx(
                        "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                        activeTab === tab.id
                          ? "bg-[var(--accent-soft)] text-secondary"
                          : "text-muted hover:bg-card hover:text-foreground"
                      )}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-secondary">{tabs.find((tab) => tab.id === activeTab)?.label}</p>
                  <p className="text-xs text-muted">{endpoint}</p>
                </div>
                <button type="button" className="brand-button brand-button-secondary button-pop gap-2 px-4 py-2 text-sm" onClick={copyActiveTab}>
                  {copiedLabel === activeTab ? <FiCheckCircle aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                  {copiedLabel === activeTab ? "Copied" : "Copy"}
                </button>
              </div>

              <pre className="max-h-[640px] min-h-[520px] overflow-auto p-5 text-sm leading-relaxed text-foreground">
                <code>{activeContent}</code>
              </pre>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default ApiPlayground;
