import clsx from "clsx";

import type { PlaygroundTab, PlaygroundTabOption } from "./types";

type ApiCodeTabsProps = {
  activeTab: PlaygroundTab;
  tabs: PlaygroundTabOption[];
  onChange: (tab: PlaygroundTab) => void;
};

const ApiCodeTabs: React.FC<ApiCodeTabsProps> = ({ activeTab, tabs, onChange }) => {
  return (
    <div className="border-b border-border bg-card-muted p-3">
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={clsx(
              "rounded-full px-4 py-2 text-sm font-bold transition-colors",
              activeTab === tab.id
                ? "bg-[var(--accent-soft)] text-secondary"
                : "text-muted hover:bg-card hover:text-foreground"
            )}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ApiCodeTabs;
