"use client";

/**
 * React hook for loading and using WASM utilities
 *
 * This hook lazily loads the WASM module on first use, providing
 * high-performance client-side text processing functions.
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const { wasm, loading, error } = useWasm();
 *
 *   const handleSearch = (query: string, items: string[]) => {
 *     if (!wasm) return items;
 *     return items.filter(item => wasm.fuzzy_match(item, query) !== undefined);
 *   };
 * }
 * ```
 */

import { useState, useEffect, useCallback } from "react";

// WASM module interface (matches wasm.rs exports)
interface WasmModule {
  slugify(text: string): string;
  fuzzy_match(text: string, pattern: string): number[] | undefined;
  reading_time(content: string): number;
  extract_text(mdx: string): string;
}

interface UseWasmResult {
  wasm: WasmModule | null;
  loading: boolean;
  error: Error | null;
}

// Singleton promise to prevent multiple loads
let wasmPromise: Promise<WasmModule> | null = null;

async function loadWasm(): Promise<WasmModule> {
  if (wasmPromise) return wasmPromise;

  wasmPromise = (async () => {
    try {
      // Dynamic import of WASM module from public folder
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wasm = await (import("/wasm/portfolio_wasm.js" as any) as Promise<any>);
      await wasm.default(); // Initialize WASM
      return wasm as WasmModule;
    } catch (error) {
      wasmPromise = null; // Reset on error to allow retry
      throw error;
    }
  })();

  return wasmPromise;
}

export function useWasm(): UseWasmResult {
  const [wasm, setWasm] = useState<WasmModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    loadWasm()
      .then((module) => {
        if (mounted) {
          setWasm(module);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { wasm, loading, error };
}

/**
 * Standalone slugify function with WASM fallback to JS
 * Safe to use even if WASM fails to load
 */
export function slugifyWithFallback(text: string, wasmModule?: WasmModule | null): string {
  if (wasmModule) {
    try {
      return wasmModule.slugify(text);
    } catch {
      // Fall through to JS implementation
    }
  }

  // JavaScript fallback (same algorithm as Rust)
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Calculate reading time with WASM fallback to JS
 */
export function readingTimeWithFallback(
  content: string,
  wasmModule?: WasmModule | null
): number {
  if (wasmModule) {
    try {
      return wasmModule.reading_time(content);
    } catch {
      // Fall through to JS implementation
    }
  }

  // JavaScript fallback
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
