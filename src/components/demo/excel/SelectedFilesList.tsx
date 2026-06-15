import clsx from "clsx";
import { FiFileText, FiTrash2 } from "react-icons/fi";

import { maxFileListHeightClass, statusLabels } from "./constants";
import { formatFileSize } from "./fileCollection";
import type { SelectedUpload } from "./types";

type SelectedFilesListProps = {
  selectedFiles: SelectedUpload[];
  embedded?: boolean;
  highlighted?: boolean;
  onRemove: (id: string) => void;
  onClear: () => void;
};

const SelectedFilesList: React.FC<SelectedFilesListProps> = ({
  selectedFiles,
  embedded = false,
  highlighted = false,
  onRemove,
  onClear,
}) => {
  const selectedCountLabel = `${selectedFiles.length} document${selectedFiles.length === 1 ? "" : "s"} ready`;

  return (
    <div
      data-tour-target="fileList"
      className={clsx(
        embedded ? "bg-card px-4 py-4 md:px-5" : "brand-card rounded-2xl p-5",
        highlighted && "guided-target-active"
      )}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold md:text-xl">Selected documents</h2>
          <p className="text-sm text-muted">{selectedCountLabel}</p>
        </div>
        <button
          type="button"
          className="nav-link w-fit text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onClear}
          disabled={selectedFiles.length === 0}
        >
          Clear all
        </button>
      </div>

      <div className={clsx("overflow-y-auto pr-1", maxFileListHeightClass)}>
        {selectedFiles.length === 0 ? (
          <div className="rounded-xl border border-border bg-card-muted p-4 text-sm text-muted">
            No documents selected yet. Add files, review them, then click Submit.
          </div>
        ) : (
          <div className="grid gap-3">
            {selectedFiles.map((item) => (
              <div key={item.id} className="hover-lift rounded-xl border border-border bg-card-muted p-3">
                <div className="flex items-start gap-3">
                  <div className="brand-icon icon-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <FiFileText aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground" title={item.label}>
                      {item.label}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span>{formatFileSize(item.file.size)}</span>
                      <span
                        className={clsx(
                          "rounded-full border px-2 py-0.5 font-semibold",
                          item.status === "done" && "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary",
                          item.status === "failed" && "border-border bg-card text-muted",
                          item.status === "processing" && "border-[var(--accent-border)] bg-card text-secondary",
                          item.status === "ready" && "border-border bg-card text-muted"
                        )}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </div>
                    {item.message && <p className="mt-2 text-xs text-muted">{item.message}</p>}
                  </div>
                  <button
                    type="button"
                    className="rounded-full p-2 text-muted transition-colors hover:bg-card hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.label}`}
                  >
                    <FiTrash2 aria-hidden="true" />
                  </button>
                </div>

                {item.status === "failed" && item.debugDetails && (
                  <details className="mt-3 rounded-xl border border-border bg-card p-3">
                    <summary className="cursor-pointer text-sm font-semibold text-foreground">Technical details</summary>
                    <pre className="mt-3 max-h-40 overflow-auto text-xs text-foreground">
                      <code>{item.debugDetails}</code>
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedFilesList;
