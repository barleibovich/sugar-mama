import Tesseract from "tesseract.js";

export interface OcrResult {
  value?: number;
  rawText: string;
}

export async function runOcrOnImage(file: File, onProgress?: (progress: number) => void): Promise<OcrResult> {
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(m.progress);
      }
    },
  });

  const value = extractGlucoseValue(data.text ?? "");
  return { value, rawText: data.text ?? "" };
}

function extractGlucoseValue(text: string): number | undefined {
  const matches = Array.from(text.matchAll(/\d{2,3}/g))
    .map((m) => Number.parseInt(m[0], 10))
    .filter((n) => !Number.isNaN(n));

  const plausible = matches.filter((n) => n >= 40 && n <= 400);
  if (plausible.length) {
    return pickMostCommon(plausible);
  }
  return matches[0];
}

function pickMostCommon(values: number[]): number {
  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  let best = values[0];
  let bestCount = 0;
  counts.forEach((count, value) => {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  });
  return best;
}
