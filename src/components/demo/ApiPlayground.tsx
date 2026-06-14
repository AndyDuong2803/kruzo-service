"use client";

import { ChangeEvent, useMemo, useState } from "react";
import clsx from "clsx";
import { FiCheckCircle, FiCopy, FiSend } from "react-icons/fi";

import Container from "@/components/Container";

type SendState = "idle" | "loading" | "success" | "error";

const fallbackApiBaseUrl = "https://api.document-ai.kruzo.tech";
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiBaseUrl = configuredApiBaseUrl || fallbackApiBaseUrl;

const documentTypes = ["auto", "invoice", "repair_order", "customer_form", "scanned_form"];
const outputFormats = ["json", "key_value", "table"];
const languages = ["auto", "en", "vi"];

const buildSampleResponse = (documentType: string, language: string) => ({
  document_type: documentType === "auto" ? "repair_order" : documentType,
  language: language === "auto" ? "en" : language,
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
        {
          item: "Oil change",
          qty: 1,
          amount: "89.00",
        },
        {
          item: "Brake inspection",
          qty: 1,
          amount: "120.00",
        },
      ],
    },
  ],
  review: {
    status: "needs_review",
    reason: "Some service notes have lower confidence.",
  },
});

const FieldLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <label className="text-sm font-semibold text-foreground">{children}</label>
);

