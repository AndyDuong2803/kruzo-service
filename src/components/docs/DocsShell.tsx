"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { FiCheckCircle, FiCopy } from "react-icons/fi";
import { HiArrowRight } from "react-icons/hi2";

import Container from "@/components/Container";
import {
  LOCAL_API_BASE_URL,
  OCR_CUSTOM_PATH,
  OCR_STANDARD_PATH,
  PRODUCTION_API_BASE_URL,
} from "@/lib/api/config";

type DocsTopicId =
  | "overview"
  | "quickstart"
  | "authentication"
  | "extract-document"
  | "request-parameters"
  | "response-schema"
  | "confidence-review"
  | "error-codes"
  | "rate-limits"
  | "file-limits"
  | "notes-limitations"
  | "curl"
  | "javascript"
  | "python"
  | "sample-response";

type DocsTopic = {
  id: DocsTopicId;
  label: string;
  group: string;
};

const baseUrl = PRODUCTION_API_BASE_URL;
const standardEndpoint = `${baseUrl}${OCR_STANDARD_PATH}`;
const customEndpoint = `${baseUrl}${OCR_CUSTOM_PATH}`;

const docsTopics: DocsTopic[] = [
  { group: "Get started", id: "overview", label: "Overview" },
  { group: "Get started", id: "quickstart", label: "Quickstart" },
  { group: "Get started", id: "authentication", label: "Authentication" },
  { group: "API reference", id: "extract-document", label: "Extract document" },
  { group: "API reference", id: "request-parameters", label: "Request parameters" },
  { group: "API reference", id: "response-schema", label: "Response schema" },
  { group: "API reference", id: "confidence-review", label: "Confidence & review" },
  { group: "Operations", id: "error-codes", label: "Error codes" },
  { group: "Operations", id: "rate-limits", label: "Rate limits" },
  { group: "Operations", id: "file-limits", label: "File limits" },
  { group: "Operations", id: "notes-limitations", label: "Notes & limitations" },
  { group: "Examples", id: "curl", label: "cURL" },
  { group: "Examples", id: "javascript", label: "JavaScript" },
  { group: "Examples", id: "python", label: "Python" },
  { group: "Examples", id: "sample-response", label: "Sample response" },
];

const groupedTopics = docsTopics.reduce<Record<string, DocsTopic[]>>((groups, topic) => {
  groups[topic.group] = [...(groups[topic.group] ?? []), topic];
  return groups;
}, {});

const requestParameters = [
  ["file", "required", "Both OCR endpoints", "PDF, JPG, PNG, or WEBP document file."],
  ["schema_sample", "required", OCR_CUSTOM_PATH, "JSON schema string for custom template extraction."],
];

const errorCodes = [
  ["422", "ERR_OCR_BIZ_2000", "Invalid input data, including invalid schema_sample JSON."],
  ["400", "WAR_OCR_BIZ_2001", "File size exceeds limit."],
  ["415", "WAR_OCR_BIZ_2002", "Unsupported file format."],
  ["400", "WAR_OCR_BIZ_2003", "File is empty."],
  ["413", "WAR_OCR_BIZ_2004", "Schema sample exceeds token limit."],
  ["502", "ERR_OCR_EXT_3000", "AI provider timeout or upstream failure."],
  ["502", "ERR_OCR_EXT_3001", "AI provider returned invalid JSON."],
];

const sampleResponse = `{
  "success": true,
  "error_code": null,
  "message": "Data extracted successfully.",
  "data": {
    "document_type": "repair_order",
    "language": "en",
    "fields": {
      "customer_name": {
        "value": "Maria Nguyen",
        "confidence": 0.96,
        "review_required": false
      },
      "total_amount": {
        "value": "428.60",
        "confidence": 0.91,
        "review_required": false
      },
      "service_notes": {
        "value": "Brake inspection and oil change",
        "confidence": 0.72,
        "review_required": true
      }
    },
    "tables": [
      {
        "name": "line_items",
        "rows": [
          {
            "item": "Oil change",
            "qty": 1,
            "amount": "89.00"
          },
          {
            "item": "Brake inspection",
            "qty": 1,
            "amount": "120.00"
          }
        ]
      }
    ],
    "review": {
      "status": "needs_review",
      "reason": "Some service notes have lower confidence."
    }
  }
}`;

