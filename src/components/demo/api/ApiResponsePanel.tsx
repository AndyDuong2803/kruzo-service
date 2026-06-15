import { FiCheckCircle, FiCopy } from "react-icons/fi";

import ApiCodeTabs from "./ApiCodeTabs";
import type { PlaygroundTab, PlaygroundTabOption } from "./types";

type ApiResponsePanelProps = {
  activeContent: string;
  activeTab: PlaygroundTab;
  copiedLabel: string;
  endpoint: string;
  tabs: PlaygroundTabOption[];
  onCopy: () => void;
  onTabChange: (tab: PlaygroundTab) => void;
};

const ApiResponsePanel: React.FC<ApiResponsePanelProps> = ({
  activeContent,
  activeTab,
  copiedLabel,
  endpoint,
  tabs,
  onCopy,
  onTabChange,
}) => {
  return (
    <div className="brand-card min-w-0 overflow-hidden rounded-2xl">
      <ApiCodeTabs activeTab={activeTab} tabs={tabs} onChange={onTabChange} />

      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-secondary">{tabs.find((tab) => tab.id === activeTab)?.label}</p>
          <p className="text-xs text-muted">{endpoint}</p>
        </div>
        <button type="button" className="brand-button brand-button-secondary button-pop gap-2 px-4 py-2 text-sm" onClick={onCopy}>
          {copiedLabel === activeTab ? <FiCheckCircle aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
          {copiedLabel === activeTab ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="max-h-[640px] min-h-[520px] overflow-auto p-5 text-sm leading-relaxed text-foreground">
        <code>{activeContent}</code>
      </pre>
    </div>
  );
};

export default ApiResponsePanel;