const ApiPlayground: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("auto");
  const [outputFormat, setOutputFormat] = useState("json");
  const [language, setLanguage] = useState("auto");
  const [includeConfidence, setIncludeConfidence] = useState(true);
  const [includeRawText, setIncludeRawText] = useState(false);
  const [humanReview, setHumanReview] = useState(true);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [message, setMessage] = useState("Sample response is shown until a real API request succeeds.");
  const [responsePreview, setResponsePreview] = useState<unknown | null>(null);
  const [copiedLabel, setCopiedLabel] = useState("");

  const requestUrl = `${apiBaseUrl}/documents/extract`;
  const sampleResponse = useMemo(() => buildSampleResponse(documentType, language), [documentType, language]);
  const visibleResponse = responsePreview ?? sampleResponse;
  const responseJson = JSON.stringify(visibleResponse, null, 2);

  const curlCommand = useMemo(() => {
    const filePart = file?.name ? file.name : "repair-order.pdf";

    return `curl -X POST "${requestUrl}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@${filePart}" \\
  -F "document_type=${documentType}" \\
  -F "output_format=${outputFormat}" \\
  -F "language=${language}" \\
  -F "include_confidence=${includeConfidence}" \\
  -F "include_raw_text=${includeRawText}" \\
  -F "human_review=${humanReview}"`;
  }, [documentType, file?.name, humanReview, includeConfidence, includeRawText, language, outputFormat, requestUrl]);

  const fetchExample = useMemo(() => {
    return `const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("document_type", "${documentType}");
formData.append("output_format", "${outputFormat}");
formData.append("language", "${language}");
formData.append("include_confidence", "${includeConfidence}");
formData.append("include_raw_text", "${includeRawText}");
formData.append("human_review", "${humanReview}");

const response = await fetch("${requestUrl}", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: formData,
});

const result = await response.json();`;
  }, [documentType, humanReview, includeConfidence, includeRawText, language, outputFormat, requestUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setMessage(selectedFile ? `${selectedFile.name} selected.` : "Sample response is shown until a real API request succeeds.");
  };

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      window.setTimeout(() => setCopiedLabel(""), 1400);
    } catch {
      setMessage("Copy failed in this browser. You can still select the code manually.");
    }
  };

  const sendRequest = async () => {
    setResponsePreview(null);

    if (!configuredApiBaseUrl) {
      setSendState("error");
      setMessage("NEXT_PUBLIC_API_BASE_URL is not configured locally. Showing the sample response.");
      return;
    }

    if (!file) {
      setSendState("error");
      setMessage("Choose a PDF, JPG, or PNG before sending a real request. Sample response remains visible.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);
    formData.append("output_format", outputFormat);
    formData.append("language", language);
    formData.append("include_confidence", String(includeConfidence));
    formData.append("include_raw_text", String(includeRawText));
    formData.append("human_review", String(humanReview));

    setSendState("loading");
    setMessage("Sending test request...");

    try {
      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          Authorization: "Bearer YOUR_API_KEY",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();
      setResponsePreview(result);
      setSendState("success");
      setMessage("Real API response loaded.");
    } catch (error) {
      setSendState("error");
      setMessage(`${error instanceof Error ? error.message : "Request failed"}. Showing the sample response instead.`);
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
              Configure extraction options, send a test request, and inspect the JSON response.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="brand-card min-w-0 rounded-2xl p-5 md:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold text-secondary">Request configuration</p>
                <p className="text-sm text-muted">Endpoint: POST /documents/extract</p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FieldLabel>Base URL</FieldLabel>
                  <div className="rounded-xl border border-border bg-card-muted px-4 py-3 font-mono text-sm">
                    {apiBaseUrl}
                  </div>
                </div>

                <div className="grid gap-2">
                  <FieldLabel>Upload file</FieldLabel>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:font-semibold file:text-secondary"
                  />
                  <p className="text-sm text-muted">{file?.name || "PDF, JPG, or PNG"}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <FieldLabel>document_type</FieldLabel>
                    <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm">
                      {documentTypes.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel>output_format</FieldLabel>
                    <select value={outputFormat} onChange={(event) => setOutputFormat(event.target.value)} className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm">
                      {outputFormats.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel>language</FieldLabel>
                    <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm">
                      {languages.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 rounded-2xl border border-border bg-card-muted p-4">
                  {[
                    ["include_confidence", includeConfidence, setIncludeConfidence],
                    ["include_raw_text", includeRawText, setIncludeRawText],
                    ["human_review", humanReview, setHumanReview],
                  ].map(([label, value, setter]) => (
                    <label key={label as string} className="flex items-center justify-between gap-4 text-sm font-semibold">
                      <span>{label as string}</span>
                      <input
                        type="checkbox"
                        checked={value as boolean}
                        onChange={(event) => (setter as (next: boolean) => void)(event.target.checked)}
                        className="h-5 w-5 accent-[var(--primary)]"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="min-w-0 space-y-5">
              <div className="brand-card rounded-2xl p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-secondary">Request URL</p>
                    <p className="mt-1 break-all font-mono text-sm text-muted">{requestUrl}</p>
                  </div>
                  <button
                    type="button"
                    className="brand-button brand-button-primary button-pop gap-2 px-5 py-2.5"
                    onClick={sendRequest}
                    disabled={sendState === "loading"}
                  >
                    {sendState === "loading" ? "Sending..." : "Send test request"}
                    <FiSend aria-hidden="true" />
                  </button>
                </div>

                <p
                  className={clsx(
                    "mt-4 rounded-xl border px-4 py-3 text-sm",
                    sendState === "error"
                      ? "border-border bg-card-muted text-muted"
                      : "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary"
                  )}
                  aria-live="polite"
                >
                  {message}
                </p>
              </div>

              <CodePreview title="cURL" code={curlCommand} copied={copiedLabel === "cURL"} onCopy={() => copyText("cURL", curlCommand)} />
              <CodePreview title="JavaScript fetch" code={fetchExample} copied={copiedLabel === "JavaScript fetch"} onCopy={() => copyText("JavaScript fetch", fetchExample)} />
              <CodePreview title="JSON response" code={responseJson} copied={copiedLabel === "JSON response"} onCopy={() => copyText("JSON response", responseJson)} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

type CodePreviewProps = {
  title: string;
  code: string;
  copied: boolean;
  onCopy: () => void;
};

const CodePreview: React.FC<CodePreviewProps> = ({ title, code, copied, onCopy }) => {
  return (
    <div className="brand-card min-w-0 overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card-muted px-5 py-3">
        <p className="text-sm font-semibold text-secondary">{title}</p>
        <button type="button" className="brand-button brand-button-secondary button-pop gap-2 px-4 py-2 text-sm" onClick={onCopy}>
          {copied ? <FiCheckCircle aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[360px] overflow-auto p-5 text-sm leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default ApiPlayground;
