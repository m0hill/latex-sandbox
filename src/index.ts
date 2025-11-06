import { getSandbox, proxyToSandbox } from '@cloudflare/sandbox';
import { AwsClient } from 'aws4fetch';

export { Sandbox } from '@cloudflare/sandbox';

// Define the environment bindings from wrangler.jsonc
type Env = Cloudflare.Env

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // This part is for preview URLs and can be kept for future use
    const proxyResponse = await proxyToSandbox(request, env);
    if (proxyResponse) return proxyResponse;

    if (request.method !== 'POST') {
      return new Response(
        'Please send a POST request with your LaTeX code in a JSON body.',
        { status: 405 }
      );
    }

    try {
      // Enforce API key (query param `api_key` or header `x-api-key`)
      const url = new URL(request.url);
      const providedKey =
        url.searchParams.get('api_key') || request.headers.get('x-api-key');
      if (!providedKey || providedKey !== env.API_KEY) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: invalid API key' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Expect a JSON body with a "latex" string field
      const body: { latex?: string } = await request.json();
      const latexContent = body.latex;

      if (!latexContent || typeof latexContent !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing or invalid "latex" field in JSON body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // ✅ Use pool of sandboxes for concurrency (up to 10 parallel compilations)
      const sandbox = getSandbox(env.Sandbox, `latex-compiler-main`);

      // ✅ Use unique filename to avoid conflicts between concurrent requests
      const uniqueId = crypto.randomUUID();
      const filename = `document-${uniqueId}`;

      try {
        // 1. Write the user's LaTeX code to a .tex file inside the sandbox
        console.log(`Writing file: /workspace/${filename}.tex`);
        await sandbox.writeFile(`/workspace/${filename}.tex`, latexContent);

        // 2. Execute Tectonic to compile the .tex file into a .pdf
        const compileCmd =
          `tectonic -o /workspace --keep-logs ` +
          `--synctex=0 /workspace/${filename}.tex`;

        console.log(`Executing: ${compileCmd}`);
        const result = await sandbox.exec(compileCmd);

        // 3. Check for compilation errors
        if (!result.success) {
          console.error(`Compilation failed for ${filename}`);

          // Try to read log file, but handle if it doesn't exist
          let logContent = 'Log file not available';
          try {
            const logFile = await sandbox.readFile(`/workspace/${filename}.log`);
            logContent = logFile.content;
          } catch (logError) {
            console.error('Could not read log file:', logError);
          }

          const errorResponse = `LaTeX Compilation Failed:\n\n--- STDERR ---\n${result.stderr}\n\n--- LOG FILE ---\n${logContent}`;

          // ✅ Cleanup failed compilation files
          try {
            await sandbox.exec(`rm -f /workspace/${filename}.*`);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }

          return new Response(errorResponse, {
            status: 400,
            headers: { 'Content-Type': 'text/plain' },
          });
        }

        console.log(`Compilation successful for ${filename}`);

        // 4. Generate R2 key for the PDF
        const r2Key = `documents/${new Date()
          .toISOString()
          .slice(0, 10)}/${crypto.randomUUID()}.pdf`;

        console.log(`Generating presigned URL for R2 upload...`);
        
        // 5. Generate presigned URL for direct upload from container
        const aws = new AwsClient({
          accessKeyId: env.R2_ACCESS_KEY_ID!,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
        });

        const uploadUrl = new URL(
          `https://latex-box.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${r2Key}`
        );
        
        uploadUrl.searchParams.set('X-Amz-Expires', '3600');

        const signedRequest = await aws.sign(
          new Request(uploadUrl, {
            method: 'PUT',
          }),
          {
            aws: { signQuery: true },
          }
        );

        const presignedUrl = signedRequest.url;
        console.log(`Generated presigned URL for ${r2Key}`);

        // 6. Upload PDF directly from container to R2 using curl
        // Use single quotes to properly handle URL with query parameters
        const uploadCommand = `curl -v -X PUT -T '/workspace/${filename}.pdf' -H 'Content-Type: application/pdf' '${presignedUrl}' 2>&1`;
        
        console.log(`Uploading PDF directly from container...`);
        const uploadResult = await sandbox.exec(uploadCommand);

        console.log(`Upload result - success: ${uploadResult.success}`);
        console.log(`Upload stdout: ${uploadResult.stdout}`);
        console.log(`Upload stderr: ${uploadResult.stderr}`);

        if (!uploadResult.success) {
          console.error('Direct R2 upload failed:', uploadResult.stderr);
          throw new Error(`Failed to upload PDF to R2: ${uploadResult.stderr}`);
        }

        console.log(`Successfully uploaded to R2: ${r2Key}`);

        // 7. Read the PDF to return in response
        const pdfFile = await sandbox.readFile(`/workspace/${filename}.pdf`);
        const buffer = Buffer.from(pdfFile.content);
        console.log(`PDF size: ${buffer.length} bytes`);

        // 8. Cleanup temporary files (but keep sandbox alive!)
        try {
          await sandbox.exec(`rm -f /workspace/${filename}.*`);
          console.log(`Cleaned up temporary files for ${filename}`);
        } catch (cleanupError) {
          console.error('Cleanup error (non-fatal):', cleanupError);
        }

        // 9. Return the PDF file in the response and include the R2 key
        return new Response(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="document.pdf"',
            'X-R2-Object-Key': r2Key
          },
        });

      } catch (error: any) {
        console.error('Error during compilation:', error);

        // ✅ Cleanup on error
        try {
          await sandbox.exec(`rm -f /workspace/${filename}.*`);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }

        throw error;
      }
      // ✅ REMOVED: No sandbox.destroy() - let it stay warm!

    } catch (error: any) {
      console.error('Request error:', error);

      if (error instanceof SyntaxError) {
        return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error.message,
          stack: error.stack
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  },
};