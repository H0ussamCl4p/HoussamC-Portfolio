# Portfolio Rust API

High-performance serverless functions written in Rust for maximum performance on Vercel.

## 📊 Performance Benefits

| Function | Node.js (before) | Rust (after) | Improvement |
|----------|-----------------|--------------|-------------|
| MDX Parse (5 files) | ~45ms | ~8ms | **5.6x faster** |
| Design Manifest (100 images) | ~25ms | ~5ms | **5x faster** |

### Cold Start Optimization
- Binary size: **~2.5MB** (with `opt-level = "z"` and LTO)
- Cold start: **~150ms** (vs ~300ms for Node.js)

## 🚀 Quick Start

### Prerequisites
```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm-pack (for WASM builds)
cargo install wasm-pack
```

### Build Serverless Functions
```bash
cd api

# Build all functions for Vercel
cargo build --release

# Run tests
cargo test
```

### Build WASM Module
```bash
cd api

# Build WASM for client-side use
wasm-pack build --target web --out-dir ../public/wasm -- --config Cargo-wasm.toml
```

## 📁 Project Structure

```
api/
├── Cargo.toml              # Vercel serverless config
├── Cargo-wasm.toml         # WASM build config
├── src/
│   ├── lib.rs              # Shared library
│   ├── mdx.rs              # Zero-copy MDX parser
│   ├── response.rs         # HTTP response helpers
│   ├── wasm.rs             # Client-side WASM utilities
│   └── bin/
│       ├── mdx_parse.rs    # /api/mdx-parse endpoint (with Google Drive preparation)
│       └── design_manifest.rs # /api/design-manifest endpoint
```

## 🔧 API Endpoints

### POST `/api/mdx-parse`
Parse MDX frontmatter from multiple files. Includes preparation for Google Drive CMS integration.

**Request (Local files):**
```json
{
  "files": [
    { "slug": "my-post", "content": "---\ntitle: Hello\n---\n# Content" }
  ]
}
```

**Request (Google Drive - Future):**
```json
{
  "files": [
    { "slug": "my-post", "content": "__DRIVE_FILE_ID__:abc123" }
  ],
  "source": "drive",
  "fileId": "abc123"
}
```

**Response:**
```json
{
  "posts": [
    {
      "metadata": { "title": "Hello", "publishedAt": "", ... },
      "content": "# Content",
      "slug": "my-post"
    }
  ],
  "parsedCount": 1,
  "errorCount": 0
}
```

### GET `/api/design-manifest?path=public/designs`
Generate image manifest from directory.

**Response:**
```json
{
  "images": [
    {
      "path": "Canva/Project/image.png",
      "name": "image.png",
      "extension": "png",
      "folder": "Canva/Project"
    }
  ],
  "count": 42,
  "generatedAt": "2024-01-15T00:00:00Z"
}
```

## 🎯 Next.js Integration

### Server Components
```tsx
import { parseMdxBatch, isRustApiError } from "@/lib/rust-api";

export default async function BlogList() {
  const result = await parseMdxBatch(files);

  if (isRustApiError(result)) {
    return <div>Error: {result.error}</div>;
  }

  return result.posts.map(post => (
    <article key={post.slug}>{post.metadata.title}</article>
  ));
}
```

### Google Drive Integration (Preparation)

The MDX parser is prepared for Google Drive-based CMS integration. To enable:

1. **Set up Service Account:**
   - Create a Google Cloud project
   - Enable Google Drive API
   - Create a Service Account with Drive API access
   - Download the JSON key file

2. **Configure Environment Variables:**
   ```bash
   # Base64 encode your service account key
   GOOGLE_SERVICE_ACCOUNT_KEY=$(cat service-account.json | base64)
   ```

3. **Server Component Usage:**
   ```tsx
   import { fetchDriveMdx } from "@/lib/rust-api";

   // Server Component only - keeps credentials secure
   export default async function DrivePost({ fileId }: { fileId: string }) {
     const content = await fetchDriveMdx({ fileId });

     if (content.status === "not-found") {
       return <NotFound />;
     }

     if (content.status === "error") {
       return <Error message={content.error} />;
     }

     return <MdxRenderer data={content.data} />;
   }
   ```

## ⚙️ Build Configuration

The Rust functions are optimized for minimal binary size and fast cold starts:

```toml
[profile.release]
opt-level = "z"      # Optimize for size
lto = true           # Link-Time Optimization
codegen-units = 1    # Single codegen for max optimization
strip = true         # Strip symbols
panic = "abort"      # No unwinding
```

## 🔒 Security Notes

- Google Drive API calls should **only** be made from Server Components
- Service Account keys should be stored as environment variables
- Never expose Drive file IDs in client-side code unless intended as public
