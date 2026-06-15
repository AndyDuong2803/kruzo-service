import clsx from "clsx";
import { FiAlertCircle, FiCheckCircle, FiClock, FiCopy, FiInfo } from "react-icons/fi";

import ApiCodeTabs from "./ApiCodeTabs";
import type { PlaygroundTab, PlaygroundTabOption, SendState } from "./types";

type ApiResponsePanelProps = {
  activeContent: string;
  activeTab: PlaygroundTab;
  copiedLabel: string;
  debugDetails: string;
  endpoint: string;
  message: string;
  sendState: SendState;
  tabs: PlaygroundTabOption[];
  onCopy: () => void;
  onTabChange: (tab: PlaygroundTab) => void;
};

const ApiResponsePanel: React.FC<ApiResponsePanelProps> = ({
  activeContent,
  activeTab,
  copiedLabel,
  debugDetails,
  endpoint,
  message,
  sendState,
  tabs,
  onCopy,
  onTabChange,
}) => {
  const statusMeta = {
    idle: {
      label: "Sample response",
      helper: "Static example shown before you send a request.",
      icon: FiInfo,
      className: "border-[var(--accent-border)] bg-[var(--accent-soft)] text-secondary",
    },
    loading: {
      label: "Loading",
      helper: "Waiting for the OCR API response.",
      icon: FiClock,
      className: "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
    },
    success: {
      label: "Real response",
      helper: "Response returned by the OCR API.",
      icon: FiCheckCircle,
      className: "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
    },
    error: {
      label: "Failed",
      helper: "The request failed. The friendly message and technical payload are kept here for debugging.",
      icon: FiAlertCircle,
      className: "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200",
    },
  }[sendState];
  const StatusIcon = statusMeta.icon;

  return (
    <div className="brand-card min-w-0 overflow-hidden rounded-2xl">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-secondary">Response & code</p>
          <p className="text-sm text-muted">{endpoint}</p>
        </div>
        <span
          className={clsx(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold",
            statusMeta.className
          )}
        >
          <StatusIcon aria-hidden="true" />
          {statusMeta.label}
        </span>
      </div>

      <ApiCodeTabs activeTab={activeTab} tabs={tabs} onChange={onTabChange} />

      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-secondary">{tabs.find((tab) => tab.id === activeTab)?.label}</p>
          <p className="text-xs text-muted">{activeTab === "response" ? statusMeta.helper : "Copy-ready request example."}</p>
        </div>
        <button type="button" className="brand-button brand-button-secondary button-pop gap-2 px-4 py-2 text-sm" onClick={onCopy}>
          {copiedLabel === activeTab ? <FiCheckCircle aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
          {copiedLabel === activeTab ? "Copied" : "Copy"}
        </button>
      </div>

      {activeTab === "response" && (
        <div
          className={clsx(
            "border-b px-5 py-3 text-sm",
            sendState === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
              : "border-border bg-card-muted text-muted"
          )}
          aria-live="polite"
        >
          {message}
        </div>
      )}

      <pre className="max-h-[680px] min-h-[520px] overflow-auto p-5 text-sm leading-relaxed text-foreground">
        <code>{activeContent}</code>
      </pre>

      {activeTab === "response" && sendState === "error" && debugDetails && (
        <details className="border-t border-border bg-card-muted px-5 py-4">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Technical details
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto rounded-xl border border-border bg-card p-4 text-sm text-foreground">
            <code>{debugDetails}</code>
          </pre>
        </details>
      )}
    </div>
  );
};

export default ApiResponsePanel;
