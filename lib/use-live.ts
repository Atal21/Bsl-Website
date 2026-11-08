"use client";

import { useEffect, useState } from "react";

/**
 * Shows the server-rendered `initial` data immediately (good for SEO and speed), then fetches the
 * public JSON API from the browser and swaps in the fresh data. The request is visible in the
 * browser's Network tab (Fetch/XHR). If the request fails, the initial data simply stays.
 */
export function useLive<T, R = T>(url: string, initial: T, select: (json: R) => T = (j) => j as unknown as T): T {
  const [data, setData] = useState<T>(initial);
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? (r.json() as Promise<R>) : Promise.reject(new Error(String(r.status)))))
      .then((j) => setData(select(j)))
      .catch(() => {});
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
  return data;
}
