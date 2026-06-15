"use client";

import Container from "@/components/Container";
import ApiHistory from "./api/ApiHistory";
import ApiHistoryModal from "./api/ApiHistoryModal";
import ApiRequestForm from "./api/ApiRequestForm";
import ApiResponsePanel from "./api/ApiResponsePanel";
import { modeOptions, tabs } from "./api/constants";
import { useApiPlayground } from "./api/useApiPlayground";

const ApiPlayground: React.FC = () => {
  const playground = useApiPlayground();

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 md:pt-32">
      <div className="brand-hero-grid absolute inset-0 -z-10 opacity-70"></div>
      <Container>
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">Developer tool</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground md:text-5xl">API Playground</h1>
            <p className="mt-3 text-muted">
              Test the current FastAPI OCR endpoints with a real multipart request.
            </p>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <ApiRequestForm
              canSend={playground.canSend}
              debugDetails={playground.debugDetails}
              file={playground.file}
              message={playground.message}
              mode={playground.mode}
              modeOptions={modeOptions}
              schemaSample={playground.schemaSample}
              schemaValidation={playground.schemaValidation}
              sendDisabledReason={playground.sendDisabledReason}
              sendState={playground.sendState}
              onFileChange={playground.handleFileChange}
              onFormatSchema={playground.formatSchema}
              onModeChange={playground.handleModeChange}
              onSchemaSampleChange={playground.setSchemaSample}
              onSubmit={playground.sendRequest}
              onUseSampleSchema={playground.useSampleSchema}
            />

            <ApiResponsePanel
              activeContent={playground.activeContent}
              activeTab={playground.activeTab}
              copiedLabel={playground.copiedLabel}
              debugDetails={playground.debugDetails}
              endpoint={playground.endpoint}
              message={playground.message}
              sendState={playground.sendState}
              tabs={tabs}
              onCopy={playground.copyActiveTab}
              onTabChange={playground.setActiveTab}
            />
          </div>

          <ApiHistory
            copiedLabel={playground.copiedLabel}
            currentPage={playground.boundedHistoryPage}
            items={playground.historyPageItems}
            totalItems={playground.history.length}
            totalPages={playground.historyTotalPages}
            onCopyJson={playground.copyHistoryResponse}
            onPageChange={playground.setHistoryPage}
            onViewResponse={playground.setActiveHistoryId}
          />
        </div>
      </Container>

      <ApiHistoryModal
        copiedLabel={playground.copiedLabel}
        item={playground.activeHistoryItem}
        onClose={() => playground.setActiveHistoryId(null)}
        onCopyJson={playground.copyHistoryResponse}
      />
    </section>
  );
};

export default ApiPlayground;
