export type JsonValidation = {
  valid: boolean;
  message: string;
};

const lineColumnFromPosition = (value: string, position: number) => {
  const before = value.slice(0, position);
  const lines = before.split("\n");

  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
};

export const validateJson = (value: string): JsonValidation => {
  if (!value.trim()) {
    return { valid: false, message: "Invalid JSON: schema_sample is required." };
  }

  try {
    JSON.parse(value);
    return { valid: true, message: "Valid JSON." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";
    const positionMatch = message.match(/position (\d+)/i);

    if (positionMatch) {
      const { line, column } = lineColumnFromPosition(value, Number(positionMatch[1]));
      return { valid: false, message: `Invalid JSON near line ${line}, column ${column}.` };
    }

    return { valid: false, message: `Invalid JSON: ${message}` };
  }
};

export const formatJson = (value: string) => JSON.stringify(JSON.parse(value), null, 2);
