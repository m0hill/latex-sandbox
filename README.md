# LaTeX Compiler API

A serverless Cloudflare Worker that compiles LaTeX documents into PDFs using Tectonic and stores them in Cloudflare R2.

## Features

- **LaTeX Compilation**: Compile LaTeX documents using Tectonic in isolated containers
- **PDF Generation**: Convert LaTeX source code to PDF files
- **Cloud Storage**: Automatically upload compiled PDFs to Cloudflare R2
- **API Authentication**: Secure API with API key authentication
- **Concurrent Processing**: Handle multiple compilation requests simultaneously

## How It Works

The service provides a single POST endpoint that:

1. **Authenticates** requests using an API key
2. **Compiles** LaTeX code using Tectonic in sandboxed containers
3. **Uploads** generated PDFs to Cloudflare R2 storage
4. **Returns** the PDF file directly in the response

## API Usage

### Compile LaTeX Document

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "latex": "\\documentclass{article}\\begin{document}Hello World!\\end{document}"
  }'
```

Returns the compiled PDF file with headers:
- `Content-Type: application/pdf`
- `X-R2-Object-Key: documents/2025-01-06/uuid.pdf` (R2 storage location)

## Setup

1. From the project root, run:
```bash
npm install
npm run build
```

2. Run locally:
```bash
npm run dev
```

The first run will build the Docker container (2-3 minutes). Subsequent runs are much faster.

## Testing

```bash
# Test LaTeX compilation
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "latex": "\\documentclass{article}\\begin{document}Hello World!\\end{document}"
  }' \
  --output document.pdf
```

## Deploy

```bash
npm run deploy
```

After first deployment, wait 2-3 minutes for container provisioning before making requests.

## Environment Variables

Required environment variables (configure in `wrangler.jsonc`):

- `API_KEY`: Authentication key for API access
- `R2_ACCESS_KEY_ID`: Cloudflare R2 access key
- `R2_SECRET_ACCESS_KEY`: Cloudflare R2 secret key
- `R2_ACCOUNT_ID`: Your Cloudflare account ID

## Architecture

- **Cloudflare Workers**: Serverless compute for API endpoints
- **Sandbox SDK**: Isolated containers for LaTeX compilation
- **Tectonic**: Fast LaTeX compiler
- **Cloudflare R2**: Object storage for PDF files
- **Docker**: Container runtime for compilation environment

## Next Steps

See the [Sandbox SDK documentation](https://developers.cloudflare.com/sandbox/) for:

- Advanced command execution and streaming
- Background processes
- Preview URLs for exposed services
- Custom Docker images
