type ProcessingHistoryPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const ProcessingHistoryPagination: React.FC<ProcessingHistoryPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <button
        type="button"
        className="brand-button brand-button-secondary button-pop px-3 py-2 text-sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <p className="text-sm font-semibold text-muted">
        Page {currentPage} of {totalPages}
      </p>
      <button
        type="button"
        className="brand-button brand-button-secondary button-pop px-3 py-2 text-sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default ProcessingHistoryPagination;
