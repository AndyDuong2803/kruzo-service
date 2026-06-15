"use client";

import Link from "next/link";
import { FiHelpCircle } from "react-icons/fi";

import Container from "@/components/Container";

import ExtractionSettings from "./excel/ExtractionSettings";
import ProcessingHistory from "./excel/ProcessingHistory";
import ResultPreviewModal from "./excel/ResultPreviewModal";
import SelectedFilesList from "./excel/SelectedFilesList";
import SubmitPanel from "./excel/SubmitPanel";
import Toast from "./excel/Toast";
import UploadDropzone from "./excel/UploadDropzone";
import { tourSteps } from "./excel/tourSteps";
import { useGuidedTour } from "./excel/useGuidedTour";
import { useUploadQueue } from "./excel/useUploadQueue";

const ExcelDemoWorkspace: React.FC = () => {
  const {
    selectedFiles,
    processingHistory,
    documentType,
    excelTemplate,
    processingLabel,
    submitLabel,
    activeResultFile,
    toasts,
    setDocumentType,
    setExcelTemplate,
    addCollectedFiles,
    showFolderUnsupportedToast,
    removeFile,
    clearFiles,
    submitSelectedFiles,
    selectActiveResult,
    closeResultModal,
    downloadActiveCsv,
    downloadHistoryCsv,
    dismissToast,
  } = useUploadQueue();
  const {
    tourOpen,
    tourIndex,
    currentStep,
    progressLabel,
    dismissTour,
    restartTour,
    goNext,
    goBack,
    isTargetActive,
  } = useGuidedTour(tourSteps);

  return (
    <section className="relative overflow-hidden px-5 pb-14 pt-24 md:pt-28">
      <div className="brand-hero-grid absolute inset-0 -z-10 opacity-70"></div>

      {tourOpen && <div className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[1px]" aria-hidden="true"></div>}

      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Excel Demo</p>
              <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">Document to Excel Demo</h1>
              <p className="mt-3 max-w-2xl text-muted">
                Add files, click Submit, then view results from history.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="brand-button brand-button-secondary button-pop gap-2 px-4 py-2.5 text-sm"
                onClick={restartTour}
              >
                <FiHelpCircle aria-hidden="true" />
                Guide me
              </button>
              <Link href="/try/api" className="nav-link text-sm font-semibold">
                Developer? Open API Playground
              </Link>
            </div>
          </div>

          <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
            <div className="grid min-w-0 gap-4">
              <UploadDropzone
                selectedCount={selectedFiles.length}
                highlighted={isTargetActive("upload")}
                onAddFiles={addCollectedFiles}
                onFolderDropped={showFolderUnsupportedToast}
              />

              <SelectedFilesList
                selectedFiles={selectedFiles}
                highlighted={isTargetActive("fileList")}
                onRemove={removeFile}
                onClear={clearFiles}
              />

              <SubmitPanel
                selectedCount={selectedFiles.length}
                submitLabel={submitLabel}
                processingLabel={processingLabel}
                highlighted={isTargetActive("submit")}
                onSubmit={submitSelectedFiles}
              />

              <ExtractionSettings
                documentType={documentType}
                excelTemplate={excelTemplate}
                highlighted={isTargetActive("settings")}
                onDocumentTypeChange={setDocumentType}
                onExcelTemplateChange={setExcelTemplate}
              />
            </div>

            <ProcessingHistory
              history={processingHistory}
              activeResultId={activeResultFile?.id}
              highlighted={isTargetActive("history")}
              modalHighlighted={isTargetActive("modalPreview")}
              onViewResult={selectActiveResult}
              onDownloadCsv={downloadHistoryCsv}
            />
          </div>
        </div>
      </Container>

      <ResultPreviewModal result={activeResultFile} onClose={closeResultModal} onDownloadCsv={downloadActiveCsv} />
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {tourOpen && currentStep && (
        <div
          className="guided-tour-card fixed bottom-5 left-5 right-5 z-[70] mx-auto max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl md:bottom-8 md:left-auto md:right-8"
          role="dialog"
          aria-live="polite"
          aria-label="Kruzo demo guide"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">{progressLabel}</p>
            <button type="button" className="nav-link text-sm font-semibold" onClick={dismissTour}>
              Skip
            </button>
          </div>
          <h2 className="text-xl font-semibold">{currentStep.title}</h2>
          <p className="mt-2 text-muted">{currentStep.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              className="brand-button brand-button-secondary button-pop px-4 py-2 text-sm"
              onClick={goBack}
              disabled={tourIndex === 0}
            >
              Back
            </button>
            <button type="button" className="brand-button brand-button-primary button-pop px-5 py-2 text-sm" onClick={goNext}>
              {tourIndex === tourSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ExcelDemoWorkspace;
