import clsx from "clsx";
import { HiArrowRight } from "react-icons/hi2";

type SubmitPanelProps = {
  selectedCount: number;
  processingLabel: string;
  submitLabel: string;
  embedded?: boolean;
  highlighted?: boolean;
  onSubmit: () => void;
};

const SubmitPanel: React.FC<SubmitPanelProps> = ({
  selectedCount,
  processingLabel,
  submitLabel,
  embedded = false,
  highlighted = false,
  onSubmit,
}) => {
  const helperMessage = selectedCount > 0
      ? "Review the selected documents, then click Submit."
      : processingLabel || "Add documents to enable Submit.";

  return (
    <div
      data-tour-target="submit"
      className={clsx(
        embedded ? "bg-card px-4 py-4 md:px-5 md:pb-5" : "brand-card rounded-2xl p-5",
        highlighted && "guided-target-active"
      )}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold md:text-xl">Submit for extraction</h2>
        <p className="mt-1 text-sm text-muted">Kruzo only starts processing after you click Submit.</p>
      </div>

      <button
        type="button"
        className="brand-button brand-button-primary button-pop w-full gap-2 px-5 py-3"
        onClick={onSubmit}
        disabled={selectedCount === 0}
      >
        {submitLabel}
        <HiArrowRight aria-hidden="true" />
      </button>

      <p className="mt-3 text-sm text-muted" aria-live="polite">
        {helperMessage}
      </p>
    </div>
  );
};

export default SubmitPanel;
