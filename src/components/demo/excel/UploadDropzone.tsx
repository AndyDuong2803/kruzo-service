"use client";

import { ChangeEvent, DragEvent, useState } from "react";
import clsx from "clsx";
import { FiUploadCloud } from "react-icons/fi";
import { HiArrowRight } from "react-icons/hi2";

import { fileInputAccept, supportedTypesLabel } from "./constants";
import { collectDroppedFiles, mapInputFiles } from "./fileCollection";
import type { CollectedFile } from "./types";

type UploadDropzoneProps = {
  selectedCount: number;
  embedded?: boolean;
  highlighted?: boolean;
  onAddFiles: (items: CollectedFile[]) => void;
  onFolderDropped: () => void;
};

const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  selectedCount,
  embedded = false,
  highlighted = false,
  onAddFiles,
  onFolderDropped,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const isCompact = selectedCount > 0;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = mapInputFiles(event.target.files);

    if (files.length > 0) {
      onAddFiles(files);
    }

    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);

    const result = collectDroppedFiles(event.dataTransfer);

    if (result.folderDropped) {
      onFolderDropped();
    }

    if (result.files.length > 0) {
      onAddFiles(result.files);
    }
  };

  return (
    <div
      data-tour-target="upload"
      className={clsx(
        embedded ? "min-w-0 bg-card p-4 md:p-5" : "brand-card min-w-0 rounded-2xl p-5 md:p-6",
        highlighted && "guided-target-active"
      )}
    >
      <div
        className={clsx(
          "rounded-2xl border-2 border-dashed bg-card-muted transition-colors",
          isCompact ? "p-3 md:p-4" : "p-5 text-center md:p-6",
          isDragActive ? "border-[var(--accent-border)] bg-[var(--accent-soft)]" : "border-border"
        )}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setIsDragActive(true);
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={handleDrop}
      >
        <div className={clsx("flex gap-3", isCompact ? "items-center justify-between" : "flex-col items-center")}>
          <div className={clsx("min-w-0", isCompact && "flex items-center gap-3")}>
            <div
              className={clsx(
                "brand-icon icon-chip shrink-0 items-center justify-center rounded-full",
                isCompact ? "hidden h-10 w-10 sm:flex" : "mx-auto flex h-14 w-14"
              )}
            >
              <FiUploadCloud size={isCompact ? 20 : 26} aria-hidden="true" />
            </div>
            <div>
              <h2 className={clsx("font-semibold text-foreground", isCompact ? "text-base" : "mt-4 text-xl md:text-2xl")}>
                {isCompact ? "Add more documents" : "Add documents"}
              </h2>
              <p className={clsx("text-muted", isCompact ? "mt-0.5 text-sm" : "mt-2")}>
                {isCompact ? "Drag more files here." : "Choose one or more files, or drag files into this area."}
              </p>
            </div>
          </div>

          <div className={clsx(isCompact ? "shrink-0" : "mt-5")}>
            <input
              id="demo-file"
              type="file"
              multiple
              accept={fileInputAccept}
              className="sr-only"
              onChange={handleInputChange}
            />
            <label
              htmlFor="demo-file"
              className={clsx(
                "brand-button brand-button-primary button-pop cursor-pointer whitespace-nowrap text-center",
                isCompact ? "px-3 py-2 text-sm" : "mx-auto min-w-[148px] gap-2 px-5 py-2.5 sm:mx-0"
              )}
            >
              Add files
              {!isCompact && <HiArrowRight aria-hidden="true" />}
            </label>
          </div>
        </div>

        <p className={clsx("text-sm font-semibold text-secondary", isCompact ? "mt-3" : "mt-4")}>
          {supportedTypesLabel}
        </p>
      </div>
    </div>
  );
};

export default UploadDropzone;
