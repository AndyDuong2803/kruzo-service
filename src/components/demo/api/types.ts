export type SendState = "idle" | "loading" | "success" | "error";
export type PlaygroundTab = "request" | "curl" | "javascript" | "python" | "response";
export type ExtractMode = "standard" | "custom";

export type PlaygroundTabOption = {
  id: PlaygroundTab;
  label: string;
};

export type ExtractModeOption = {
  id: ExtractMode;
  label: string;
  description: string;
};

export type ApiHistoryItem = {
  id: string;
  timeLabel: string;
  endpointPath: string;
  filename: string;
  mode: ExtractMode;
  status: "success" | "error";
  requestSummary: string;
  responseJson: string;
  message: string;
};
