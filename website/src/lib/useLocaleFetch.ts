"use client";

import { useLocale } from "next-intl";

/**
 * Hook that returns a fetch function with automatic locale parameter.
 * Usage: const fetchWithLocale = useLocaleFetch();
 *        fetchWithLocale("/api/homepage").then(...)
 */
export function useLocaleFetch() {
  const locale = useLocale();

  return (url: string, options?: RequestInit) => {
    const separator = url.includes("?") ? "&" : "?";
    const localizedUrl = `${url}${separator}locale=${locale}`;
    return fetch(localizedUrl, options);
  };
}

/**
 * Append locale parameter to a URL string.
 */
export function appendLocale(url: string, locale: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}locale=${locale}`;
}