const curlExample = `curl -X POST "${standardEndpoint}" \\
  -F "file=@repair-order.pdf"`;

const javascriptExample = `const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch("${standardEndpoint}", {
  method: "POST",
  body: formData,
});

const result = await response.json();`;

const pythonExample = `import requests

with open("repair-order.pdf", "rb") as file:
    response = requests.post(
        "${standardEndpoint}",
        files={"file": file},
    )

result = response.json()`;

const getTopicById = (id: string): DocsTopic =>
  docsTopics.find((topic) => topic.id === id) ?? docsTopics[0];

const DocsShell: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<DocsTopic>(docsTopics[0]);
  const [copiedLabel, setCopiedLabel] = useState("");

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash.replace("#", "");
      setSelectedTopic(getTopicById(hash));
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const selectedIndex = useMemo(
    () => docsTopics.findIndex((topic) => topic.id === selectedTopic.id),
    [selectedTopic.id]
  );

  const selectTopic = (topic: DocsTopic) => {
    setSelectedTopic(topic);
    window.history.replaceState(null, "", `/docs#${topic.id}`);
  };

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      window.setTimeout(() => setCopiedLabel(""), 1400);
    } catch {
      setCopiedLabel("");
    }
  };

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 md:pt-32">
      <div className="brand-hero-grid absolute inset-0 -z-10 opacity-60"></div>
      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-4 lg:grid-cols-[0.32fr_0.68fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Developer documentation</p>
              <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">API Docs</h1>
            </div>
            <div className="lg:max-w-3xl">
              <p className="text-muted">
                Extract structured data from documents into JSON, tables, and reviewable fields.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href="/try/api" className="brand-button brand-button-primary button-pop gap-2 px-5 py-2.5">
                  API Playground
                  <HiArrowRight aria-hidden="true" />
                </Link>
                <Link href="/api-keys" className="brand-button brand-button-secondary button-pop px-5 py-2.5">
                  API Keys
                </Link>
              </div>
            </div>
          </div>

          <div className="sticky top-[4.25rem] z-20 mb-5 rounded-2xl border border-border bg-card p-3 shadow-sm lg:hidden">
            <label htmlFor="docs-topic" className="sr-only">Choose docs topic</label>
            <select
              id="docs-topic"
              value={selectedTopic.id}
              onChange={(event) => selectTopic(getTopicById(event.target.value))}
              className="w-full rounded-xl border border-border bg-card-muted px-4 py-3 text-sm font-semibold text-foreground"
            >
              {docsTopics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.group}: {topic.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[0.28fr_0.72fr]">
            <aside className="hidden h-fit rounded-2xl border border-border bg-card p-4 lg:sticky lg:top-28 lg:block">
              {Object.entries(groupedTopics).map(([group, topics]) => (
                <div key={group} className="mb-5 last:mb-0">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-secondary">{group}</p>
                  <nav className="grid gap-1">
                    {topics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        className={clsx(
                          "rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                          selectedTopic.id === topic.id
                            ? "bg-[var(--accent-soft)] text-secondary"
                            : "text-muted hover:bg-card-muted hover:text-foreground"
                        )}
                        onClick={() => selectTopic(topic)}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </nav>
                </div>
              ))}
            </aside>

            <main className="min-w-0">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm text-muted">
                <span>{selectedTopic.group}</span>
                <span>{selectedIndex + 1} / {docsTopics.length}</span>
              </div>
              <article id={selectedTopic.id} className="brand-card min-w-0 rounded-2xl p-5 md:p-7">
                <DocsTopicContent
                  topic={selectedTopic}
                  copiedLabel={copiedLabel}
                  onCopy={copyText}
                />
              </article>
            </main>
          </div>
        </div>
      </Container>
    </section>
  );
};

type DocsTopicContentProps = {
  topic: DocsTopic;
  copiedLabel: string;
  onCopy: (label: string, value: string) => void;
};

const DocsTopicContent: React.FC<DocsTopicContentProps> = ({ topic, copiedLabel, onCopy }) => {
  switch (topic.id) {
    case "overview":
      return (
        <Topic title="Overview">
          <p>
            Kruzo Document AI extracts fields, tables, confidence signals, and review hints from service-business documents.
            Current OCR endpoints are available through the FastAPI backend response envelope.
          </p>
          <DefinitionGrid items={[
            ["Production base URL", baseUrl],
            ["Local base URL", LOCAL_API_BASE_URL],
            ["Standard URL", standardEndpoint],
            ["Custom URL", customEndpoint],
            ["Standard endpoint", `POST ${OCR_STANDARD_PATH}`],
            ["Custom endpoint", `POST ${OCR_CUSTOM_PATH}`],
            ["Content type", "multipart/form-data"],
          ]} />
        </Topic>
      );
    case "quickstart":
      return (
        <Topic title="Quickstart">
          <p>Send a multipart form request with a document file. The standard endpoint accepts only the file field.</p>
          <CodeBlock label="Quickstart cURL" code={curlExample} copied={copiedLabel === "Quickstart cURL"} onCopy={onCopy} />
        </Topic>
      );
    case "authentication":
      return (
        <Topic title="Authentication">
          <p>The current OCR endpoints do not require an API key. API keys are a placeholder for future/beta access control.</p>
          <Link href="/api-keys" className="nav-link mt-5 inline-flex text-sm font-semibold">
            View API keys placeholder
          </Link>
        </Topic>
      );
    case "extract-document":
      return (
        <Topic title="Extract document">
          <DefinitionGrid items={[
            ["Standard method", "POST"],
            ["Standard path", OCR_STANDARD_PATH],
            ["Custom method", "POST"],
            ["Custom path", OCR_CUSTOM_PATH],
            ["Content type", "multipart/form-data"],
            ["Standard required field", "file"],
            ["Custom required fields", "file, schema_sample"],
          ]} />
        </Topic>
      );
    case "request-parameters":
      return (
        <Topic title="Request parameters">
          <DataTable headers={["Parameter", "Required", "Applies to", "Description"]} rows={requestParameters} />
        </Topic>
      );
    case "response-schema":
      return (
        <Topic title="Response schema">
          <p>Every backend response is wrapped in the shared ApiResponse envelope.</p>
          <DefinitionGrid items={[
            ["success", "Boolean request status."],
            ["error_code", "Backend error code, or null on success."],
            ["message", "Human-readable backend message."],
            ["data", "Extracted JSON object returned by the OCR model."],
            ["data.fields", "Optional extracted key-value fields with confidence."],
            ["data.tables", "Optional structured tabular data when available."],
          ]} />
        </Topic>
      );
    case "confidence-review":
      return (
        <Topic title="Confidence & review">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Confidence is a signal, not a guarantee.",
              "Low-confidence fields should be reviewed by staff.",
              "Kruzo should not be treated as 100% accurate automation.",
            ].map((item) => (
              <div key={item} className="brand-card-muted rounded-xl p-4 text-sm text-muted">{item}</div>
            ))}
          </div>
        </Topic>
      );
    case "error-codes":
      return (
        <Topic title="Error codes">
          <DataTable headers={["Status", "Code", "Meaning"]} rows={errorCodes} />
        </Topic>
      );
    case "rate-limits":
      return (
        <Topic title="Rate limits">
          <DefinitionGrid items={[["Rate limit", "Depends on beta access"]]} />
        </Topic>
      );
    case "file-limits":
      return (
        <Topic title="File limits">
          <DefinitionGrid items={[
            ["Max file size", "10 MB backend default"],
            ["Supported files", "PDF, JPG, PNG, WEBP"],
          ]} />
        </Topic>
      );
    case "notes-limitations":
      return (
        <Topic title="Notes & limitations">
          <ul className="grid gap-3 text-muted">
            <li>Do not upload highly sensitive documents during beta.</li>
            <li>Results may require human review.</li>
            <li>Very low-quality scans may reduce extraction quality.</li>
            <li>API keys page is a placeholder; current OCR endpoints do not require API keys.</li>
            <li>Custom output uses <code>schema_sample</code> on <code>{OCR_CUSTOM_PATH}</code>.</li>
            <li><code>document_type</code>, <code>output_format</code>, and <code>language</code> are future options unless backend support is added.</li>
            <li>The CSV export in the Excel demo is a frontend sample, not a final template export.</li>
          </ul>
        </Topic>
      );
    case "curl":
      return <Topic title="cURL"><CodeBlock label="cURL" code={curlExample} copied={copiedLabel === "cURL"} onCopy={onCopy} /></Topic>;
    case "javascript":
      return <Topic title="JavaScript"><CodeBlock label="JavaScript" code={javascriptExample} copied={copiedLabel === "JavaScript"} onCopy={onCopy} /></Topic>;
    case "python":
      return <Topic title="Python"><CodeBlock label="Python" code={pythonExample} copied={copiedLabel === "Python"} onCopy={onCopy} /></Topic>;
    case "sample-response":
      return <Topic title="Sample response"><CodeBlock label="Sample response" code={sampleResponse} copied={copiedLabel === "Sample response"} onCopy={onCopy} /></Topic>;
  }
};

