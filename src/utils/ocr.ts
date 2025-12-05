import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

const MODEL_PREFERENCES: Array<{ model: string; apiVersion: "v1" | "v1beta" }> = [
  // Preferred (fast, available on free API keys as of 2025-12)
  { model: "gemini-2.0-flash", apiVersion: "v1beta" },
  { model: "gemini-2.0-flash-001", apiVersion: "v1beta" },
  { model: "gemini-flash-latest", apiVersion: "v1beta" },
  { model: "gemini-flash-lite-latest", apiVersion: "v1beta" },
  // Try v1 as a secondary path
  { model: "gemini-2.0-flash", apiVersion: "v1" },
  { model: "gemini-2.0-flash-001", apiVersion: "v1" },
  { model: "gemini-flash-latest", apiVersion: "v1" },
  { model: "gemini-flash-lite-latest", apiVersion: "v1" },
  // Legacy 1.5 names kept as a final attempt
  { model: "gemini-1.5-flash-latest", apiVersion: "v1beta" },
  { model: "gemini-1.5-flash", apiVersion: "v1beta" },
  { model: "gemini-1.5-flash-latest", apiVersion: "v1" },
  { model: "gemini-1.5-flash", apiVersion: "v1" },
];
const PROMPT =
  "Analyze this image of a glucose meter. Locate the main glucose reading (large digits). Ignore the time (smaller digits like 22:33). Return ONLY the numeric value as a plain integer (e.g., 113). Do not return markdown or json.";

export async function scanWithGemini(imageUri: string, apiKey: string): Promise<number | null> {
  if (!apiKey) {
    return null;
  }

  try {
    const { data, mimeType } = await readImageAsBase64(imageUri);
    if (!data) {
      return null;
    }

    const parts: Part[] = [
      { text: PROMPT },
      {
        inlineData: {
          data,
          mimeType: mimeType ?? "image/jpeg",
        },
      },
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    for (const attempt of MODEL_PREFERENCES) {
      const text = await generateWithModel(genAI, attempt.model, parts, attempt.apiVersion);
      const numericValue = text ? extractNumericValue(text) : null;
      if (numericValue !== null) {
        return numericValue;
      }
    }

    return null;
  } catch (error) {
    console.error("Gemini OCR failed", error);
    return null;
  }
}

function extractNumericValue(output: string): number | null {
  const match = output.match(/\d+/);
  if (!match) return null;
  const value = Number.parseInt(match[0], 10);
  if (Number.isNaN(value)) return null;
  return value;
}

async function readImageAsBase64(imageUri: string): Promise<{ data: string; mimeType: string | null }> {
  const dataUri = parseDataUri(imageUri);
  if (dataUri) {
    return dataUri;
  }

  const expoBase64 = await tryExpoFileSystem(imageUri);
  if (expoBase64) {
    return { data: expoBase64, mimeType: guessMimeType(imageUri) };
  }

  const rnfsBase64 = await tryReactNativeFs(imageUri);
  if (rnfsBase64) {
    return { data: rnfsBase64, mimeType: guessMimeType(imageUri) };
  }

  const response = await fetch(imageUri);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();
  const mimeType = blob.type || guessMimeType(imageUri);
  const arrayBuffer = await blob.arrayBuffer();
  const data = bufferToBase64(arrayBuffer);
  return { data, mimeType };
}

function parseDataUri(uri: string): { data: string; mimeType: string | null } | null {
  if (!uri.startsWith("data:")) return null;
  const [, rest] = uri.split("data:");
  if (!rest) return null;

  const [metadata, encoded] = rest.split(",");
  if (!encoded) return null;

  const [mime] = metadata.split(";base64");
  return { data: encoded, mimeType: mime || null };
}

async function tryExpoFileSystem(imageUri: string): Promise<string | null> {
  const fs = (globalThis as unknown as { FileSystem?: ExpoFileSystemLike; ExpoFileSystem?: ExpoFileSystemLike }).FileSystem
    ?? (globalThis as unknown as { FileSystem?: ExpoFileSystemLike; ExpoFileSystem?: ExpoFileSystemLike }).ExpoFileSystem;

  if (fs?.readAsStringAsync) {
    try {
      return await fs.readAsStringAsync(imageUri, { encoding: "base64" });
    } catch (error) {
      console.warn("Expo file read failed", error);
    }
  }

  return null;
}

async function tryReactNativeFs(imageUri: string): Promise<string | null> {
  const rnfs = (globalThis as unknown as { RNFS?: ReactNativeFsLike; reactNativeFs?: ReactNativeFsLike }).RNFS
    ?? (globalThis as unknown as { RNFS?: ReactNativeFsLike; reactNativeFs?: ReactNativeFsLike }).reactNativeFs;

  if (rnfs?.readFile) {
    try {
      return await rnfs.readFile(imageUri, "base64");
    } catch (error) {
      console.warn("react-native-fs read failed", error);
    }
  }

  return null;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === "function") {
    return btoa(binary);
  }

  throw new Error("No base64 encoder available in this environment.");
}

function guessMimeType(uri: string): string | null {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".bmp")) return "image/bmp";
  if (lower.endsWith(".heic") || lower.endsWith(".heif")) return "image/heic";
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) return "image/jpeg";
  return "image/jpeg";
}

async function generateWithModel(
  genAI: GoogleGenerativeAI,
  modelName: string,
  parts: Part[],
  apiVersion: "v1" | "v1beta"
): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
    const result = await model.generateContent(parts);
    return result.response.text().trim();
  } catch (error) {
    console.warn(`Gemini request failed for ${modelName} (${apiVersion})`, error);
    return null;
  }
}

type ExpoFileSystemLike = {
  readAsStringAsync?: (uri: string, options?: { encoding?: string }) => Promise<string>;
};

type ReactNativeFsLike = {
  readFile?: (path: string, encoding: "base64" | string) => Promise<string>;
};
