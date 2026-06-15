import clsx from "clsx";
import { FiChevronDown, FiSettings } from "react-icons/fi";

import { documentTypeOptions, excelTemplateOptions } from "./constants";

type ExtractionSettingsProps = {
  documentType: string;
  excelTemplate: string;
  embedded?: boolean;
  highlighted?: boolean;
  onDocumentTypeChange: (value: string) => void;
  onExcelTemplateChange: (value: string) => void;
};

const selectClassName =
  "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground outline-none transition focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-soft)]";

const ExtractionSettings: React.FC<ExtractionSettingsProps> = ({
  documentType,
  excelTemplate,
  embedded = false,
  highlighted = false,
  onDocumentTypeChange,
  onExcelTemplateChange,
}) => {
  return (
    <details
      data-tour-target="settings"
      className={clsx(
        "group",
        embedded ? "bg-card px-4 py-3 md:px-5 md:pb-4" : "brand-card rounded-2xl p-5",
        highlighted && "guided-target-active"
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-3">
          <span className="brand-icon icon-chip flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <FiSettings aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-semibold text-foreground">Optional settings</span>
            <span className="mt-0.5 block text-sm text-muted">Most users can keep these as default.</span>
          </span>
        </span>
        <FiChevronDown className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm font-semibold text-foreground">
          <span>Document type</span>
          <select value={documentType} className={selectClassName} onChange={(event) => onDocumentTypeChange(event.target.value)}>
            {documentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-foreground">
          <span>Excel template</span>
          <select value={excelTemplate} className={selectClassName} onChange={(event) => onExcelTemplateChange(event.target.value)}>
            {excelTemplateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </details>
  );
};

export default ExtractionSettings;
