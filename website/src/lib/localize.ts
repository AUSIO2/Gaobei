/**
 * Recursively localize a JSON object based on locale.
 * When locale is "en", for each key "xxx" with a corresponding "xxxEn",
 * replace the value of "xxx" with "xxxEn" and remove the "xxxEn" key.
 * When locale is "zh" (default), simply remove all "xxxEn" keys.
 */
export function localizeData<T>(data: T, locale: string): T {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => localizeData(item, locale)) as T;
  }

  const result: Record<string, any> = {};
  const obj = data as Record<string, any>;
  const enKeys = new Set<string>();

  // First pass: identify all "xxxEn" keys
  for (const key of Object.keys(obj)) {
    if (key.endsWith("En") && key.length > 2) {
      enKeys.add(key);
    }
  }

  // Second pass: build result
  for (const key of Object.keys(obj)) {
    const enKey = key + "En";
    if (enKeys.has(enKey) && locale === "en") {
      // Use the English value
      result[key] = localizeData(obj[enKey], locale);
    } else {
      // Use the original value (and recurse)
      result[key] = localizeData(obj[key], locale);
    }
  }

  return result as T;
}

/**
 * Extract locale from URL search params, defaulting to "zh".
 */
export function getLocaleFromRequest(request: Request): string {
  const { searchParams } = new URL(request.url);
  return searchParams.get("locale") || "zh";
}
