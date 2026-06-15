import type { TourStep } from "./types";

export const tourSteps: TourStep[] = [
  {
    target: "upload",
    title: "Add documents",
    description: "Choose one or more files, or drag files into the upload area.",
  },
  {
    target: "fileList",
    title: "Review selected documents",
    description: "Remove anything you do not want to process.",
  },
  {
    target: "submit",
    title: "Submit files",
    description: "Submitted files move into Processing history so you can keep adding more files.",
  },
  {
    target: "settings",
    title: "Optional settings",
    description: "Most users can keep these defaults, but you can adjust them if needed.",
  },
  {
    target: "history",
    title: "Check history",
    description: "Track each file status and open results from here.",
  },
  {
    target: "modalPreview",
    title: "View and download",
    description: "Open a result in a modal and download CSV when it is ready.",
  },
];
