import clsx from "clsx";
import { FiCheckCircle, FiCopy, FiEye, FiXCircle } from "react-icons/fi";

import type { ApiHistoryItem } from "./types";

type ApiHistoryProps = {
  copiedLabel: string;
  currentPage: number;
  items: ApiHistoryItem[];
  totalItems: number;
  totalPages: number;
  onCopyJson: (item: ApiHistoryItem) => void;
  onPageChange: (page: number) => void;
  onViewResponse: (id: string) => void;
};

const statusClassName = {
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
  error: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
};

const ApiHistory: React.FC<ApiHistoryProps> = ({
  copiedLabel,
  currentPage,
  items,
  totalItems,
  totalPages,
  onCopyJson,
  onPageChange,
  onViewResponse,
}) => {
  const pageLabel = totalItems > 0 ? `Page ${currentPage + 1} of ${totalPages}` : "No requests yet";

  return (
    <section className="brand-card mt-6 rounded-2xl p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-secondary">Session history</p>
          <p className="text-sm text-muted">
            Recent playground requests stay in this browser session for quick comparison.
          </p>
        </div>
        <p className="rounded-full border border-border bg-card-muted px-3 py-1 text-xs font-semibold text-muted">
          {pageLabel}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-card-muted p-5 text-sm text-muted">
          Send a request to add a history row with the endpoint, filename, mode, status, and response JSON.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {items.map((item) => {
            const isCopied = copiedLabel === `history-${item.id}`;

            return (
              <div
                key={item.id}
                className="grid gap-3 rounded-2xl border border-border bg-card-muted p-4 lg:grid-cols-[0.8fr_1fr_0.8fr_0.8fr_auto]"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.timeLabel}</p>
                  <p className="text-xs text-muted">{item.endpointPath}</p>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{item.filename}</p>
                  <p className="text-xs capitalize text-muted">{item.mode.replace("-", " ")} mode</p>
                </div>
                <div className="flex items-start">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold",
                      statusClassName[item.status]
                    )}
                  >
                    {item.status === "success" ? (
                      <FiCheckCircle aria-hidden="true" />
                    ) : (
                      <FiXCircle aria-hidden="true" />
                    )}
                    {item.status === "success" ? "Success" : "Failed"}
                  </span>
                </div>
                <p className="text-sm text-muted">{item.message}</p>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  <button
                    type="button"
                    className="brand-button brand-button-secondary button-pop gap-2 px-3 py-2 text-xs"
                    onClick={() => onViewResponse(item.id)}
                  >
                    <FiEye aria-hidden="true" />
                    View response
                  </button>
                  <button
                    type="button"
                    className="brand-button brand-button-secondary button-pop gap-2 px-3 py-2 text-xs"
                    onClick={() => onCopyJson(item)}
                  >
                    {isCopied ? <FiCheckCircle aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                    {isCopied ? "Copied" : "Copy JSON"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalItems > 10 && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted">Showing 10 requests per page.</p>
          <div className="flex gap-2">
            <button
              type="button"
              className="brand-button brand-button-secondary button-pop px-4 py-2 text-sm"
              disabled={currentPage === 0}
              onClick={() => onPageChange(Math.max(0, currentPage - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="brand-button brand-button-secondary button-pop px-4 py-2 text-sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ApiHistory;
