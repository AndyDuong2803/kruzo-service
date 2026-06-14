import Link from "next/link";
import { FiAlertCircle, FiBookOpen, FiKey, FiServer, FiTerminal } from "react-icons/fi";
import { HiArrowRight } from "react-icons/hi2";

import Container from "@/components/Container";

export const metadata = {
  title: "Kruzo Document AI API Docs",
  description: "Extract structured data from PDFs, scanned forms, invoices, repair documents, and customer files.",
};

const baseUrl = "https://api.document-ai.kruzo.tech";

const curlExample = `curl -X POST "${baseUrl}/documents/extract" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -F "file=@repair-order.pdf" \\
  -F "document_type=repair_order" \\
  -F "output_format=json" \\
  -F "language=auto" \\
  -F "include_confidence=true" \\
  -F "human_review=true"`;

const fetchExample = `const formData = new FormData();
formData.append("file", fileInput.files[0]);
formData.append("document_type", "repair_order");
formData.append("output_format", "json");
formData.append("include_confidence", "true");
formData.append("human_review", "true");

const response = await fetch("${baseUrl}/documents/extract", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
  },
  body: formData,
});

const result = await response.json();`;

const responseSchema = `{
  "document_type": "repair_order",
  "language": "en",
  "fields": {
    "customer_name": {
      "value": "Maria Nguyen",
      "confidence": 0.96,
      "review_required": false
    },
    "total_amount": {
      "value": "$428.60",
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
      "columns": ["description", "quantity", "amount"],
      "rows": [
        ["Brake inspection", "1", "$120.00"],
        ["Oil change", "1", "$89.00"]
      ]
    }
  ],
  "review": {
    "required": true,
    "low_confidence_fields": ["service_notes"]
  },
  "metadata": {
    "file_name": "repair-order.pdf",
    "processed_at": "2026-06-14T12:00:00Z",
    "request_id": "req_123456"
  }
}`;

const requestParameters = [
  ["file", "required", "PDF, JPG, or PNG document file."],
  ["document_type", "optional", "auto | invoice | repair_order | customer_form | scanned_form"],
  ["output_format", "optional", "json | key_value | table"],
  ["language", "optional", "auto | en | vi"],
  ["include_confidence", "optional", "true | false"],
  ["include_raw_text", "optional", "true | false"],
  ["human_review", "optional", "true | false"],
];

const errorCodes = [
  ["400", "invalid_request", "Missing file or invalid parameter."],
  ["401", "unauthorized", "Missing or invalid API key."],
  ["413", "file_too_large", "Uploaded file exceeds limit."],
  ["415", "unsupported_file_type", "File type is not supported."],
  ["422", "extraction_failed", "Document could not be processed reliably."],
  ["429", "rate_limited", "Too many requests."],
  ["500", "internal_error", "Unexpected server error."],
];

const docsNav = [
  "Overview",
  "Base URL",
  "Authentication",
  "Quickstart",
  "Extract document endpoint",
  "Request parameters",
  "Response schema",
  "Confidence and human review",
  "Error codes",
  "Example requests",
  "Example responses",
  "Notes and limitations",
];

type CodeBlockProps = {
  code: string;
  language?: string;
};

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = "text" }) => {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-card-muted p-4 text-sm leading-relaxed text-foreground">
      <code data-language={language}>{code}</code>
    </pre>
  );
};

