export type ConfidenceLevel = "High" | "Medium" | "Needs review";

// TODO: Replace frontend confidence fallback when backend returns reliable confidence scores.
const numericConfidence = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const normalized = value.replace("%", "").trim();
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const confidenceLevelFromValue = (value: unknown): ConfidenceLevel => {
  const numericValue = numericConfidence(value);

  if (numericValue === null) {
    return "Medium";
  }

  const percentage = numericValue <= 1 ? numericValue * 100 : numericValue;

  if (percentage >= 85) {
    return "High";
  }

  if (percentage >= 60) {
    return "Medium";
  }

  return "Needs review";
};
