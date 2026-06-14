"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { FiCheckCircle, FiCopy, FiSend } from "react-icons/fi";

import Container from "@/components/Container";

type SendState = "idle" | "loading" | "success" | "error";
type PlaygroundTab = "request" | "curl" | "javascript" | "python" | "response";

const fallbackApiBaseUrl = "https://api.document-ai.kruzo.tech";
const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const apiBaseUrl = configuredApiBaseUrl || fallbackApiBaseUrl;
const endpoint = `${apiBaseUrl}/documents/extract`;
const apiKeyStorageKey = "kruzo-playground-api-key";
const rememberStorageKey = "kruzo-playground-remember-key";

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
        { item: "Oil change", qty: 1, amount: "89.00" },
        { item: "Brake inspection", qty: 1, amount: "120.00" },
      ],
    },
  ],
  review: {
    status: "needs_review",
    reason: "Some service notes have lower confidence.",
  },
});

const tabs: { id: PlaygroundTab; label: string }[] = [
  { id: "request", label: "Request" },
  { id: "curl", label: "cURL" },
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "response", label: "Response" },
];

const FieldLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <label className="text-sm font-semibold text-foreground">{children}</label>
);

const ApiPlayground: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [rememberKey, setRememberKey] = useState(false);
  const [documentType, setDocumentType] = useState("auto");
  const [outputFormat, setOutputFormat] = useState("json");
  const [language, setLanguage] = useState("auto");
  const [includeConfidence, setIncludeConfidence] = useState(true);
  const [includeRawText, setIncludeRawText] = useState(false);
  const [humanReview, setHumanReview] = useState(true);
  const [sendState, setSendState] = useState<SendState>("idle");
  const [message, setMessage] = useState("Sample response remains visible until a real request succeeds.");
  const [responsePreview, setResponsePreview] = useState<unknown | null>(null);
  const [copiedLabel, setCopiedLabel] = useState("");
  const [activeTab, setActiveTab] = useState<PlaygroundTab>("request");

  useEffect(() => {
    try {
      const shouldRemember = localStorage.getItem(rememberStorageKey) === "true";
      setRememberKey(shouldRemember);

      if (shouldRemember) {
        setApiKey(localStorage.getItem(apiKeyStorageKey) ?? "");
      }
    } catch {
      setRememberKey(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (rememberKey) {
        localStorage.setItem(rememberStorageKey, "true");
        localStorage.setItem(apiKeyStorageKey, apiKey);
      } else {
        localStorage.removeItem(rememberStorageKey);
        localStorage.removeItem(apiKeyStorageKey);
      }
    } catch {
      // Storage can be unavailable in private contexts.
    }
  }, [apiKey, rememberKey]);

  const authValue = apiKey || "YOUR_API_KEY";
  const sampleResponse = useMemo(() => buildSampleResponse(documentType, language), [documentType, language]);
  const visibleResponse = responsePreview ?? sampleResponse;
  const responseJson = JSON.stringify(visibleResponse, null, 2);

  const selectedParams = useMemo(() => ({
    document_type: documentType,
    output_format: outputFormat,
    language,
    include_confidence: includeConfidence,
    include_raw_text: includeRawText,
    human_review: humanReview,
  }), [documentType, humanReview, includeConfidence, includeRawText, language, outputFormat]);

  const requestSummary = useMemo(() => {
    const params = Object.entries(selectedParams)
      .map(([key, value]) => `  ${key}: ${value}`)
      .join("\n");

    return `Method: POST
URL: ${endpoint}
Content-Type: multipart/form-data
File: ${file?.name || "repair-order.pdf"}

Parameters:
${params}`;
  }, [file?.name, selectedParams]);

  const curlCommand = useMemo(() => {
    const filePart = file?.name ? file.name : "repair-order.pdf";

    return `curl -X POST "${endpoint}" \\
  -H "Authorization: Bearer ${authValue}" \\
  -F "file=@${filePart}" \\
  -F "document_type=${documentType}" \\
  -F "output_format=${outputFormat}" \\
  -F "language=${language}" \\
  -F "include_confidence=${includeConfidence}" \\
  -F "include_raw_text=${includeRawText}" \\
  -F "human_review=${humanReview}"`;
  }, [authValue, documentType, file?.name, humanReview, includeConfidence, includeRawText, language, outputFormat]);

  const fetchExample = useMemo(() => `const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("document_type", "${documentType}");
formData.append("output_format", "${outputFormat}");
formData.append("language", "${language}");
formData.append("include_confidence", "${includeConfidence}");
formData.append("include_raw_text", "${includeRawText}");
formData.append("human_review", "${humanReview}");

const response = await fetch("${endpoint}", {
  method: "POST",
  headers: {
    Authorization: "Bearer ${authValue}",
  },
  body: formData,
});

const result = await response.json();`, [authValue, documentType, humanReview, includeConfidence, includeRawText, language, outputFormat]);

  const pythonExample = useMemo(() => `import requests

with open("repair-order.pdf", "rb") as file:
    response = requests.post(
        "${endpoint}",
        headers={"Authorization": "Bearer ${authValue}"},
        files={"file": file},
        data={
            "document_type": "${documentType}",
            "output_format": "${outputFormat}",
            "language": "${language}",
            "include_confidence": "${includeConfidence}",
            "include_raw_text": "${includeRawText}",
            "human_review": "${humanReview}",
        },
    )

result = response.json()`, [authValue, documentType, humanReview, includeConfidence, includeRawText, language, outputFormat]);

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
    setResponsePreview(null);
    setActiveTab("response");

    if (!apiKey.trim()) {
      setSendState("error");
      setMessage("Enter an API key before sending. Sample response remains visible.");
      return;
    }

    if (!file) {
      setSendState("error");
      setMessage("Choose a PDF, JPG, or PNG before sending. Sample response remains visible.");
      return;
    }

    if (!configuredApiBaseUrl) {
      setSendState("error");
      setMessage("NEXT_PUBLIC_API_BASE_URL is not configured locally. Showing the sample response.");
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
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
              Configure extraction options and test the document extraction API.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="brand-card min-w-0 rounded-2xl p-5 md:p-6">
              <div className="mb-5">
                <p className="text-sm font-semibold text-secondary">Request configuration</p>
                <p className="text-sm text-muted">POST /documents/extract</p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <FieldLabel>API key</FieldLabel>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    placeholder="kruzo_sk_..."
                    className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm"
                  />
                  <div className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-2 font-semibold">
                      <input
                        type="checkbox"
                        checked={rememberKey}
                        onChange={(event) => setRememberKey(event.target.checked)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      Remember locally
                    </label>
                    <Link href="/api-keys" className="nav-link font-semibold">Manage API keys</Link>
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
                  <SelectField label="document_type" value={documentType} options={documentTypes} onChange={setDocumentType} />
                  <SelectField label="output_format" value={outputFormat} options={outputFormats} onChange={setOutputFormat} />
                  <SelectField label="language" value={language} options={languages} onChange={setLanguage} />
                </div>

                <div className="grid gap-3 rounded-2xl border border-border bg-card-muted p-4">
                  <ToggleField label="include_confidence" checked={includeConfidence} onChange={setIncludeConfidence} />
                  <ToggleField label="include_raw_text" checked={includeRawText} onChange={setIncludeRawText} />
                  <ToggleField label="human_review" checked={humanReview} onChange={setHumanReview} />
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

type SelectFieldProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (nextValue: string) => void;
};

const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange }) => (
  <div className="grid gap-2">
    <FieldLabel>{label}</FieldLabel>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm">
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  </div>
);

type ToggleFieldProps = {
  label: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
};

const ToggleField: React.FC<ToggleFieldProps> = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between gap-4 text-sm font-semibold">
    <span>{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="h-5 w-5 accent-[var(--primary)]"
    />
  </label>
);

export default ApiPlayground;