const DocsPage: React.FC = () => {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-32 md:pt-40">
      <div className="brand-hero-grid absolute inset-0 -z-10 opacity-70"></div>
      <Container>
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Developer documentation</p>
            <h1 className="mt-4 text-4xl font-bold text-foreground md:text-6xl md:leading-tight">
              Kruzo Document AI API Docs
            </h1>
            <p className="mt-4 max-w-2xl text-muted">
              Extract structured data from PDFs, scanned forms, invoices, repair documents, and customer files.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/try/api" className="brand-button brand-button-primary button-pop gap-2 px-5 py-2.5">
                Open API Playground
                <HiArrowRight aria-hidden="true" />
              </Link>
              <Link href="/try" className="brand-button brand-button-secondary button-pop px-5 py-2.5">
                Excel Demo
              </Link>
              <Link href="/pricing" className="brand-button brand-button-secondary button-pop px-5 py-2.5">
                Pricing
              </Link>
            </div>
          </div>

          <div className="mt-10 grid min-w-0 gap-6 lg:grid-cols-[0.28fr_0.72fr]">
            <aside className="brand-card h-fit rounded-2xl p-5 lg:sticky lg:top-28">
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">On this page</p>
              <nav className="mt-4 grid gap-2 text-sm">
                {docsNav.map((item) => (
                  <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className="footer-link">
                    {item}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="min-w-0 space-y-6">
              <section id="overview" className="section-anchor brand-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <FiBookOpen className="text-secondary" size={24} aria-hidden="true" />
                  <h2 className="text-2xl font-semibold">Overview</h2>
                </div>
                <p className="text-muted">
                  Kruzo Document AI will provide an API for extracting fields, tables, confidence signals, and review hints from service-business documents. API access is planned for controlled beta workflows.
                </p>
              </section>

              <section id="base-url" className="section-anchor brand-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <FiServer className="text-secondary" size={24} aria-hidden="true" />
                  <h2 className="text-2xl font-semibold">Base URL</h2>
                </div>
                <CodeBlock code={baseUrl} />
              </section>

              <section id="authentication" className="section-anchor brand-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <FiKey className="text-secondary" size={24} aria-hidden="true" />
                  <h2 className="text-2xl font-semibold">Authentication</h2>
                </div>
                <p className="mb-4 text-muted">
                  Requests use bearer token authentication. API keys are not available publicly yet.
                </p>
                <CodeBlock code="Authorization: Bearer YOUR_API_KEY" />
              </section>

              <section id="quickstart" className="section-anchor brand-card rounded-2xl p-6">
                <div className="mb-4 flex items-center gap-3">
                  <FiTerminal className="text-secondary" size={24} aria-hidden="true" />
                  <h2 className="text-2xl font-semibold">Quickstart</h2>
                </div>
                <p className="mb-4 text-muted">
                  Send a multipart form request with a document file and optional extraction settings.
                </p>
                <CodeBlock code={curlExample} language="bash" />
              </section>

              <section id="extract-document-endpoint" className="section-anchor brand-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold">Extract document endpoint</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-[0.35fr_0.65fr]">
                  <div className="rounded-xl border border-border bg-card-muted px-4 py-3 font-bold text-secondary">POST</div>
                  <div className="rounded-xl border border-border bg-card-muted px-4 py-3 font-mono text-sm">/documents/extract</div>
                </div>
                <p className="mt-4 text-muted">Content type: multipart/form-data</p>
              </section>

              <section id="request-parameters" className="section-anchor brand-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold">Request parameters</h2>
                <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-card-muted text-muted">
                      <tr>
                        <th className="border-b border-border px-4 py-3">Parameter</th>
                        <th className="border-b border-border px-4 py-3">Required</th>
                        <th className="border-b border-border px-4 py-3">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestParameters.map(([name, required, description]) => (
                        <tr key={name} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 font-mono text-secondary">{name}</td>
                          <td className="px-4 py-3 font-semibold">{required}</td>
                          <td className="px-4 py-3 text-muted">{description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="response-schema" className="section-anchor brand-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold">Response schema</h2>
                <p className="mb-4 mt-2 text-muted">
                  Sample repair order response with fields, tables, review signals, and metadata.
                </p>
                <CodeBlock code={responseSchema} language="json" />
              </section>

              <section id="confidence-and-human-review" className="section-anchor brand-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold">Confidence and human review</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {[
                    "Confidence is a signal, not a guarantee.",
                    "Low-confidence fields should be reviewed by staff.",
                    "Kruzo should not be treated as 100% accurate automation.",
                  ].map((item) => (
                    <div key={item} className="brand-card-muted rounded-xl p-4">
                      <FiAlertCircle className="text-secondary" size={22} aria-hidden="true" />
                      <p className="mt-3 text-sm text-muted">{item}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="error-codes" className="section-anchor brand-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold">Error codes</h2>
                <div className="mt-5 overflow-x-auto rounded-xl border border-border">
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead className="bg-card-muted text-muted">
                      <tr>
                        <th className="border-b border-border px-4 py-3">Status</th>
                        <th className="border-b border-border px-4 py-3">Code</th>
                        <th className="border-b border-border px-4 py-3">Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {errorCodes.map(([status, code, meaning]) => (
                        <tr key={code} className="border-b border-border last:border-b-0">
                          <td className="px-4 py-3 font-semibold">{status}</td>
                          <td className="px-4 py-3 font-mono text-secondary">{code}</td>
                          <td className="px-4 py-3 text-muted">{meaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="example-requests" className="section-anchor brand-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold">Example requests</h2>
                <div className="mt-4 space-y-4">
                  <CodeBlock code={curlExample} language="bash" />
                  <CodeBlock code={fetchExample} language="javascript" />
                </div>
              </section>

              <section id="example-responses" className="section-anchor brand-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold">Example responses</h2>
                <div className="mt-4">
                  <CodeBlock code={responseSchema} language="json" />
                </div>
              </section>

              <section id="notes-and-limitations" className="section-anchor brand-card rounded-2xl p-6">
                <h2 className="text-2xl font-semibold">Notes and limitations</h2>
                <ul className="mt-4 grid gap-3 text-muted">
                  <li>Do not upload highly sensitive documents during beta.</li>
                  <li>Results may require human review.</li>
                  <li>Very low-quality scans may reduce extraction quality.</li>
                  <li>Custom Excel templates are handled through workflow setup.</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default DocsPage;
