import { KeyboardEvent } from "react";
import clsx from "clsx";
import { FiCheckCircle, FiCode, FiRefreshCw } from "react-icons/fi";

import type { JsonValidation } from "./formatJson";

type JsonSchemaEditorProps = {
  value: string;
  validation: JsonValidation;
  onChange: (value: string) => void;
  onFormat: () => void;
  onUseSample: () => void;
};

const JsonSchemaEditor: React.FC<JsonSchemaEditorProps> = ({
  value,
  validation,
  onChange,
  onFormat,
  onUseSample,
}) => {
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const nextValue = `${value.slice(0, start)}  ${value.slice(end)}`;

    onChange(nextValue);
    window.requestAnimationFrame(() => {
      target.selectionStart = start + 2;
      target.selectionEnd = start + 2;
    });
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-foreground" htmlFor="schema-sample">
          schema_sample
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="brand-button brand-button-secondary button-pop gap-2 px-3 py-1.5 text-xs"
            onClick={onFormat}
          >
            <FiCode aria-hidden="true" />
            Format JSON
          </button>
          <button
            type="button"
            className="brand-button brand-button-secondary button-pop gap-2 px-3 py-1.5 text-xs"
            onClick={onUseSample}
          >
            <FiRefreshCw aria-hidden="true" />
            Use sample schema
          </button>
        </div>
      </div>

      <textarea
        id="schema-sample"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        rows={10}
        spellCheck={false}
        className={clsx(
          "rounded-xl border bg-card-muted px-4 py-3 font-mono text-sm leading-relaxed outline-none transition-colors",
          validation.valid
            ? "border-border focus:border-[var(--accent-border)]"
            : "border-red-500 focus:border-red-500"
        )}
        aria-invalid={!validation.valid}
        aria-describedby="schema-sample-validation"
      />

      <p
        id="schema-sample-validation"
        className={clsx(
          "flex items-center gap-2 text-sm",
          validation.valid ? "text-secondary" : "text-red-600 dark:text-red-300"
        )}
      >
        {validation.valid && <FiCheckCircle aria-hidden="true" />}
        {validation.message}
      </p>
      <p className="text-sm text-muted">
        The current backend expects schema_sample as a JSON schema string. Press Tab to insert two spaces.
      </p>
    </div>
  );
};

export default JsonSchemaEditor;