const Topic: React.FC<React.PropsWithChildren<{ title: string }>> = ({ title, children }) => (
  <div>
    <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
    <div className="mt-5 grid gap-5 text-muted">{children}</div>
  </div>
);

type DefinitionGridProps = {
  items: string[][];
};

const DefinitionGrid: React.FC<DefinitionGridProps> = ({ items }) => (
  <div className="grid gap-3">
    {items.map(([label, value]) => (
      <div key={label} className="rounded-xl border border-border bg-card-muted p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-secondary">{label}</p>
        <p className="mt-1 break-words font-mono text-sm text-foreground">{value}</p>
      </div>
    ))}
  </div>
);

type DataTableProps = {
  headers: string[];
  rows: string[][];
};

const DataTable: React.FC<DataTableProps> = ({ headers, rows }) => (
  <div className="overflow-x-auto rounded-xl border border-border">
    <table className="w-full min-w-[680px] text-left text-sm">
      <thead className="bg-card-muted text-muted">
        <tr>
          {headers.map((header) => (
            <th key={header} className="border-b border-border px-4 py-3 font-semibold">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.join("-")} className="border-b border-border last:border-b-0">
            {row.map((cell, index) => (
              <td key={cell} className={clsx("px-4 py-3", index === 1 ? "font-semibold text-foreground" : "text-muted")}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

type CodeBlockProps = {
  label: string;
  code: string;
  copied: boolean;
  onCopy: (label: string, value: string) => void;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ label, code, copied, onCopy }) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    <div className="flex items-center justify-between gap-3 border-b border-border bg-card-muted px-4 py-3">
      <p className="text-sm font-semibold text-secondary">{label}</p>
      <button
        type="button"
        className="brand-button brand-button-secondary button-pop gap-2 px-3 py-1.5 text-sm"
        onClick={() => onCopy(label, code)}
      >
        {copied ? <FiCheckCircle aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
    <pre className="max-h-[520px] overflow-auto p-4 text-sm leading-relaxed text-foreground">
      <code>{code}</code>
    </pre>
  </div>
);

export default DocsShell;
