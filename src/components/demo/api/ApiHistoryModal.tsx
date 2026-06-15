import { useEffect } from "react";
import { FiCheckCircle, FiCopy, FiX } from "react-icons/fi";

import type { ApiHistoryItem } from "./types";

type ApiHistoryModalProps = {
  copiedLabel: string;
  item: ApiHistoryItem | null;
  onClose: () => void;
  onCopyJson: (item: ApiHistoryItem) => void;
};

const ApiHistoryModal: React.FC<ApiHistoryModalProps> = ({
  copiedLabel,
  item,
  onClose,
  onCopyJson,
}) => {
  useEffect(() => {
    if (!item) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, onClose]);

  if (!item) {
    return null;
  }

  const isCopied = copiedLabel === `history-${item.id}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-history-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-5">
          <div>
            <p id="api-history-modal-title" className="text-lg font-bold text-foreground">
              Playground response
            </p>
            <p className="text-sm text-muted">
              {item.timeLabel} - {item.endpointPath} - {item.filename}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="brand-button brand-button-secondary button-pop gap-2 px-4 py-2 text-sm"
              onClick={() => onCopyJson(item)}
            >
              {isCopied ? <FiCheckCircle aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
              {isCopied ? "Copied" : "Copy JSON"}
            </button>
            <button
              type="button"
              className="brand-button brand-button-secondary button-pop px-3 py-2 text-sm"
              onClick={onClose}
              aria-label="Close response modal"
            >
              <FiX aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="grid max-h-[calc(90vh-96px)] gap-4 overflow-auto p-5">
          <div className="rounded-2xl border border-border bg-card-muted p-4">
            <p className="text-sm font-semibold text-secondary">Request summary</p>
            <pre className="mt-3 overflow-auto whitespace-pre-wrap text-sm text-foreground">
              <code>{item.requestSummary}</code>
            </pre>
          </div>
          <div className="rounded-2xl border border-border bg-card-muted p-4">
            <p className="text-sm font-semibold text-secondary">Response JSON</p>
            <pre className="mt-3 max-h-[56vh] overflow-auto rounded-xl bg-card p-4 text-sm text-foreground">
              <code>{item.responseJson}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiHistoryModal;
