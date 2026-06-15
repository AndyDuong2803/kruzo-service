import Link from "next/link";
import { ChangeEvent } from "react";
import clsx from "clsx";
import { FiSend } from "react-icons/fi";

import JsonSchemaEditor from "./JsonSchemaEditor";
import type { JsonValidation } from "./formatJson";
import type { ExtractMode, ExtractModeOption, SendState } from "./types";

type ApiRequestFormProps = {
  canSend: boolean;
  debugDetails: string;
  file: File | null;
  message: string;
  mode: ExtractMode;
  modeOptions: ExtractModeOption[];
  schemaSample: string;
  schemaValidation: JsonValidation;
  sendDisabledReason: string;
  sendState: SendState;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFormatSchema: () => void;
  onModeChange: (mode: ExtractMode) => void;
  onSchemaSampleChange: (value: string) => void;
  onSubmit: () => void;
  onUseSampleSchema: () => void;
};

const FieldLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <label className="text-sm font-semibold text-foreground">{children}</label>
);

const ApiRequestForm: React.FC<ApiRequestFormProps> = ({
  canSend,
  debugDetails,
  file,
  message,
  mode,
  modeOptions,
  schemaSample,
  schemaValidation,
  sendDisabledReason,
  sendState,
  onFileChange,
  onFormatSchema,
  onModeChange,
  onSchemaSampleChange,
  onSubmit,
  onUseSampleSchema,
}) => {
  return (
    <div className="brand-card min-w-0 rounded-2xl p-5 md:p-6">

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
                onClick={() => onModeChange(option.id)}
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
            onChange={onFileChange}
            className="rounded-xl border border-border bg-card-muted px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-[var(--accent-soft)] file:px-4 file:py-2 file:font-semibold file:text-secondary"
          />
          <p className="text-sm text-muted">{file?.name || "PDF, JPG, PNG, or WEBP"}</p>
        </div>

        {mode === "custom" && (
          <JsonSchemaEditor
            value={schemaSample}
            validation={schemaValidation}
            onChange={onSchemaSampleChange}
            onFormat={onFormatSchema}
            onUseSample={onUseSampleSchema}
          />
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
          onClick={onSubmit}
          disabled={!canSend}
          title={!canSend ? sendDisabledReason : undefined}
        >
          {sendState === "loading" && (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
              aria-hidden="true"
            />
          )}
          {sendState === "loading" ? "Sending..." : "Send test request"}
          <FiSend aria-hidden="true" />
        </button>

        {sendDisabledReason && sendState !== "loading" && (
          <p className="text-sm text-muted">{sendDisabledReason}</p>
        )}

        <p
          className={clsx(
            "rounded-xl border px-4 py-3 text-sm",
            sendState === "error"
              ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200"
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
  );
};

export default ApiRequestForm;
