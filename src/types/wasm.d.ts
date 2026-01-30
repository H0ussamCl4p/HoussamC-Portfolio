/**
 * WASM module type declarations
 * 
 * This declares the module path for the WASM build output.
 * Build the WASM module with: cd api && wasm-pack build --target web --out-dir ../public/wasm
 */

declare module "/wasm/portfolio_wasm.js" {
  export function slugify(text: string): string;
  export function fuzzy_match(text: string, pattern: string): number[] | undefined;
  export function reading_time(content: string): number;
  export function extract_text(mdx: string): string;
  export default function init(): Promise<void>;
}
