---
title: Getting started · Cloudflare Sandbox SDK docs
description: Build your first application with Sandbox SDK - a secure code
  execution environment. In this guide, you'll create a Worker that can execute
  Python code and work with files in isolated containers.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/get-started/
  md: https://developers.cloudflare.com/sandbox/get-started/index.md
---

Build your first application with Sandbox SDK - a secure code execution environment. In this guide, you'll create a Worker that can execute Python code and work with files in isolated containers.

What you're building

A simple API that can safely execute Python code and perform file operations in isolated sandbox environments.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

### Ensure Docker is running locally

Sandbox SDK uses [Docker](https://www.docker.com/) to build container images alongside your Worker. Docker must be running when you deploy or run locally.

Install Docker by following the [Docker Desktop installation guide](https://docs.docker.com/desktop/).

Verify Docker is running:

```sh
docker info
```

If Docker is not running, this command will hang or return "Cannot connect to the Docker daemon".

## 1. Create a new project

Create a new Sandbox SDK project:

* npm

  ```sh
  npm create cloudflare@latest -- my-sandbox --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* yarn

  ```sh
  yarn create cloudflare my-sandbox --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest my-sandbox --template=cloudflare/sandbox-sdk/examples/minimal
  ```

This creates a `my-sandbox` directory with everything you need:

* `src/index.ts` - Worker with sandbox integration
* `wrangler.jsonc` - Configuration for Workers and Containers
* `Dockerfile` - Container environment definition

```sh
cd my-sandbox
```

## 2. Explore the template

The template provides a minimal Worker that demonstrates core sandbox capabilities:

```typescript
import { getSandbox, proxyToSandbox, type Sandbox } from '@cloudflare/sandbox';


export { Sandbox } from '@cloudflare/sandbox';


type Env = {
  Sandbox: DurableObjectNamespace<Sandbox>;
};


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Required for preview URLs (if you expose ports later)
    const proxyResponse = await proxyToSandbox(request, env);
    if (proxyResponse) return proxyResponse;


    const url = new URL(request.url);


    // Get or create a sandbox instance
    const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


    // Execute Python code
    if (url.pathname === '/run') {
      const result = await sandbox.exec('python -c "print(2 + 2)"');
      return Response.json({
        output: result.stdout,
        success: result.success
      });
    }


    // Work with files
    if (url.pathname === '/file') {
      await sandbox.writeFile('/workspace/hello.txt', 'Hello, Sandbox!');
      const file = await sandbox.readFile('/workspace/hello.txt');
      return Response.json({
        content: file.content
      });
    }


    return new Response('Try /run or /file');
  },
};
```

**Key concepts**:

* `getSandbox()` - Gets or creates a sandbox instance by ID
* `proxyToSandbox()` - Required at the top for preview URLs to work
* `sandbox.exec()` - Execute commands and capture output
* `sandbox.writeFile()` / `readFile()` - File operations

## 3. Test locally

Start the development server:

```sh
npm run dev
```

Note

First run builds the Docker container (2-3 minutes). Subsequent runs are much faster due to caching.

Test the endpoints:

```sh
# Execute Python code
curl http://localhost:8787/run


# File operations
curl http://localhost:8787/file
```

You should see JSON responses with the command output and file contents.

## 4. Deploy to production

Deploy your Worker and container:

```sh
npx wrangler deploy
```

This will:

1. Build your container image using Docker
2. Push it to Cloudflare's Container Registry
3. Deploy your Worker globally

Wait for provisioning

After first deployment, wait 2-3 minutes before making requests. The Worker deploys immediately, but the container needs time to provision.

Check deployment status:

```sh
npx wrangler containers list
```

## 5. Test your deployment

Visit your Worker URL (shown in deploy output):

```sh
# Replace with your actual URL
curl https://my-sandbox.YOUR_SUBDOMAIN.workers.dev/run
```

Your sandbox is now deployed.

## Understanding the configuration

Your `wrangler.jsonc` connects three pieces together:

* wrangler.jsonc

  ```jsonc
  {
    "containers": [
      {
        "class_name": "Sandbox",
        "image": "./Dockerfile"
      }
    ],
    "durable_objects": {
      "bindings": [
        {
          "class_name": "Sandbox",
          "name": "Sandbox"
        }
      ]
    },
    "migrations": [
      {
        "new_sqlite_classes": ["Sandbox"],
        "tag": "v1"
      }
    ]
  }
  ```

* wrangler.toml

  ```toml
  [[containers]]
  class_name = "Sandbox"
  image = "./Dockerfile"


  [[durable_objects.bindings]]
  class_name = "Sandbox"
  name = "Sandbox"


  [[migrations]]
  new_sqlite_classes = [ "Sandbox" ]
  tag = "v1"
  ```

- **containers** - Your Dockerfile defines the execution environment
- **durable\_objects** - Makes the `Sandbox` binding available in your Worker
- **migrations** - Initializes Durable Object storage (required once)

For detailed configuration options including environment variables, secrets, and custom images, see the [Wrangler configuration reference](https://developers.cloudflare.com/sandbox/configuration/wrangler/).

## Next steps

Now that you have a working sandbox, explore more capabilities:

* [Execute commands](https://developers.cloudflare.com/sandbox/guides/execute-commands/) - Run shell commands and stream output
* [Manage files](https://developers.cloudflare.com/sandbox/guides/manage-files/) - Work with files and directories
* [Expose services](https://developers.cloudflare.com/sandbox/guides/expose-services/) - Get public URLs for services running in your sandbox
* [API reference](https://developers.cloudflare.com/sandbox/api/) - Complete API documentation


---
title: Tutorials · Cloudflare Sandbox SDK docs
description: Learn how to build applications with Sandbox SDK through
  step-by-step tutorials. Each tutorial takes 20-30 minutes.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/tutorials/
  md: https://developers.cloudflare.com/sandbox/tutorials/index.md
---

Learn how to build applications with Sandbox SDK through step-by-step tutorials. Each tutorial takes 20-30 minutes.

[AI code executor](https://developers.cloudflare.com/sandbox/tutorials/ai-code-executor/)

Use Claude to generate Python code from natural language and execute it securely in sandboxes.

[Analyze data with AI](https://developers.cloudflare.com/sandbox/tutorials/analyze-data-with-ai/)

Upload CSV files, generate analysis code with Claude, and return visualizations.

[Code review bot](https://developers.cloudflare.com/sandbox/tutorials/code-review-bot/)

Clone repositories, analyze code with Claude, and post review comments to GitHub PRs.

[Automated testing pipeline](https://developers.cloudflare.com/sandbox/tutorials/automated-testing-pipeline/)

Clone repositories, install dependencies, run tests, and report results.

## What you'll learn

These tutorials cover real-world applications:

* **AI Code Execution** - Integrate Claude with secure code execution
* **Data Analysis** - Generate and run analysis code on uploaded datasets
* **Code Review Automation** - Clone repositories and analyze code changes
* **CI/CD Pipelines** - Automated testing workflows
* **File Operations** - Work with files and directories
* **Error Handling** - Validation and error management
* **Deployment** - Deploy Workers with containers

## Before you start

All tutorials assume you have:

* Completed the [Get Started guide](https://developers.cloudflare.com/sandbox/get-started/)
* Basic familiarity with [Workers](https://developers.cloudflare.com/workers/)
* [Docker](https://www.docker.com/) installed and running

## Related resources

* [How-to guides](https://developers.cloudflare.com/sandbox/guides/) - Solve specific problems
* [API reference](https://developers.cloudflare.com/sandbox/api/) - Complete SDK reference


---
title: Build an AI code executor · Cloudflare Sandbox SDK docs
description: Build an AI-powered code execution system using Sandbox SDK and
  Claude. Turn natural language questions into Python code, execute it securely,
  and return results.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/tutorials/ai-code-executor/
  md: https://developers.cloudflare.com/sandbox/tutorials/ai-code-executor/index.md
---

Build an AI-powered code execution system using Sandbox SDK and Claude. Turn natural language questions into Python code, execute it securely, and return results.

**Time to complete:** 20 minutes

## What you'll build

An API that accepts questions like "What's the 100th Fibonacci number?", uses Claude to generate Python code, executes it in an isolated sandbox, and returns the results.

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

You'll also need:

* An [Anthropic API key](https://console.anthropic.com/) for Claude
* [Docker](https://www.docker.com/) running locally

## 1. Create your project

Create a new Sandbox SDK project:

* npm

  ```sh
  npm create cloudflare@latest -- ai-code-executor --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* yarn

  ```sh
  yarn create cloudflare ai-code-executor --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest ai-code-executor --template=cloudflare/sandbox-sdk/examples/minimal
  ```

```sh
cd ai-code-executor
```

## 2. Install dependencies

Install the Anthropic SDK:

* npm

  ```sh
  npm i @anthropic-ai/sdk
  ```

* yarn

  ```sh
  yarn add @anthropic-ai/sdk
  ```

* pnpm

  ```sh
  pnpm add @anthropic-ai/sdk
  ```

## 3. Build your code executor

Replace the contents of `src/index.ts`:

```typescript
import { getSandbox, type Sandbox } from '@cloudflare/sandbox';
import Anthropic from '@anthropic-ai/sdk';


export { Sandbox } from '@cloudflare/sandbox';


interface Env {
  Sandbox: DurableObjectNamespace<Sandbox>;
  ANTHROPIC_API_KEY: string;
}


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST' || new URL(request.url).pathname !== '/execute') {
      return new Response('POST /execute with { "question": "your question" }');
    }


    try {
      const { question } = await request.json();


      if (!question) {
        return Response.json({ error: 'Question is required' }, { status: 400 });
      }


      // Use Claude to generate Python code
      const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
      const codeGeneration = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Generate Python code to answer: "${question}"


Requirements:
- Use only Python standard library
- Print the result using print()
- Keep code simple and safe


Return ONLY the code, no explanations.`
        }],
      });


      const generatedCode = codeGeneration.content[0]?.type === 'text'
        ? codeGeneration.content[0].text
        : '';


      if (!generatedCode) {
        return Response.json({ error: 'Failed to generate code' }, { status: 500 });
      }


      // Execute the code in a sandbox
      const sandbox = getSandbox(env.Sandbox, 'demo-user');
      await sandbox.writeFile('/tmp/code.py', generatedCode);
      const result = await sandbox.exec('python /tmp/code.py');


      return Response.json({
        success: result.success,
        question,
        code: generatedCode,
        output: result.stdout,
        error: result.stderr
      });


    } catch (error: any) {
      return Response.json(
        { error: 'Internal server error', message: error.message },
        { status: 500 }
      );
    }
  },
};
```

**How it works:**

1. Receives a question via POST to `/execute`
2. Uses Claude to generate Python code
3. Writes code to `/tmp/code.py` in the sandbox
4. Executes with `sandbox.exec('python /tmp/code.py')`
5. Returns both the code and execution results

## 4. Set your Anthropic API key

Store your Anthropic API key as a secret:

```sh
npx wrangler secret put ANTHROPIC_API_KEY
```

Paste your API key from the [Anthropic Console](https://console.anthropic.com/) when prompted.

## 5. Test locally

Start the development server:

```sh
npm run dev
```

Note

First run builds the Docker container (2-3 minutes). Subsequent runs are much faster.

Test with curl:

```sh
curl -X POST http://localhost:8787/execute \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the 10th Fibonacci number?"}'
```

Response:

```json
{
  "success": true,
  "question": "What is the 10th Fibonacci number?",
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))",
  "output": "55\n",
  "error": ""
}
```

## 6. Deploy

Deploy your Worker:

```sh
npx wrangler deploy
```

Warning

After first deployment, wait 2-3 minutes for container provisioning. Check status with `npx wrangler containers list`.

## 7. Test your deployment

Try different questions:

```sh
# Factorial
curl -X POST https://ai-code-executor.YOUR_SUBDOMAIN.workers.dev/execute \
  -H "Content-Type: application/json" \
  -d '{"question": "Calculate the factorial of 5"}'


# Statistics
curl -X POST https://ai-code-executor.YOUR_SUBDOMAIN.workers.dev/execute \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the mean of [10, 20, 30, 40, 50]?"}'


# String manipulation
curl -X POST https://ai-code-executor.YOUR_SUBDOMAIN.workers.dev/execute \
  -H "Content-Type: application/json" \
  -d '{"question": "Reverse the string \"Hello World\""}'
```

## What you built

You created an AI code execution system that:

* Accepts natural language questions
* Generates Python code with Claude
* Executes code securely in isolated sandboxes
* Returns results with error handling

## Next steps

* [Analyze data with AI](https://developers.cloudflare.com/sandbox/tutorials/analyze-data-with-ai/) - Add pandas and matplotlib for data analysis
* [Code Interpreter API](https://developers.cloudflare.com/sandbox/api/interpreter/) - Use the built-in code interpreter instead of exec
* [Streaming output](https://developers.cloudflare.com/sandbox/guides/streaming-output/) - Show real-time execution progress
* [API reference](https://developers.cloudflare.com/sandbox/api/) - Explore all available methods

## Related resources

* [Anthropic Claude documentation](https://docs.anthropic.com/)
* [Workers AI](https://developers.cloudflare.com/workers-ai/) - Use Cloudflare's built-in models


---
title: Analyze data with AI · Cloudflare Sandbox SDK docs
description: Build an AI-powered data analysis system that accepts CSV uploads,
  uses Claude to generate Python analysis code, executes it in sandboxes, and
  returns visualizations.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/tutorials/analyze-data-with-ai/
  md: https://developers.cloudflare.com/sandbox/tutorials/analyze-data-with-ai/index.md
---

Build an AI-powered data analysis system that accepts CSV uploads, uses Claude to generate Python analysis code, executes it in sandboxes, and returns visualizations.

**Time to complete**: 25 minutes

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

You'll also need:

* An [Anthropic API key](https://console.anthropic.com/) for Claude
* [Docker](https://www.docker.com/) running locally

## 1. Create your project

Create a new Sandbox SDK project:

* npm

  ```sh
  npm create cloudflare@latest -- analyze-data --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* yarn

  ```sh
  yarn create cloudflare analyze-data --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest analyze-data --template=cloudflare/sandbox-sdk/examples/minimal
  ```

```sh
cd analyze-data
```

## 2. Install dependencies

* npm

  ```sh
  npm i @anthropic-ai/sdk
  ```

* yarn

  ```sh
  yarn add @anthropic-ai/sdk
  ```

* pnpm

  ```sh
  pnpm add @anthropic-ai/sdk
  ```

## 3. Build the analysis handler

Replace `src/index.ts`:

```typescript
import { getSandbox, proxyToSandbox, type Sandbox } from '@cloudflare/sandbox';
import Anthropic from '@anthropic-ai/sdk';


export { Sandbox } from '@cloudflare/sandbox';


interface Env {
  Sandbox: DurableObjectNamespace<Sandbox>;
  ANTHROPIC_API_KEY: string;
}


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const proxyResponse = await proxyToSandbox(request, env);
    if (proxyResponse) return proxyResponse;


    if (request.method !== 'POST') {
      return Response.json({ error: 'POST CSV file and question' }, { status: 405 });
    }


    try {
      const formData = await request.formData();
      const csvFile = formData.get('file') as File;
      const question = formData.get('question') as string;


      if (!csvFile || !question) {
        return Response.json({ error: 'Missing file or question' }, { status: 400 });
      }


      // Upload CSV to sandbox
      const sandbox = getSandbox(env.Sandbox, `analysis-${Date.now()}`);
      const csvPath = '/workspace/data.csv';
      await sandbox.writeFile(csvPath, new Uint8Array(await csvFile.arrayBuffer()));


      // Analyze CSV structure
      const structure = await sandbox.exec(
        `python -c "import pandas as pd; df = pd.read_csv('${csvPath}'); print(f'Rows: {len(df)}'); print(f'Columns: {list(df.columns)[:5]}')"`
      );


      if (!structure.success) {
        return Response.json({ error: 'Failed to read CSV', details: structure.stderr }, { status: 400 });
      }


      // Generate analysis code with Claude
      const code = await generateAnalysisCode(env.ANTHROPIC_API_KEY, csvPath, question, structure.stdout);


      // Write and execute the analysis code
      await sandbox.writeFile('/workspace/analyze.py', code);
      const result = await sandbox.exec('python /workspace/analyze.py');


      if (!result.success) {
        return Response.json({ error: 'Analysis failed', details: result.stderr }, { status: 500 });
      }


      // Check for generated chart
      let chart = null;
      try {
        const chartFile = await sandbox.readFile('/workspace/chart.png');
        const buffer = new Uint8Array(chartFile.content);
        chart = `data:image/png;base64,${btoa(String.fromCharCode(...buffer))}`;
      } catch {
        // No chart generated
      }


      await sandbox.destroy();


      return Response.json({
        success: true,
        output: result.stdout,
        chart,
        code
      });


    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
};


async function generateAnalysisCode(
  apiKey: string,
  csvPath: string,
  question: string,
  csvStructure: string
): Promise<string> {
  const anthropic = new Anthropic({ apiKey });


  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `CSV at ${csvPath}:
${csvStructure}


Question: "${question}"


Generate Python code that:
- Reads CSV with pandas
- Answers the question
- Saves charts to /workspace/chart.png if helpful
- Prints findings to stdout


Use pandas, numpy, matplotlib.`
    }],
    tools: [{
      name: 'generate_python_code',
      description: 'Generate Python code for data analysis',
      input_schema: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Complete Python code' }
        },
        required: ['code']
      }
    }]
  });


  for (const block of response.content) {
    if (block.type === 'tool_use' && block.name === 'generate_python_code') {
      return (block.input as { code: string }).code;
    }
  }


  throw new Error('Failed to generate code');
}
```

## 4. Set your API key

```sh
npx wrangler secret put ANTHROPIC_API_KEY
```

## 5. Test locally

Download a sample CSV:

```sh
# Create a test CSV
echo "year,rating,title
2020,8.5,Movie A
2021,7.2,Movie B
2022,9.1,Movie C" > test.csv
```

Start the dev server:

```sh
npm run dev
```

Test with curl:

```sh
curl -X POST http://localhost:8787 \
  -F "file=@test.csv" \
  -F "question=What is the average rating by year?"
```

Response:

```json
{
  "success": true,
  "output": "Average ratings by year:\n2020: 8.5\n2021: 7.2\n2022: 9.1",
  "chart": "data:image/png;base64,...",
  "code": "import pandas as pd\nimport matplotlib.pyplot as plt\n..."
}
```

## 6. Deploy

```sh
npx wrangler deploy
```

Warning

Wait 2-3 minutes after first deployment for container provisioning.

## What you built

An AI data analysis system that:

* Uploads CSV files to sandboxes
* Uses Claude's tool calling to generate analysis code
* Executes Python with pandas and matplotlib
* Returns text output and visualizations

## Next steps

* [Code Interpreter API](https://developers.cloudflare.com/sandbox/api/interpreter/) - Use the built-in code interpreter
* [File operations](https://developers.cloudflare.com/sandbox/guides/manage-files/) - Advanced file handling
* [Streaming output](https://developers.cloudflare.com/sandbox/guides/streaming-output/) - Real-time progress updates


---
title: Build a code review bot · Cloudflare Sandbox SDK docs
description: Build a GitHub bot that responds to pull requests, clones the
  repository in a sandbox, uses Claude to analyze code changes, and posts review
  comments.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/tutorials/code-review-bot/
  md: https://developers.cloudflare.com/sandbox/tutorials/code-review-bot/index.md
---

Build a GitHub bot that responds to pull requests, clones the repository in a sandbox, uses Claude to analyze code changes, and posts review comments.

**Time to complete**: 30 minutes

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

You'll also need:

* A [GitHub account](https://github.com/) and personal access token with repo permissions
* An [Anthropic API key](https://console.anthropic.com/) for Claude
* A GitHub repository for testing

## 1. Create your project

* npm

  ```sh
  npm create cloudflare@latest -- code-review-bot --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* yarn

  ```sh
  yarn create cloudflare code-review-bot --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest code-review-bot --template=cloudflare/sandbox-sdk/examples/minimal
  ```

```sh
cd code-review-bot
```

## 2. Install dependencies

* npm

  ```sh
  npm i @anthropic-ai/sdk @octokit/rest
  ```

* yarn

  ```sh
  yarn add @anthropic-ai/sdk @octokit/rest
  ```

* pnpm

  ```sh
  pnpm add @anthropic-ai/sdk @octokit/rest
  ```

## 3. Build the webhook handler

Replace `src/index.ts`:

```typescript
import { getSandbox, proxyToSandbox, type Sandbox } from '@cloudflare/sandbox';
import { Octokit } from '@octokit/rest';
import Anthropic from '@anthropic-ai/sdk';


export { Sandbox } from '@cloudflare/sandbox';


interface Env {
  Sandbox: DurableObjectNamespace<Sandbox>;
  GITHUB_TOKEN: string;
  ANTHROPIC_API_KEY: string;
  WEBHOOK_SECRET: string;
}


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const proxyResponse = await proxyToSandbox(request, env);
    if (proxyResponse) return proxyResponse;


    const url = new URL(request.url);


    if (url.pathname === '/webhook' && request.method === 'POST') {
      const signature = request.headers.get('x-hub-signature-256');
      const body = await request.text();


      // Verify webhook signature
      if (!signature || !(await verifySignature(body, signature, env.WEBHOOK_SECRET))) {
        return Response.json({ error: 'Invalid signature' }, { status: 401 });
      }


      const event = request.headers.get('x-github-event');
      const payload = JSON.parse(body);


      // Only handle opened PRs
      if (event === 'pull_request' && payload.action === 'opened') {
        reviewPullRequest(payload, env).catch(console.error);
        return Response.json({ message: 'Review started' });
      }


      return Response.json({ message: 'Event ignored' });
    }


    return new Response('Code Review Bot\n\nConfigure GitHub webhook to POST /webhook');
  },
};


async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );


  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = 'sha256=' + Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');


  return signature === expected;
}


async function reviewPullRequest(payload: any, env: Env): Promise<void> {
  const pr = payload.pull_request;
  const repo = payload.repository;
  const octokit = new Octokit({ auth: env.GITHUB_TOKEN });


  // Post initial comment
  await octokit.issues.createComment({
    owner: repo.owner.login,
    repo: repo.name,
    issue_number: pr.number,
    body: 'Code review in progress...'
  });


  const sandbox = getSandbox(env.Sandbox, `review-${pr.number}`);


  try {
    // Clone repository
    const cloneUrl = `https://${env.GITHUB_TOKEN}@github.com/${repo.owner.login}/${repo.name}.git`;
    await sandbox.exec(`git clone --depth=1 --branch=${pr.head.ref} ${cloneUrl} /workspace/repo`);


    // Get changed files
    const comparison = await octokit.repos.compareCommits({
      owner: repo.owner.login,
      repo: repo.name,
      base: pr.base.sha,
      head: pr.head.sha
    });


    const files = [];
    for (const file of (comparison.data.files || []).slice(0, 5)) {
      if (file.status !== 'removed') {
        const content = await sandbox.readFile(`/workspace/repo/${file.filename}`);
        files.push({
          path: file.filename,
          patch: file.patch || '',
          content: content.content
        });
      }
    }


    // Generate review with Claude
    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: `Review this PR:


Title: ${pr.title}


Changed files:
${files.map(f => `File: ${f.path}\nDiff:\n${f.patch}\n\nContent:\n${f.content.substring(0, 1000)}`).join('\n\n')}


Provide a brief code review focusing on bugs, security, and best practices.`
      }]
    });


    const review = response.content[0]?.type === 'text' ? response.content[0].text : 'No review generated';


    // Post review comment
    await octokit.issues.createComment({
      owner: repo.owner.login,
      repo: repo.name,
      issue_number: pr.number,
      body: `## Code Review\n\n${review}\n\n---\n*Generated by Claude*`
    });


  } catch (error: any) {
    await octokit.issues.createComment({
      owner: repo.owner.login,
      repo: repo.name,
      issue_number: pr.number,
      body: `Review failed: ${error.message}`
    });
  } finally {
    await sandbox.destroy();
  }
}
```

## 4. Set your secrets

```sh
# GitHub token (needs repo permissions)
npx wrangler secret put GITHUB_TOKEN


# Anthropic API key
npx wrangler secret put ANTHROPIC_API_KEY


# Webhook secret (generate a random string)
npx wrangler secret put WEBHOOK_SECRET
```

## 5. Deploy

```sh
npx wrangler deploy
```

## 6. Configure GitHub webhook

1. Go to your repository **Settings** > **Webhooks** > **Add webhook**
2. Set **Payload URL**: `https://code-review-bot.YOUR_SUBDOMAIN.workers.dev/webhook`
3. Set **Content type**: `application/json`
4. Set **Secret**: Same value you used for `WEBHOOK_SECRET`
5. Select **Let me select individual events** → Check **Pull requests**
6. Click **Add webhook**

## 7. Test with a pull request

Create a test PR:

```sh
git checkout -b test-review
echo "console.log('test');" > test.js
git add test.js
git commit -m "Add test file"
git push origin test-review
```

Open the PR on GitHub and watch for the bot's review comment!

## What you built

A GitHub code review bot that:

* Receives webhook events from GitHub
* Clones repositories in isolated sandboxes
* Uses Claude to analyze code changes
* Posts review comments automatically

## Next steps

* [Git operations](https://developers.cloudflare.com/sandbox/api/files/#gitcheckout) - Advanced repository handling
* [Sessions API](https://developers.cloudflare.com/sandbox/api/sessions/) - Manage long-running sandbox operations
* [GitHub Apps](https://docs.github.com/en/apps) - Build a proper GitHub App


---
title: Automated testing pipeline · Cloudflare Sandbox SDK docs
description: Build a testing pipeline that clones Git repositories, installs
  dependencies, runs tests, and reports results.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/tutorials/automated-testing-pipeline/
  md: https://developers.cloudflare.com/sandbox/tutorials/automated-testing-pipeline/index.md
---

Build a testing pipeline that clones Git repositories, installs dependencies, runs tests, and reports results.

**Time to complete**: 25 minutes

## Prerequisites

1. Sign up for a [Cloudflare account](https://dash.cloudflare.com/sign-up/workers-and-pages).
2. Install [`Node.js`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Node.js version manager

Use a Node version manager like [Volta](https://volta.sh/) or [nvm](https://github.com/nvm-sh/nvm) to avoid permission issues and change Node.js versions. [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/), discussed later in this guide, requires a Node version of `16.17.0` or later.

You'll also need a GitHub repository with tests (public or private with access token).

## 1. Create your project

* npm

  ```sh
  npm create cloudflare@latest -- test-pipeline --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* yarn

  ```sh
  yarn create cloudflare test-pipeline --template=cloudflare/sandbox-sdk/examples/minimal
  ```

* pnpm

  ```sh
  pnpm create cloudflare@latest test-pipeline --template=cloudflare/sandbox-sdk/examples/minimal
  ```

```sh
cd test-pipeline
```

## 2. Build the pipeline

Replace `src/index.ts`:

```typescript
import { getSandbox, proxyToSandbox, type Sandbox } from '@cloudflare/sandbox';


export { Sandbox } from '@cloudflare/sandbox';


interface Env {
  Sandbox: DurableObjectNamespace<Sandbox>;
  GITHUB_TOKEN?: string;
}


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const proxyResponse = await proxyToSandbox(request, env);
    if (proxyResponse) return proxyResponse;


    if (request.method !== 'POST') {
      return new Response('POST { "repoUrl": "https://github.com/owner/repo", "branch": "main" }');
    }


    try {
      const { repoUrl, branch = 'main' } = await request.json();


      if (!repoUrl) {
        return Response.json({ error: 'repoUrl required' }, { status: 400 });
      }


      const sandbox = getSandbox(env.Sandbox, `test-${Date.now()}`);


      try {
        // Clone repository
        let cloneUrl = repoUrl;
        if (env.GITHUB_TOKEN && repoUrl.includes('github.com')) {
          cloneUrl = repoUrl.replace('https://', `https://${env.GITHUB_TOKEN}@`);
        }


        await sandbox.exec(`git clone --depth=1 --branch=${branch} ${cloneUrl} /workspace/repo`);


        // Detect project type
        const projectType = await detectProjectType(sandbox);


        // Install dependencies
        const installCmd = getInstallCommand(projectType);
        if (installCmd) {
          const installResult = await sandbox.exec(`cd /workspace/repo && ${installCmd}`);
          if (!installResult.success) {
            return Response.json({
              success: false,
              error: 'Install failed',
              output: installResult.stderr
            });
          }
        }


        // Run tests
        const testCmd = getTestCommand(projectType);
        const testResult = await sandbox.exec(`cd /workspace/repo && ${testCmd}`);


        return Response.json({
          success: testResult.exitCode === 0,
          exitCode: testResult.exitCode,
          output: testResult.stdout,
          errors: testResult.stderr,
          projectType
        });


      } finally {
        await sandbox.destroy();
      }


    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  },
};


async function detectProjectType(sandbox: any): Promise<string> {
  try {
    await sandbox.readFile('/workspace/repo/package.json');
    return 'nodejs';
  } catch {}


  try {
    await sandbox.readFile('/workspace/repo/requirements.txt');
    return 'python';
  } catch {}


  try {
    await sandbox.readFile('/workspace/repo/go.mod');
    return 'go';
  } catch {}


  return 'unknown';
}


function getInstallCommand(projectType: string): string {
  switch (projectType) {
    case 'nodejs': return 'npm install';
    case 'python': return 'pip install -r requirements.txt || pip install -e .';
    case 'go': return 'go mod download';
    default: return '';
  }
}


function getTestCommand(projectType: string): string {
  switch (projectType) {
    case 'nodejs': return 'npm test';
    case 'python': return 'python -m pytest || python -m unittest discover';
    case 'go': return 'go test ./...';
    default: return 'echo "Unknown project type"';
  }
}
```

## 3. Test locally

Start the dev server:

```sh
npm run dev
```

Test with a repository:

```sh
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/sindresorhus/is-promise",
    "branch": "main"
  }'
```

Response:

```json
{
  "success": true,
  "exitCode": 0,
  "output": "...test output...",
  "projectType": "nodejs"
}
```

## 4. Deploy

```sh
npx wrangler deploy
```

For private repositories, set your GitHub token:

```sh
npx wrangler secret put GITHUB_TOKEN
```

## What you built

An automated testing pipeline that:

* Clones Git repositories
* Detects project type (Node.js, Python, Go)
* Installs dependencies automatically
* Runs tests and reports results

## Next steps

* [Streaming output](https://developers.cloudflare.com/sandbox/guides/streaming-output/) - Add real-time test output
* [Background processes](https://developers.cloudflare.com/sandbox/guides/background-processes/) - Handle long-running tests
* [Sessions API](https://developers.cloudflare.com/sandbox/api/sessions/) - Cache dependencies between runs

---
title: API Reference · Cloudflare Sandbox SDK docs
description: The Sandbox SDK provides a comprehensive API for executing code,
  managing files, running processes, and exposing services in isolated
  sandboxes. All operations are performed through the Sandbox instance you
  obtain via getSandbox().
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/api/
  md: https://developers.cloudflare.com/sandbox/api/index.md
---

The Sandbox SDK provides a comprehensive API for executing code, managing files, running processes, and exposing services in isolated sandboxes. All operations are performed through the `Sandbox` instance you obtain via `getSandbox()`.

## Getting a sandbox instance

```typescript
import { getSandbox } from '@cloudflare/sandbox';


const sandbox = getSandbox(env.Sandbox, 'user-123');
```

The sandbox ID should be unique per user or session. The same ID will always return the same sandbox instance with persistent state.

## API organization

The Sandbox SDK is organized into focused APIs:

[Commands](https://developers.cloudflare.com/sandbox/api/commands/)

Execute commands and stream output. Includes `exec()`, `execStream()`, and background process management.

[Files](https://developers.cloudflare.com/sandbox/api/files/)

Read, write, and manage files in the sandbox filesystem. Includes directory operations and file metadata.

[Code Interpreter](https://developers.cloudflare.com/sandbox/api/interpreter/)

Execute Python and JavaScript code with rich outputs including charts, tables, and formatted data.

[Ports](https://developers.cloudflare.com/sandbox/api/ports/)

Expose services running in the sandbox via preview URLs. Access web servers and APIs from the internet.

[Sessions](https://developers.cloudflare.com/sandbox/api/sessions/)

Advanced: Create isolated execution contexts with persistent shell state. Configure environment variables and manage container lifecycle.


---
title: Commands · Cloudflare Sandbox SDK docs
description: Execute commands and manage background processes in the sandbox's
  isolated container environment.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/api/commands/
  md: https://developers.cloudflare.com/sandbox/api/commands/index.md
---

Execute commands and manage background processes in the sandbox's isolated container environment.

## Methods

### `exec()`

Execute a command and return the complete result.

```ts
const result = await sandbox.exec(command: string, options?: ExecOptions): Promise<ExecuteResponse>
```

**Parameters**:

* `command` - The command to execute (can include arguments)

* `options` (optional):

  * `stream` - Enable streaming callbacks (default: `false`)
  * `onOutput` - Callback for real-time output: `(stream: 'stdout' | 'stderr', data: string) => void`
  * `timeout` - Maximum execution time in milliseconds

**Returns**: `Promise<ExecuteResponse>` with `success`, `stdout`, `stderr`, `exitCode`

* JavaScript

  ```js
  const result = await sandbox.exec("npm run build");


  if (result.success) {
    console.log("Build output:", result.stdout);
  } else {
    console.error("Build failed:", result.stderr);
  }


  // With streaming
  await sandbox.exec("npm install", {
    stream: true,
    onOutput: (stream, data) => console.log(`[${stream}] ${data}`),
  });
  ```

* TypeScript

  ```ts
  const result = await sandbox.exec('npm run build');


  if (result.success) {
    console.log('Build output:', result.stdout);
  } else {
    console.error('Build failed:', result.stderr);
  }


  // With streaming
  await sandbox.exec('npm install', {
    stream: true,
    onOutput: (stream, data) => console.log(`[${stream}] ${data}`)
  });
  ```

### `execStream()`

Execute a command and return a Server-Sent Events stream for real-time processing.

```ts
const stream = await sandbox.execStream(command: string, options?: ExecOptions): Promise<ReadableStream>
```

**Parameters**:

* `command` - The command to execute
* `options` - Same as `exec()`

**Returns**: `Promise<ReadableStream>` emitting `ExecEvent` objects (`start`, `stdout`, `stderr`, `complete`, `error`)

* JavaScript

  ```js
  import { parseSSEStream } from "@cloudflare/sandbox";


  const stream = await sandbox.execStream("npm run build");


  for await (const event of parseSSEStream(stream)) {
    switch (event.type) {
      case "stdout":
        console.log("Output:", event.data);
        break;
      case "complete":
        console.log("Exit code:", event.exitCode);
        break;
      case "error":
        console.error("Failed:", event.error);
        break;
    }
  }
  ```

* TypeScript

  ```ts
  import { parseSSEStream, type ExecEvent } from '@cloudflare/sandbox';


  const stream = await sandbox.execStream('npm run build');


  for await (const event of parseSSEStream<ExecEvent>(stream)) {
    switch (event.type) {
      case 'stdout':
        console.log('Output:', event.data);
        break;
      case 'complete':
        console.log('Exit code:', event.exitCode);
        break;
      case 'error':
        console.error('Failed:', event.error);
        break;
    }
  }
  ```

### `startProcess()`

Start a long-running background process.

```ts
const process = await sandbox.startProcess(command: string, options?: ProcessOptions): Promise<ProcessInfo>
```

**Parameters**:

* `command` - The command to start as a background process

* `options` (optional):

  * `cwd` - Working directory
  * `env` - Environment variables

**Returns**: `Promise<ProcessInfo>` with `id`, `pid`, `command`, `status`

* JavaScript

  ```js
  const server = await sandbox.startProcess("python -m http.server 8000");
  console.log("Started with PID:", server.pid);


  // With custom environment
  const app = await sandbox.startProcess("node app.js", {
    cwd: "/workspace/my-app",
    env: { NODE_ENV: "production", PORT: "3000" },
  });
  ```

* TypeScript

  ```ts
  const server = await sandbox.startProcess('python -m http.server 8000');
  console.log('Started with PID:', server.pid);


  // With custom environment
  const app = await sandbox.startProcess('node app.js', {
    cwd: '/workspace/my-app',
    env: { NODE_ENV: 'production', PORT: '3000' }
  });
  ```

### `listProcesses()`

List all running processes.

```ts
const processes = await sandbox.listProcesses(): Promise<ProcessInfo[]>
```

* JavaScript

  ```js
  const processes = await sandbox.listProcesses();


  for (const proc of processes) {
    console.log(`${proc.id}: ${proc.command} (PID ${proc.pid})`);
  }
  ```

* TypeScript

  ```ts
  const processes = await sandbox.listProcesses();


  for (const proc of processes) {
    console.log(`${proc.id}: ${proc.command} (PID ${proc.pid})`);
  }
  ```

### `killProcess()`

Terminate a specific process.

```ts
await sandbox.killProcess(processId: string, signal?: string): Promise<void>
```

**Parameters**:

* `processId` - The process ID (from `startProcess()` or `listProcesses()`)
* `signal` - Signal to send (default: `"SIGTERM"`)

- JavaScript

  ```js
  const server = await sandbox.startProcess("python -m http.server 8000");
  await sandbox.killProcess(server.id);
  ```

- TypeScript

  ```ts
  const server = await sandbox.startProcess('python -m http.server 8000');
  await sandbox.killProcess(server.id);
  ```

### `killAllProcesses()`

Terminate all running processes.

```ts
await sandbox.killAllProcesses(): Promise<void>
```

* JavaScript

  ```js
  await sandbox.killAllProcesses();
  ```

* TypeScript

  ```ts
  await sandbox.killAllProcesses();
  ```

### `streamProcessLogs()`

Stream logs from a running process in real-time.

```ts
const stream = await sandbox.streamProcessLogs(processId: string): Promise<ReadableStream>
```

**Parameters**:

* `processId` - The process ID

**Returns**: `Promise<ReadableStream>` emitting `LogEvent` objects

* JavaScript

  ```js
  import { parseSSEStream } from "@cloudflare/sandbox";


  const server = await sandbox.startProcess("node server.js");
  const logStream = await sandbox.streamProcessLogs(server.id);


  for await (const log of parseSSEStream(logStream)) {
    console.log(`[${log.timestamp}] ${log.data}`);


    if (log.data.includes("Server started")) break;
  }
  ```

* TypeScript

  ```ts
  import { parseSSEStream, type LogEvent } from '@cloudflare/sandbox';


  const server = await sandbox.startProcess('node server.js');
  const logStream = await sandbox.streamProcessLogs(server.id);


  for await (const log of parseSSEStream<LogEvent>(logStream)) {
    console.log(`[${log.timestamp}] ${log.data}`);


    if (log.data.includes('Server started')) break;
  }
  ```

### `getProcessLogs()`

Get accumulated logs from a process.

```ts
const logs = await sandbox.getProcessLogs(processId: string): Promise<string>
```

**Parameters**:

* `processId` - The process ID

**Returns**: `Promise<string>` with all accumulated output

* JavaScript

  ```js
  const server = await sandbox.startProcess("node server.js");
  await new Promise((resolve) => setTimeout(resolve, 5000));


  const logs = await sandbox.getProcessLogs(server.id);
  console.log("Server logs:", logs);
  ```

* TypeScript

  ```ts
  const server = await sandbox.startProcess('node server.js');
  await new Promise(resolve => setTimeout(resolve, 5000));


  const logs = await sandbox.getProcessLogs(server.id);
  console.log('Server logs:', logs);
  ```

## Related resources

* [Background processes guide](https://developers.cloudflare.com/sandbox/guides/background-processes/) - Managing long-running processes
* [Files API](https://developers.cloudflare.com/sandbox/api/files/) - File operations


---
title: Files · Cloudflare Sandbox SDK docs
description: Read, write, and manage files in the sandbox filesystem. All paths
  are absolute (e.g., /workspace/app.js).
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/api/files/
  md: https://developers.cloudflare.com/sandbox/api/files/index.md
---

Read, write, and manage files in the sandbox filesystem. All paths are absolute (e.g., `/workspace/app.js`).

## Methods

### `writeFile()`

Write content to a file.

```ts
await sandbox.writeFile(path: string, content: string, options?: WriteFileOptions): Promise<void>
```

**Parameters**:

* `path` - Absolute path to the file
* `content` - Content to write
* `options` (optional):
  * `encoding` - File encoding (default: `"utf-8"`)

- JavaScript

  ```js
  await sandbox.writeFile("/workspace/app.js", `console.log('Hello!');`);


  // Binary data
  await sandbox.writeFile("/tmp/image.png", base64Data, { encoding: "base64" });
  ```

- TypeScript

  ```ts
  await sandbox.writeFile('/workspace/app.js', `console.log('Hello!');`);


  // Binary data
  await sandbox.writeFile('/tmp/image.png', base64Data, { encoding: 'base64' });
  ```

### `readFile()`

Read a file from the sandbox.

```ts
const file = await sandbox.readFile(path: string, options?: ReadFileOptions): Promise<FileInfo>
```

**Parameters**:

* `path` - Absolute path to the file
* `options` (optional):
  * `encoding` - File encoding (default: `"utf-8"`)

**Returns**: `Promise<FileInfo>` with `content` and `encoding`

* JavaScript

  ```js
  const file = await sandbox.readFile("/workspace/package.json");
  const pkg = JSON.parse(file.content);


  // Binary data
  const image = await sandbox.readFile("/tmp/image.png", { encoding: "base64" });
  ```

* TypeScript

  ```ts
  const file = await sandbox.readFile('/workspace/package.json');
  const pkg = JSON.parse(file.content);


  // Binary data
  const image = await sandbox.readFile('/tmp/image.png', { encoding: 'base64' });
  ```

### `mkdir()`

Create a directory.

```ts
await sandbox.mkdir(path: string, options?: MkdirOptions): Promise<void>
```

**Parameters**:

* `path` - Absolute path to the directory
* `options` (optional):
  * `recursive` - Create parent directories if needed (default: `false`)

- JavaScript

  ```js
  await sandbox.mkdir("/workspace/src");


  // Nested directories
  await sandbox.mkdir("/workspace/src/components/ui", { recursive: true });
  ```

- TypeScript

  ```ts
  await sandbox.mkdir('/workspace/src');


  // Nested directories
  await sandbox.mkdir('/workspace/src/components/ui', { recursive: true });
  ```

### `deleteFile()`

Delete a file.

```ts
await sandbox.deleteFile(path: string): Promise<void>
```

**Parameters**:

* `path` - Absolute path to the file

- JavaScript

  ```js
  await sandbox.deleteFile("/workspace/temp.txt");
  ```

- TypeScript

  ```ts
  await sandbox.deleteFile('/workspace/temp.txt');
  ```

### `renameFile()`

Rename a file.

```ts
await sandbox.renameFile(oldPath: string, newPath: string): Promise<void>
```

**Parameters**:

* `oldPath` - Current file path
* `newPath` - New file path

- JavaScript

  ```js
  await sandbox.renameFile("/workspace/draft.txt", "/workspace/final.txt");
  ```

- TypeScript

  ```ts
  await sandbox.renameFile('/workspace/draft.txt', '/workspace/final.txt');
  ```

### `moveFile()`

Move a file to a different directory.

```ts
await sandbox.moveFile(sourcePath: string, destinationPath: string): Promise<void>
```

**Parameters**:

* `sourcePath` - Current file path
* `destinationPath` - Destination path

- JavaScript

  ```js
  await sandbox.moveFile("/tmp/download.txt", "/workspace/data.txt");
  ```

- TypeScript

  ```ts
  await sandbox.moveFile('/tmp/download.txt', '/workspace/data.txt');
  ```

### `gitCheckout()`

Clone a git repository.

```ts
await sandbox.gitCheckout(repoUrl: string, options?: GitCheckoutOptions): Promise<void>
```

**Parameters**:

* `repoUrl` - Git repository URL

* `options` (optional):

  * `branch` - Branch to checkout (default: main branch)
  * `targetDir` - Directory to clone into (default: repo name)
  * `depth` - Clone depth for shallow clone

- JavaScript

  ```js
  await sandbox.gitCheckout("https://github.com/user/repo");


  // Specific branch
  await sandbox.gitCheckout("https://github.com/user/repo", {
    branch: "develop",
    targetDir: "my-project",
  });
  ```

- TypeScript

  ```ts
  await sandbox.gitCheckout('https://github.com/user/repo');


  // Specific branch
  await sandbox.gitCheckout('https://github.com/user/repo', {
    branch: 'develop',
    targetDir: 'my-project'
  });
  ```

## Related resources

* [Manage files guide](https://developers.cloudflare.com/sandbox/guides/manage-files/) - Detailed guide with best practices
* [Commands API](https://developers.cloudflare.com/sandbox/api/commands/) - Execute commands


---
title: Code Interpreter · Cloudflare Sandbox SDK docs
description: Execute Python, JavaScript, and TypeScript code with support for
  data visualizations, tables, and rich output formats. Contexts maintain state
  (variables, imports, functions) across executions.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/api/interpreter/
  md: https://developers.cloudflare.com/sandbox/api/interpreter/index.md
---

Execute Python, JavaScript, and TypeScript code with support for data visualizations, tables, and rich output formats. Contexts maintain state (variables, imports, functions) across executions.

## Methods

### `createCodeContext()`

Create a persistent execution context for running code.

```ts
const context = await sandbox.createCodeContext(options?: CreateContextOptions): Promise<CodeContext>
```

**Parameters**:

* `options` (optional):

  * `language` - `"python" | "javascript" | "typescript"` (default: `"python"`)
  * `cwd` - Working directory (default: `"/workspace"`)
  * `envVars` - Environment variables
  * `timeout` - Request timeout in milliseconds (default: 30000)

**Returns**: `Promise<CodeContext>` with `id`, `language`, `cwd`, `createdAt`, `lastUsed`

* JavaScript

  ```js
  const ctx = await sandbox.createCodeContext({
    language: "python",
    envVars: { API_KEY: env.API_KEY },
  });
  ```

* TypeScript

  ```ts
  const ctx = await sandbox.createCodeContext({
    language: 'python',
    envVars: { API_KEY: env.API_KEY }
  });
  ```

### `runCode()`

Execute code in a context and return the complete result.

```ts
const result = await sandbox.runCode(code: string, options?: RunCodeOptions): Promise<ExecutionResult>
```

**Parameters**:

* `code` - The code to execute (required)

* `options` (optional):

  * `context` - Context to run in (recommended - see below)
  * `language` - `"python" | "javascript" | "typescript"` (default: `"python"`)
  * `timeout` - Execution timeout in milliseconds (default: 60000)
  * `onStdout`, `onStderr`, `onResult`, `onError` - Streaming callbacks

**Returns**: `Promise<ExecutionResult>` with:

* `code` - The executed code
* `logs` - `stdout` and `stderr` arrays
* `results` - Array of rich outputs (see [Rich Output Formats](#rich-output-formats))
* `error` - Execution error if any
* `executionCount` - Execution counter

**Recommended usage - create explicit context**:

* JavaScript

  ```js
  const ctx = await sandbox.createCodeContext({ language: "python" });


  await sandbox.runCode("import math; radius = 5", { context: ctx });
  const result = await sandbox.runCode("math.pi * radius ** 2", { context: ctx });


  console.log(result.results[0].text); // "78.53981633974483"
  ```

* TypeScript

  ```ts
  const ctx = await sandbox.createCodeContext({ language: 'python' });


  await sandbox.runCode('import math; radius = 5', { context: ctx });
  const result = await sandbox.runCode('math.pi * radius ** 2', { context: ctx });


  console.log(result.results[0].text); // "78.53981633974483"
  ```

Default context behavior

If no `context` is provided, a default context is automatically created/reused for the specified `language`. While convenient for quick tests, **explicitly creating contexts is recommended** for production use to maintain predictable state.

* JavaScript

  ```js
  const result = await sandbox.runCode(
    `
  data = [1, 2, 3, 4, 5]
  print(f"Sum: {sum(data)}")
  sum(data)
  `,
    { language: "python" },
  );


  console.log(result.logs.stdout); // ["Sum: 15"]
  console.log(result.results[0].text); // "15"
  ```

* TypeScript

  ```ts
  const result = await sandbox.runCode(`
  data = [1, 2, 3, 4, 5]
  print(f"Sum: {sum(data)}")
  sum(data)
  `, { language: 'python' });


  console.log(result.logs.stdout); // ["Sum: 15"]
  console.log(result.results[0].text); // "15"
  ```

**Error handling**:

* JavaScript

  ```js
  const result = await sandbox.runCode("x = 1 / 0", { language: "python" });


  if (result.error) {
    console.error(result.error.name); // "ZeroDivisionError"
    console.error(result.error.value); // "division by zero"
    console.error(result.error.traceback); // Stack trace array
  }
  ```

* TypeScript

  ```ts
  const result = await sandbox.runCode('x = 1 / 0', { language: 'python' });


  if (result.error) {
    console.error(result.error.name);      // "ZeroDivisionError"
    console.error(result.error.value);     // "division by zero"
    console.error(result.error.traceback); // Stack trace array
  }
  ```

### `listCodeContexts()`

List all active code execution contexts.

```ts
const contexts = await sandbox.listCodeContexts(): Promise<CodeContext[]>
```

* JavaScript

  ```js
  const contexts = await sandbox.listCodeContexts();
  console.log(`Found ${contexts.length} contexts`);
  ```

* TypeScript

  ```ts
  const contexts = await sandbox.listCodeContexts();
  console.log(`Found ${contexts.length} contexts`);
  ```

### `deleteCodeContext()`

Delete a code execution context and free its resources.

```ts
await sandbox.deleteCodeContext(contextId: string): Promise<void>
```

* JavaScript

  ```js
  const ctx = await sandbox.createCodeContext({ language: "python" });
  await sandbox.runCode('print("Hello")', { context: ctx });
  await sandbox.deleteCodeContext(ctx.id);
  ```

* TypeScript

  ```ts
  const ctx = await sandbox.createCodeContext({ language: 'python' });
  await sandbox.runCode('print("Hello")', { context: ctx });
  await sandbox.deleteCodeContext(ctx.id);
  ```

## Rich Output Formats

Results include: `text`, `html`, `png`, `jpeg`, `svg`, `latex`, `markdown`, `json`, `chart`, `data`

**Charts (matplotlib)**:

* JavaScript

  ```js
  const result = await sandbox.runCode(
    `
  import matplotlib.pyplot as plt
  import numpy as np


  x = np.linspace(0, 10, 100)
  plt.plot(x, np.sin(x))
  plt.show()
  `,
    { language: "python" },
  );


  if (result.results[0]?.png) {
    const imageBuffer = Buffer.from(result.results[0].png, "base64");
    return new Response(imageBuffer, {
      headers: { "Content-Type": "image/png" },
    });
  }
  ```

* TypeScript

  ```ts
  const result = await sandbox.runCode(`
  import matplotlib.pyplot as plt
  import numpy as np


  x = np.linspace(0, 10, 100)
  plt.plot(x, np.sin(x))
  plt.show()
  `, { language: 'python' });


  if (result.results[0]?.png) {
    const imageBuffer = Buffer.from(result.results[0].png, 'base64');
    return new Response(imageBuffer, {
      headers: { 'Content-Type': 'image/png' }
    });
  }
  ```

**Tables (pandas)**:

* JavaScript

  ```js
  const result = await sandbox.runCode(
    `
  import pandas as pd
  df = pd.DataFrame({'Name': ['Alice', 'Bob'], 'Age': [25, 30]})
  df
  `,
    { language: "python" },
  );


  if (result.results[0]?.html) {
    return new Response(result.results[0].html, {
      headers: { "Content-Type": "text/html" },
    });
  }
  ```

* TypeScript

  ```ts
  const result = await sandbox.runCode(`
  import pandas as pd
  df = pd.DataFrame({'Name': ['Alice', 'Bob'], 'Age': [25, 30]})
  df
  `, { language: 'python' });


  if (result.results[0]?.html) {
    return new Response(result.results[0].html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
  ```

## Related resources

* [Build an AI Code Executor](https://developers.cloudflare.com/sandbox/tutorials/ai-code-executor/) - Complete tutorial
* [Commands API](https://developers.cloudflare.com/sandbox/api/commands/) - Lower-level command execution
* [Files API](https://developers.cloudflare.com/sandbox/api/files/) - File operations


---
title: Ports · Cloudflare Sandbox SDK docs
description: Expose services running in your sandbox via public preview URLs.
  See Preview URLs concept for details.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/api/ports/
  md: https://developers.cloudflare.com/sandbox/api/ports/index.md
---

Expose services running in your sandbox via public preview URLs. See [Preview URLs concept](https://developers.cloudflare.com/sandbox/concepts/preview-urls/) for details.

## Methods

### `exposePort()`

Expose a port and get a preview URL.

```ts
const response = await sandbox.exposePort(port: number, options?: ExposePortOptions): Promise<ExposePortResponse>
```

**Parameters**:

* `port` - Port number to expose (1024-65535)
* `options` (optional):
  * `name` - Friendly name for the port

**Returns**: `Promise<ExposePortResponse>` with `port`, `exposedAt` (preview URL), `name`

* JavaScript

  ```js
  await sandbox.startProcess("python -m http.server 8000");
  const exposed = await sandbox.exposePort(8000);


  console.log("Available at:", exposed.exposedAt);
  // https://abc123-8000.sandbox.workers.dev


  // Multiple services with names
  await sandbox.startProcess("node api.js");
  const api = await sandbox.exposePort(3000, { name: "api" });


  await sandbox.startProcess("npm run dev");
  const frontend = await sandbox.exposePort(5173, { name: "frontend" });
  ```

* TypeScript

  ```ts
  await sandbox.startProcess('python -m http.server 8000');
  const exposed = await sandbox.exposePort(8000);


  console.log('Available at:', exposed.exposedAt);
  // https://abc123-8000.sandbox.workers.dev


  // Multiple services with names
  await sandbox.startProcess('node api.js');
  const api = await sandbox.exposePort(3000, { name: 'api' });


  await sandbox.startProcess('npm run dev');
  const frontend = await sandbox.exposePort(5173, { name: 'frontend' });
  ```

### `unexposePort()`

Remove an exposed port and close its preview URL.

```ts
await sandbox.unexposePort(port: number): Promise<void>
```

**Parameters**:

* `port` - Port number to unexpose

- JavaScript

  ```js
  await sandbox.unexposePort(8000);
  ```

- TypeScript

  ```ts
  await sandbox.unexposePort(8000);
  ```

### `getExposedPorts()`

Get information about all currently exposed ports.

```ts
const response = await sandbox.getExposedPorts(): Promise<GetExposedPortsResponse>
```

**Returns**: `Promise<GetExposedPortsResponse>` with `ports` array (containing `port`, `exposedAt`, `name`)

* JavaScript

  ```js
  const { ports } = await sandbox.getExposedPorts();


  for (const port of ports) {
    console.log(`${port.name || port.port}: ${port.exposedAt}`);
  }
  ```

* TypeScript

  ```ts
  const { ports } = await sandbox.getExposedPorts();


  for (const port of ports) {
    console.log(`${port.name || port.port}: ${port.exposedAt}`);
  }
  ```

## Related resources

* [Preview URLs concept](https://developers.cloudflare.com/sandbox/concepts/preview-urls/) - How preview URLs work
* [Commands API](https://developers.cloudflare.com/sandbox/api/commands/) - Start background processes


---
title: Sessions · Cloudflare Sandbox SDK docs
description: Create isolated execution contexts within a sandbox. Each session
  maintains its own shell state, environment variables, and working directory.
  See Session management concept for details.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/api/sessions/
  md: https://developers.cloudflare.com/sandbox/api/sessions/index.md
---

Create isolated execution contexts within a sandbox. Each session maintains its own shell state, environment variables, and working directory. See [Session management concept](https://developers.cloudflare.com/sandbox/concepts/sessions/) for details.

Note

Every sandbox has a default session that automatically maintains shell state. Create additional sessions when you need isolated shell contexts for different environments or parallel workflows.

## Methods

### `createSession()`

Create a new isolated execution session.

```ts
const session = await sandbox.createSession(options?: SessionOptions): Promise<ExecutionSession>
```

**Parameters**:

* `options` (optional):

  * `id` - Custom session ID (auto-generated if not provided)
  * `env` - Environment variables for this session
  * `cwd` - Working directory (default: `"/workspace"`)

**Returns**: `Promise<ExecutionSession>` with all sandbox methods bound to this session

* JavaScript

  ```js
  // Multiple isolated environments
  const prodSession = await sandbox.createSession({
    id: "prod",
    env: { NODE_ENV: "production", API_URL: "https://api.example.com" },
    cwd: "/workspace/prod",
  });


  const testSession = await sandbox.createSession({
    id: "test",
    env: { NODE_ENV: "test", API_URL: "http://localhost:3000" },
    cwd: "/workspace/test",
  });


  // Run in parallel
  const [prodResult, testResult] = await Promise.all([
    prodSession.exec("npm run build"),
    testSession.exec("npm run build"),
  ]);
  ```

* TypeScript

  ```ts
  // Multiple isolated environments
  const prodSession = await sandbox.createSession({
    id: 'prod',
    env: { NODE_ENV: 'production', API_URL: 'https://api.example.com' },
    cwd: '/workspace/prod'
  });


  const testSession = await sandbox.createSession({
    id: 'test',
    env: { NODE_ENV: 'test', API_URL: 'http://localhost:3000' },
    cwd: '/workspace/test'
  });


  // Run in parallel
  const [prodResult, testResult] = await Promise.all([
    prodSession.exec('npm run build'),
    testSession.exec('npm run build')
  ]);
  ```

### `getSession()`

Retrieve an existing session by ID.

```ts
const session = await sandbox.getSession(sessionId: string): Promise<ExecutionSession>
```

**Parameters**:

* `sessionId` - ID of an existing session

**Returns**: `Promise<ExecutionSession>` bound to the specified session

* JavaScript

  ```js
  // First request - create session
  const session = await sandbox.createSession({ id: "user-123" });
  await session.exec("git clone https://github.com/user/repo.git");
  await session.exec("cd repo && npm install");


  // Second request - resume session (environment and cwd preserved)
  const session = await sandbox.getSession("user-123");
  const result = await session.exec("cd repo && npm run build");
  ```

* TypeScript

  ```ts
  // First request - create session
  const session = await sandbox.createSession({ id: 'user-123' });
  await session.exec('git clone https://github.com/user/repo.git');
  await session.exec('cd repo && npm install');


  // Second request - resume session (environment and cwd preserved)
  const session = await sandbox.getSession('user-123');
  const result = await session.exec('cd repo && npm run build');
  ```

### `setEnvVars()`

Set environment variables in the sandbox.

```ts
await sandbox.setEnvVars(envVars: Record<string, string>): Promise<void>
```

**Parameters**:

* `envVars` - Key-value pairs of environment variables to set

Warning

Call `setEnvVars()` **before** any other sandbox operations to ensure environment variables are available from the start.

* JavaScript

  ```js
  const sandbox = getSandbox(env.Sandbox, "user-123");


  // Set environment variables first
  await sandbox.setEnvVars({
    API_KEY: env.OPENAI_API_KEY,
    DATABASE_URL: env.DATABASE_URL,
    NODE_ENV: "production",
  });


  // Now commands can access these variables
  await sandbox.exec("python script.py");
  ```

* TypeScript

  ```ts
  const sandbox = getSandbox(env.Sandbox, 'user-123');


  // Set environment variables first
  await sandbox.setEnvVars({
    API_KEY: env.OPENAI_API_KEY,
    DATABASE_URL: env.DATABASE_URL,
    NODE_ENV: 'production'
  });


  // Now commands can access these variables
  await sandbox.exec('python script.py');
  ```

### `destroy()`

Destroy the sandbox container and free up resources.

```ts
await sandbox.destroy(): Promise<void>
```

Note

Containers automatically sleep after 3 minutes of inactivity, but still count toward account limits. Use `destroy()` to immediately free up resources.

* JavaScript

  ```js
  async function executeCode(code) {
    const sandbox = getSandbox(env.Sandbox, `temp-${Date.now()}`);


    try {
      await sandbox.writeFile("/tmp/code.py", code);
      const result = await sandbox.exec("python /tmp/code.py");
      return result.stdout;
    } finally {
      await sandbox.destroy();
    }
  }
  ```

* TypeScript

  ```ts
  async function executeCode(code: string): Promise<string> {
    const sandbox = getSandbox(env.Sandbox, `temp-${Date.now()}`);


    try {
      await sandbox.writeFile('/tmp/code.py', code);
      const result = await sandbox.exec('python /tmp/code.py');
      return result.stdout;
    } finally {
      await sandbox.destroy();
    }
  }
  ```

## ExecutionSession methods

The `ExecutionSession` object has all sandbox methods bound to the specific session:

**Commands**: [`exec()`](https://developers.cloudflare.com/sandbox/api/commands/#exec), [`execStream()`](https://developers.cloudflare.com/sandbox/api/commands/#execstream)\
**Processes**: [`startProcess()`](https://developers.cloudflare.com/sandbox/api/commands/#startprocess), [`listProcesses()`](https://developers.cloudflare.com/sandbox/api/commands/#listprocesses), [`killProcess()`](https://developers.cloudflare.com/sandbox/api/commands/#killprocess), [`killAllProcesses()`](https://developers.cloudflare.com/sandbox/api/commands/#killallprocesses), [`getProcessLogs()`](https://developers.cloudflare.com/sandbox/api/commands/#getprocesslogs), [`streamProcessLogs()`](https://developers.cloudflare.com/sandbox/api/commands/#streamprocesslogs)\
**Files**: [`writeFile()`](https://developers.cloudflare.com/sandbox/api/files/#writefile), [`readFile()`](https://developers.cloudflare.com/sandbox/api/files/#readfile), [`mkdir()`](https://developers.cloudflare.com/sandbox/api/files/#mkdir), [`deleteFile()`](https://developers.cloudflare.com/sandbox/api/files/#deletefile), [`renameFile()`](https://developers.cloudflare.com/sandbox/api/files/#renamefile), [`moveFile()`](https://developers.cloudflare.com/sandbox/api/files/#movefile), [`gitCheckout()`](https://developers.cloudflare.com/sandbox/api/files/#gitcheckout)\
**Environment**: [`setEnvVars()`](https://developers.cloudflare.com/sandbox/api/sessions/#setenvvars)\
**Code Interpreter**: [`createCodeContext()`](https://developers.cloudflare.com/sandbox/api/interpreter/#createcodecontext), [`runCode()`](https://developers.cloudflare.com/sandbox/api/interpreter/#runcode), [`listCodeContexts()`](https://developers.cloudflare.com/sandbox/api/interpreter/#listcodecontexts), [`deleteCodeContext()`](https://developers.cloudflare.com/sandbox/api/interpreter/#deletecodecontext)

## Related resources

* [Session management concept](https://developers.cloudflare.com/sandbox/concepts/sessions/) - How sessions work
* [Commands API](https://developers.cloudflare.com/sandbox/api/commands/) - Execute commands


---
title: Execute commands · Cloudflare Sandbox SDK docs
description: This guide shows you how to execute commands in the sandbox, handle
  output, and manage errors effectively.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/guides/execute-commands/
  md: https://developers.cloudflare.com/sandbox/guides/execute-commands/index.md
---

This guide shows you how to execute commands in the sandbox, handle output, and manage errors effectively.

## Choose the right method

The SDK provides two methods for command execution:

* **`exec()`** - Run a command and wait for complete result. Best for most use cases.
* **`execStream()`** - Stream output in real-time. Best for long-running commands where you need immediate feedback.

## Execute basic commands

Use `exec()` for simple commands that complete quickly:

* JavaScript

  ```js
  import { getSandbox } from "@cloudflare/sandbox";


  const sandbox = getSandbox(env.Sandbox, "my-sandbox");


  // Execute a single command
  const result = await sandbox.exec("python --version");


  console.log(result.stdout); // "Python 3.11.0"
  console.log(result.exitCode); // 0
  console.log(result.success); // true
  ```

* TypeScript

  ```ts
  import { getSandbox } from '@cloudflare/sandbox';


  const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


  // Execute a single command
  const result = await sandbox.exec('python --version');


  console.log(result.stdout);   // "Python 3.11.0"
  console.log(result.exitCode); // 0
  console.log(result.success);  // true
  ```

## Pass arguments safely

When passing user input or dynamic values, avoid string interpolation to prevent injection attacks:

* JavaScript

  ```js
  // Unsafe - vulnerable to injection
  const filename = userInput;
  await sandbox.exec(`cat ${filename}`);


  // Safe - use proper escaping or validation
  const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, "");
  await sandbox.exec(`cat ${safeFilename}`);


  // Better - write to file and execute
  await sandbox.writeFile("/tmp/input.txt", userInput);
  await sandbox.exec("python process.py /tmp/input.txt");
  ```

* TypeScript

  ```ts
  // Unsafe - vulnerable to injection
  const filename = userInput;
  await sandbox.exec(`cat ${filename}`);


  // Safe - use proper escaping or validation
  const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '');
  await sandbox.exec(`cat ${safeFilename}`);


  // Better - write to file and execute
  await sandbox.writeFile('/tmp/input.txt', userInput);
  await sandbox.exec('python process.py /tmp/input.txt');
  ```

## Handle errors

Commands can fail in two ways:

1. **Non-zero exit code** - Command ran but failed (result.success === false)
2. **Execution error** - Command couldn't start (throws exception)

* JavaScript

  ```js
  try {
    const result = await sandbox.exec("python analyze.py");


    if (!result.success) {
      // Command failed (non-zero exit code)
      console.error("Analysis failed:", result.stderr);
      console.log("Exit code:", result.exitCode);


      // Handle specific exit codes
      if (result.exitCode === 1) {
        throw new Error("Invalid input data");
      } else if (result.exitCode === 2) {
        throw new Error("Missing dependencies");
      }
    }


    // Success - process output
    return JSON.parse(result.stdout);
  } catch (error) {
    // Execution error (couldn't start command)
    console.error("Execution failed:", error.message);
    throw error;
  }
  ```

* TypeScript

  ```ts
  try {
    const result = await sandbox.exec('python analyze.py');


    if (!result.success) {
      // Command failed (non-zero exit code)
      console.error('Analysis failed:', result.stderr);
      console.log('Exit code:', result.exitCode);


      // Handle specific exit codes
      if (result.exitCode === 1) {
        throw new Error('Invalid input data');
      } else if (result.exitCode === 2) {
        throw new Error('Missing dependencies');
      }
    }


    // Success - process output
    return JSON.parse(result.stdout);


  } catch (error) {
    // Execution error (couldn't start command)
    console.error('Execution failed:', error.message);
    throw error;
  }
  ```

## Execute shell commands

The sandbox supports shell features like pipes, redirects, and chaining:

* JavaScript

  ```js
  // Pipes and filters
  const result = await sandbox.exec('ls -la | grep ".py" | wc -l');
  console.log("Python files:", result.stdout.trim());


  // Output redirection
  await sandbox.exec("python generate.py > output.txt 2> errors.txt");


  // Multiple commands
  await sandbox.exec("cd /workspace && npm install && npm test");
  ```

* TypeScript

  ```ts
  // Pipes and filters
  const result = await sandbox.exec('ls -la | grep ".py" | wc -l');
  console.log('Python files:', result.stdout.trim());


  // Output redirection
  await sandbox.exec('python generate.py > output.txt 2> errors.txt');


  // Multiple commands
  await sandbox.exec('cd /workspace && npm install && npm test');
  ```

## Execute Python scripts

* JavaScript

  ```js
  // Run inline Python
  const result = await sandbox.exec('python -c "print(sum([1, 2, 3, 4, 5]))"');
  console.log("Sum:", result.stdout.trim()); // "15"


  // Run a script file
  await sandbox.writeFile(
    "/workspace/analyze.py",
    `
  import sys
  print(f"Argument: {sys.argv[1]}")
  `,
  );


  await sandbox.exec("python /workspace/analyze.py data.csv");
  ```

* TypeScript

  ```ts
  // Run inline Python
  const result = await sandbox.exec('python -c "print(sum([1, 2, 3, 4, 5]))"');
  console.log('Sum:', result.stdout.trim()); // "15"


  // Run a script file
  await sandbox.writeFile('/workspace/analyze.py', `
  import sys
  print(f"Argument: {sys.argv[1]}")
  `);


  await sandbox.exec('python /workspace/analyze.py data.csv');
  ```

## Best practices

* **Check exit codes** - Always verify `result.success` and `result.exitCode`
* **Validate inputs** - Escape or validate user input to prevent injection
* **Use streaming** - For long operations, use `execStream()` for real-time feedback
* **Handle errors** - Check stderr for error details

## Troubleshooting

### Command not found

Verify the command exists in the container:

* JavaScript

  ```js
  const check = await sandbox.exec("which python3");
  if (!check.success) {
    console.error("python3 not found");
  }
  ```

* TypeScript

  ```ts
  const check = await sandbox.exec('which python3');
  if (!check.success) {
    console.error('python3 not found');
  }
  ```

### Working directory issues

Use absolute paths or change directory:

* JavaScript

  ```js
  // Use absolute path
  await sandbox.exec("python /workspace/my-app/script.py");


  // Or change directory
  await sandbox.exec("cd /workspace/my-app && python script.py");
  ```

* TypeScript

  ```ts
  // Use absolute path
  await sandbox.exec('python /workspace/my-app/script.py');


  // Or change directory
  await sandbox.exec('cd /workspace/my-app && python script.py');
  ```

## Related resources

* [Commands API reference](https://developers.cloudflare.com/sandbox/api/commands/) - Complete method documentation
* [Background processes guide](https://developers.cloudflare.com/sandbox/guides/background-processes/) - Managing long-running processes
* [Streaming output guide](https://developers.cloudflare.com/sandbox/guides/streaming-output/) - Advanced streaming patterns
* [Code Interpreter guide](https://developers.cloudflare.com/sandbox/guides/code-execution/) - Higher-level code execution


---
title: Manage files · Cloudflare Sandbox SDK docs
description: This guide shows you how to read, write, organize, and synchronize
  files in the sandbox filesystem.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/guides/manage-files/
  md: https://developers.cloudflare.com/sandbox/guides/manage-files/index.md
---

This guide shows you how to read, write, organize, and synchronize files in the sandbox filesystem.

## Path conventions

File operations support both absolute and relative paths:

* `/workspace` - Default working directory for application files
* `/tmp` - Temporary files (may be cleared)
* `/home` - User home directory

- JavaScript

  ```js
  // Absolute paths
  await sandbox.writeFile("/workspace/app.js", code);


  // Relative paths (session-aware)
  const session = await sandbox.createSession();
  await session.exec("cd /workspace/my-project");
  await session.writeFile("app.js", code); // Writes to /workspace/my-project/app.js
  await session.writeFile("src/index.js", code); // Writes to /workspace/my-project/src/index.js
  ```

- TypeScript

  ```ts
  // Absolute paths
  await sandbox.writeFile('/workspace/app.js', code);


  // Relative paths (session-aware)
  const session = await sandbox.createSession();
  await session.exec('cd /workspace/my-project');
  await session.writeFile('app.js', code);  // Writes to /workspace/my-project/app.js
  await session.writeFile('src/index.js', code);  // Writes to /workspace/my-project/src/index.js
  ```

## Write files

* JavaScript

  ```js
  import { getSandbox } from "@cloudflare/sandbox";


  const sandbox = getSandbox(env.Sandbox, "my-sandbox");


  // Write text file
  await sandbox.writeFile(
    "/workspace/app.js",
    `console.log('Hello from sandbox!');`,
  );


  // Write JSON
  const config = { name: "my-app", version: "1.0.0" };
  await sandbox.writeFile(
    "/workspace/config.json",
    JSON.stringify(config, null, 2),
  );


  // Write binary file (base64)
  const buffer = await fetch(imageUrl).then((r) => r.arrayBuffer());
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  await sandbox.writeFile("/workspace/image.png", base64, { encoding: "base64" });
  ```

* TypeScript

  ```ts
  import { getSandbox } from '@cloudflare/sandbox';


  const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


  // Write text file
  await sandbox.writeFile('/workspace/app.js', `console.log('Hello from sandbox!');`);


  // Write JSON
  const config = { name: 'my-app', version: '1.0.0' };
  await sandbox.writeFile('/workspace/config.json', JSON.stringify(config, null, 2));


  // Write binary file (base64)
  const buffer = await fetch(imageUrl).then(r => r.arrayBuffer());
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  await sandbox.writeFile('/workspace/image.png', base64, { encoding: 'base64' });
  ```

## Read files

* JavaScript

  ```js
  // Read text file
  const file = await sandbox.readFile("/workspace/app.js");
  console.log(file.content);


  // Read and parse JSON
  const configFile = await sandbox.readFile("/workspace/config.json");
  const config = JSON.parse(configFile.content);


  // Read binary file
  const imageFile = await sandbox.readFile("/workspace/image.png", {
    encoding: "base64",
  });
  return new Response(atob(imageFile.content), {
    headers: { "Content-Type": "image/png" },
  });
  ```

* TypeScript

  ```ts
  // Read text file
  const file = await sandbox.readFile('/workspace/app.js');
  console.log(file.content);


  // Read and parse JSON
  const configFile = await sandbox.readFile('/workspace/config.json');
  const config = JSON.parse(configFile.content);


  // Read binary file
  const imageFile = await sandbox.readFile('/workspace/image.png', { encoding: 'base64' });
  return new Response(atob(imageFile.content), {
    headers: { 'Content-Type': 'image/png' }
  });
  ```

## Organize files

* JavaScript

  ```js
  // Create directories
  await sandbox.mkdir("/workspace/src", { recursive: true });
  await sandbox.mkdir("/workspace/tests", { recursive: true });


  // Rename file
  await sandbox.renameFile("/workspace/draft.txt", "/workspace/final.txt");


  // Move file
  await sandbox.moveFile("/tmp/download.txt", "/workspace/data.txt");


  // Delete file
  await sandbox.deleteFile("/workspace/temp.txt");
  ```

* TypeScript

  ```ts
  // Create directories
  await sandbox.mkdir('/workspace/src', { recursive: true });
  await sandbox.mkdir('/workspace/tests', { recursive: true });


  // Rename file
  await sandbox.renameFile('/workspace/draft.txt', '/workspace/final.txt');


  // Move file
  await sandbox.moveFile('/tmp/download.txt', '/workspace/data.txt');


  // Delete file
  await sandbox.deleteFile('/workspace/temp.txt');
  ```

## Batch operations

Write multiple files in parallel:

* JavaScript

  ```js
  const files = {
    "/workspace/src/app.js": 'console.log("app");',
    "/workspace/src/utils.js": 'console.log("utils");',
    "/workspace/README.md": "# My Project",
  };


  await Promise.all(
    Object.entries(files).map(([path, content]) =>
      sandbox.writeFile(path, content),
    ),
  );
  ```

* TypeScript

  ```ts
  const files = {
    '/workspace/src/app.js': 'console.log("app");',
    '/workspace/src/utils.js': 'console.log("utils");',
    '/workspace/README.md': '# My Project'
  };


  await Promise.all(
    Object.entries(files).map(([path, content]) =>
      sandbox.writeFile(path, content)
    )
  );
  ```

## Check if file exists

* JavaScript

  ```js
  try {
    await sandbox.readFile("/workspace/config.json");
    console.log("File exists");
  } catch (error) {
    if (error.code === "FILE_NOT_FOUND") {
      // Create default config
      await sandbox.writeFile("/workspace/config.json", "{}");
    }
  }
  ```

* TypeScript

  ```ts
  try {
    await sandbox.readFile('/workspace/config.json');
    console.log('File exists');
  } catch (error) {
    if (error.code === 'FILE_NOT_FOUND') {
      // Create default config
      await sandbox.writeFile('/workspace/config.json', '{}');
    }
  }
  ```

## Best practices

* **Use `/workspace`** - Default working directory for app files
* **Use absolute paths** - Always use full paths like `/workspace/file.txt`
* **Batch operations** - Use `Promise.all()` for multiple independent file writes
* **Create parent directories** - Use `recursive: true` when creating nested paths
* **Handle errors** - Check for `FILE_NOT_FOUND` errors gracefully

## Troubleshooting

### Directory doesn't exist

Create parent directories first:

* JavaScript

  ```js
  // Create directory, then write file
  await sandbox.mkdir("/workspace/data", { recursive: true });
  await sandbox.writeFile("/workspace/data/file.txt", content);
  ```

* TypeScript

  ```ts
  // Create directory, then write file
  await sandbox.mkdir('/workspace/data', { recursive: true });
  await sandbox.writeFile('/workspace/data/file.txt', content);
  ```

### Binary file encoding

Use base64 for binary files:

* JavaScript

  ```js
  // Write binary
  await sandbox.writeFile("/workspace/image.png", base64Data, {
    encoding: "base64",
  });


  // Read binary
  const file = await sandbox.readFile("/workspace/image.png", {
    encoding: "base64",
  });
  ```

* TypeScript

  ```ts
  // Write binary
  await sandbox.writeFile('/workspace/image.png', base64Data, {
    encoding: 'base64'
  });


  // Read binary
  const file = await sandbox.readFile('/workspace/image.png', {
    encoding: 'base64'
  });
  ```

## Related resources

* [Files API reference](https://developers.cloudflare.com/sandbox/api/files/) - Complete method documentation
* [Execute commands guide](https://developers.cloudflare.com/sandbox/guides/execute-commands/) - Run file operations with commands
* [Git workflows guide](https://developers.cloudflare.com/sandbox/guides/git-workflows/) - Clone and manage repositories
* [Code Interpreter guide](https://developers.cloudflare.com/sandbox/guides/code-execution/) - Generate and execute code files


---
title: Run background processes · Cloudflare Sandbox SDK docs
description: This guide shows you how to start, monitor, and manage long-running
  background processes in the sandbox.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/guides/background-processes/
  md: https://developers.cloudflare.com/sandbox/guides/background-processes/index.md
---

This guide shows you how to start, monitor, and manage long-running background processes in the sandbox.

## When to use background processes

Use `startProcess()` instead of `exec()` when:

* **Running web servers** - HTTP servers, APIs, WebSocket servers
* **Long-running services** - Database servers, caches, message queues
* **Development servers** - Hot-reloading dev servers, watch modes
* **Continuous monitoring** - Log watchers, health checkers
* **Parallel execution** - Multiple services running simultaneously

Use `exec()` for:

* **One-time commands** - Installations, builds, data processing
* **Quick scripts** - Simple operations that complete and exit

## Start a background process

* JavaScript

  ```js
  import { getSandbox } from "@cloudflare/sandbox";


  const sandbox = getSandbox(env.Sandbox, "my-sandbox");


  // Start a web server
  const server = await sandbox.startProcess("python -m http.server 8000");


  console.log("Server started");
  console.log("Process ID:", server.id);
  console.log("PID:", server.pid);
  console.log("Status:", server.status); // 'running'


  // Process runs in background - your code continues
  ```

* TypeScript

  ```ts
  import { getSandbox } from '@cloudflare/sandbox';


  const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


  // Start a web server
  const server = await sandbox.startProcess('python -m http.server 8000');


  console.log('Server started');
  console.log('Process ID:', server.id);
  console.log('PID:', server.pid);
  console.log('Status:', server.status); // 'running'


  // Process runs in background - your code continues
  ```

## Configure process environment

Set working directory and environment variables:

* JavaScript

  ```js
  const process = await sandbox.startProcess("node server.js", {
    cwd: "/workspace/api",
    env: {
      NODE_ENV: "production",
      PORT: "8080",
      API_KEY: env.API_KEY,
      DATABASE_URL: env.DATABASE_URL,
    },
  });


  console.log("API server started");
  ```

* TypeScript

  ```ts
  const process = await sandbox.startProcess('node server.js', {
    cwd: '/workspace/api',
    env: {
      NODE_ENV: 'production',
      PORT: '8080',
      API_KEY: env.API_KEY,
      DATABASE_URL: env.DATABASE_URL
    }
  });


  console.log('API server started');
  ```

## Monitor process status

List and check running processes:

* JavaScript

  ```js
  const processes = await sandbox.listProcesses();


  console.log(`Running ${processes.length} processes:`);


  for (const proc of processes) {
    console.log(`${proc.id}: ${proc.command} (${proc.status})`);
  }


  // Check if specific process is running
  const isRunning = processes.some(
    (p) => p.id === processId && p.status === "running",
  );
  ```

* TypeScript

  ```ts
  const processes = await sandbox.listProcesses();


  console.log(`Running ${processes.length} processes:`);


  for (const proc of processes) {
    console.log(`${proc.id}: ${proc.command} (${proc.status})`);
  }


  // Check if specific process is running
  const isRunning = processes.some(p => p.id === processId && p.status === 'running');
  ```

## Monitor process logs

Stream logs in real-time to detect when a service is ready:

* JavaScript

  ```js
  import { parseSSEStream } from "@cloudflare/sandbox";


  const server = await sandbox.startProcess("node server.js");


  // Stream logs
  const logStream = await sandbox.streamProcessLogs(server.id);


  for await (const log of parseSSEStream(logStream)) {
    console.log(log.data);


    if (log.data.includes("Server listening")) {
      console.log("Server is ready!");
      break;
    }
  }
  ```

* TypeScript

  ```ts
  import { parseSSEStream, type LogEvent } from '@cloudflare/sandbox';


  const server = await sandbox.startProcess('node server.js');


  // Stream logs
  const logStream = await sandbox.streamProcessLogs(server.id);


  for await (const log of parseSSEStream<LogEvent>(logStream)) {
    console.log(log.data);


    if (log.data.includes('Server listening')) {
      console.log('Server is ready!');
      break;
    }
  }
  ```

Or get accumulated logs:

* JavaScript

  ```js
  const logs = await sandbox.getProcessLogs(server.id);
  console.log("Logs:", logs);
  ```

* TypeScript

  ```ts
  const logs = await sandbox.getProcessLogs(server.id);
  console.log('Logs:', logs);
  ```

## Stop processes

* JavaScript

  ```js
  // Stop specific process
  await sandbox.killProcess(server.id);


  // Force kill if needed
  await sandbox.killProcess(server.id, "SIGKILL");


  // Stop all processes
  await sandbox.killAllProcesses();
  ```

* TypeScript

  ```ts
  // Stop specific process
  await sandbox.killProcess(server.id);


  // Force kill if needed
  await sandbox.killProcess(server.id, 'SIGKILL');


  // Stop all processes
  await sandbox.killAllProcesses();
  ```

## Run multiple processes

Start services in sequence, waiting for dependencies:

* JavaScript

  ```js
  import { parseSSEStream } from "@cloudflare/sandbox";


  // Start database first
  const db = await sandbox.startProcess("redis-server");


  // Wait for database to be ready
  const dbLogs = await sandbox.streamProcessLogs(db.id);
  for await (const log of parseSSEStream(dbLogs)) {
    if (log.data.includes("Ready to accept connections")) {
      break;
    }
  }


  // Now start API server (depends on database)
  const api = await sandbox.startProcess("node api-server.js", {
    env: { DATABASE_URL: "redis://localhost:6379" },
  });


  console.log("All services running");
  ```

* TypeScript

  ```ts
  import { parseSSEStream, type LogEvent } from '@cloudflare/sandbox';


  // Start database first
  const db = await sandbox.startProcess('redis-server');


  // Wait for database to be ready
  const dbLogs = await sandbox.streamProcessLogs(db.id);
  for await (const log of parseSSEStream<LogEvent>(dbLogs)) {
    if (log.data.includes('Ready to accept connections')) {
      break;
    }
  }


  // Now start API server (depends on database)
  const api = await sandbox.startProcess('node api-server.js', {
    env: { DATABASE_URL: 'redis://localhost:6379' }
  });


  console.log('All services running');
  ```

## Best practices

* **Wait for readiness** - Stream logs to detect when services are ready
* **Clean up** - Always stop processes when done
* **Handle failures** - Monitor logs for errors and restart if needed
* **Use try/finally** - Ensure cleanup happens even on errors

## Troubleshooting

### Process exits immediately

Check logs to see why:

* JavaScript

  ```js
  const process = await sandbox.startProcess("node server.js");
  await new Promise((resolve) => setTimeout(resolve, 1000));


  const processes = await sandbox.listProcesses();
  if (!processes.find((p) => p.id === process.id)) {
    const logs = await sandbox.getProcessLogs(process.id);
    console.error("Process exited:", logs);
  }
  ```

* TypeScript

  ```ts
  const process = await sandbox.startProcess('node server.js');
  await new Promise(resolve => setTimeout(resolve, 1000));


  const processes = await sandbox.listProcesses();
  if (!processes.find(p => p.id === process.id)) {
    const logs = await sandbox.getProcessLogs(process.id);
    console.error('Process exited:', logs);
  }
  ```

### Port already in use

Kill existing processes before starting:

* JavaScript

  ```js
  await sandbox.killAllProcesses();
  const server = await sandbox.startProcess("node server.js");
  ```

* TypeScript

  ```ts
  await sandbox.killAllProcesses();
  const server = await sandbox.startProcess('node server.js');
  ```

## Related resources

* [Commands API reference](https://developers.cloudflare.com/sandbox/api/commands/) - Complete process management API
* [Execute commands guide](https://developers.cloudflare.com/sandbox/guides/execute-commands/) - One-time command execution
* [Expose services guide](https://developers.cloudflare.com/sandbox/guides/expose-services/) - Make processes accessible
* [Streaming output guide](https://developers.cloudflare.com/sandbox/guides/streaming-output/) - Monitor process output


---
title: Expose services · Cloudflare Sandbox SDK docs
description: This guide shows you how to expose services running in your sandbox
  to the internet via preview URLs.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/guides/expose-services/
  md: https://developers.cloudflare.com/sandbox/guides/expose-services/index.md
---

This guide shows you how to expose services running in your sandbox to the internet via preview URLs.

## When to expose ports

Expose ports when you need to:

* **Test web applications** - Preview frontend or backend apps
* **Share demos** - Give others access to running applications
* **Develop APIs** - Test endpoints from external tools
* **Debug services** - Access internal services for troubleshooting
* **Build dev environments** - Create shareable development workspaces

## Basic port exposure

The typical workflow is: start service → wait for ready → expose port → handle requests with `proxyToSandbox`.

* JavaScript

  ```js
  import { getSandbox, proxyToSandbox } from "@cloudflare/sandbox";


  const sandbox = getSandbox(env.Sandbox, "my-sandbox");


  // 1. Start a web server
  await sandbox.startProcess("python -m http.server 8000");


  // 2. Wait for service to start
  await new Promise((resolve) => setTimeout(resolve, 2000));


  // 3. Expose the port
  const exposed = await sandbox.exposePort(8000);


  // 4. Preview URL is now available (public by default)
  console.log("Server accessible at:", exposed.exposedAt);
  // Returns: https://abc123-8000.sandbox.workers.dev


  // 5. Handle preview URL requests in your Worker
  export default {
    async fetch(request, env) {
      // Proxy requests to the exposed port
      return proxyToSandbox(request, env.Sandbox, "my-sandbox");
    },
  };
  ```

* TypeScript

  ```ts
  import { getSandbox, proxyToSandbox } from '@cloudflare/sandbox';


  const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


  // 1. Start a web server
  await sandbox.startProcess('python -m http.server 8000');


  // 2. Wait for service to start
  await new Promise(resolve => setTimeout(resolve, 2000));


  // 3. Expose the port
  const exposed = await sandbox.exposePort(8000);


  // 4. Preview URL is now available (public by default)
  console.log('Server accessible at:', exposed.exposedAt);
  // Returns: https://abc123-8000.sandbox.workers.dev


  // 5. Handle preview URL requests in your Worker
  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      // Proxy requests to the exposed port
      return proxyToSandbox(request, env.Sandbox, 'my-sandbox');
    }
  };
  ```

Warning

**Preview URLs are public by default.** Anyone with the URL can access your service. Add authentication if needed.

## Name your exposed ports

When exposing multiple ports, use names to stay organized:

* JavaScript

  ```js
  // Start and expose API server
  await sandbox.startProcess("node api.js", { env: { PORT: "8080" } });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const api = await sandbox.exposePort(8080, { name: "api" });


  // Start and expose frontend
  await sandbox.startProcess("npm run dev", { env: { PORT: "5173" } });
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const frontend = await sandbox.exposePort(5173, { name: "frontend" });


  console.log("Services:");
  console.log("- API:", api.exposedAt);
  console.log("- Frontend:", frontend.exposedAt);
  ```

* TypeScript

  ```ts
  // Start and expose API server
  await sandbox.startProcess('node api.js', { env: { PORT: '8080' } });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const api = await sandbox.exposePort(8080, { name: 'api' });


  // Start and expose frontend
  await sandbox.startProcess('npm run dev', { env: { PORT: '5173' } });
  await new Promise(resolve => setTimeout(resolve, 2000));
  const frontend = await sandbox.exposePort(5173, { name: 'frontend' });


  console.log('Services:');
  console.log('- API:', api.exposedAt);
  console.log('- Frontend:', frontend.exposedAt);
  ```

## Wait for service readiness

Always verify a service is ready before exposing. Use a simple delay for most cases:

* JavaScript

  ```js
  // Start service
  await sandbox.startProcess("npm run dev", { env: { PORT: "8080" } });


  // Wait 2-3 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));


  // Now expose
  await sandbox.exposePort(8080);
  ```

* TypeScript

  ```ts
  // Start service
  await sandbox.startProcess('npm run dev', { env: { PORT: '8080' } });


  // Wait 2-3 seconds
  await new Promise(resolve => setTimeout(resolve, 2000));


  // Now expose
  await sandbox.exposePort(8080);
  ```

For critical services, poll the health endpoint:

* JavaScript

  ```js
  await sandbox.startProcess("node api-server.js", { env: { PORT: "8080" } });


  // Wait for health check
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));


    const check = await sandbox.exec(
      'curl -f http://localhost:8080/health || echo "not ready"',
    );
    if (check.stdout.includes("ok")) {
      break;
    }
  }


  await sandbox.exposePort(8080);
  ```

* TypeScript

  ```ts
  await sandbox.startProcess('node api-server.js', { env: { PORT: '8080' } });


  // Wait for health check
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));


    const check = await sandbox.exec('curl -f http://localhost:8080/health || echo "not ready"');
    if (check.stdout.includes('ok')) {
      break;
    }
  }


  await sandbox.exposePort(8080);
  ```

## Multiple services

Expose multiple ports for full-stack applications:

* JavaScript

  ```js
  // Start backend
  await sandbox.startProcess("node api/server.js", {
    env: { PORT: "8080" },
  });
  await new Promise((resolve) => setTimeout(resolve, 2000));


  // Start frontend
  await sandbox.startProcess("npm run dev", {
    cwd: "/workspace/frontend",
    env: { PORT: "5173", API_URL: "http://localhost:8080" },
  });
  await new Promise((resolve) => setTimeout(resolve, 3000));


  // Expose both
  const api = await sandbox.exposePort(8080, { name: "api" });
  const frontend = await sandbox.exposePort(5173, { name: "frontend" });


  return Response.json({
    api: api.exposedAt,
    frontend: frontend.exposedAt,
  });
  ```

* TypeScript

  ```ts
  // Start backend
  await sandbox.startProcess('node api/server.js', {
    env: { PORT: '8080' }
  });
  await new Promise(resolve => setTimeout(resolve, 2000));


  // Start frontend
  await sandbox.startProcess('npm run dev', {
    cwd: '/workspace/frontend',
    env: { PORT: '5173', API_URL: 'http://localhost:8080' }
  });
  await new Promise(resolve => setTimeout(resolve, 3000));


  // Expose both
  const api = await sandbox.exposePort(8080, { name: 'api' });
  const frontend = await sandbox.exposePort(5173, { name: 'frontend' });


  return Response.json({
    api: api.exposedAt,
    frontend: frontend.exposedAt
  });
  ```

## Manage exposed ports

### List currently exposed ports

* JavaScript

  ```js
  const { ports, count } = await sandbox.getExposedPorts();


  console.log(`${count} ports currently exposed:`);


  for (const port of ports) {
    console.log(`  Port ${port.port}: ${port.exposedAt}`);
    if (port.name) {
      console.log(`    Name: ${port.name}`);
    }
  }
  ```

* TypeScript

  ```ts
  const { ports, count } = await sandbox.getExposedPorts();


  console.log(`${count} ports currently exposed:`);


  for (const port of ports) {
    console.log(`  Port ${port.port}: ${port.exposedAt}`);
    if (port.name) {
      console.log(`    Name: ${port.name}`);
    }
  }
  ```

### Unexpose ports

* JavaScript

  ```js
  // Unexpose a single port
  await sandbox.unexposePort(8000);


  // Unexpose multiple ports
  for (const port of [3000, 5173, 8080]) {
    await sandbox.unexposePort(port);
  }
  ```

* TypeScript

  ```ts
  // Unexpose a single port
  await sandbox.unexposePort(8000);


  // Unexpose multiple ports
  for (const port of [3000, 5173, 8080]) {
    await sandbox.unexposePort(port);
  }
  ```

## Best practices

* **Wait for readiness** - Don't expose ports immediately after starting processes
* **Use named ports** - Easier to track when exposing multiple ports
* **Clean up** - Unexpose ports when done to prevent abandoned URLs
* **Add authentication** - Preview URLs are public; protect sensitive services

## Local development

When developing locally with `wrangler dev`, you must expose ports in your Dockerfile:

```dockerfile
FROM docker.io/cloudflare/sandbox:0.3.3


# Expose ports you plan to use
EXPOSE 8000
EXPOSE 8080
EXPOSE 5173
```

Update `wrangler.jsonc` to use your Dockerfile:

```jsonc
{
  "containers": [
    {
      "class_name": "Sandbox",
      "image": "./Dockerfile"
    }
  ]
}
```

In production, all ports are available and controlled programmatically via `exposePort()` / `unexposePort()`.

## Troubleshooting

### Port 3000 is reserved

Port 3000 is used by the internal Bun server and cannot be exposed:

* JavaScript

  ```js
  // ❌ This will fail
  await sandbox.exposePort(3000); // Error: Port 3000 is reserved


  // ✅ Use a different port
  await sandbox.startProcess("node server.js", { env: { PORT: "8080" } });
  await sandbox.exposePort(8080);
  ```

* TypeScript

  ```ts
  // ❌ This will fail
  await sandbox.exposePort(3000);  // Error: Port 3000 is reserved


  // ✅ Use a different port
  await sandbox.startProcess('node server.js', { env: { PORT: '8080' } });
  await sandbox.exposePort(8080);
  ```

### Port not ready

Wait for the service to start before exposing:

* JavaScript

  ```js
  await sandbox.startProcess("npm run dev");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await sandbox.exposePort(8080);
  ```

* TypeScript

  ```ts
  await sandbox.startProcess('npm run dev');
  await new Promise(resolve => setTimeout(resolve, 3000));
  await sandbox.exposePort(8080);
  ```

### Port already exposed

Check before exposing to avoid errors:

* JavaScript

  ```js
  const { ports } = await sandbox.getExposedPorts();
  if (!ports.some((p) => p.port === 8080)) {
    await sandbox.exposePort(8080);
  }
  ```

* TypeScript

  ```ts
  const { ports } = await sandbox.getExposedPorts();
  if (!ports.some(p => p.port === 8080)) {
    await sandbox.exposePort(8080);
  }
  ```

## Preview URL format

Preview URLs follow the pattern `https://{sandbox-id}-{port}.sandbox.workers.dev`:

* Port 8080: `https://abc123-8080.sandbox.workers.dev`
* Port 5173: `https://abc123-5173.sandbox.workers.dev`

**Note**: Port 3000 is reserved for the internal Bun server and cannot be exposed.

## Related resources

* [Ports API reference](https://developers.cloudflare.com/sandbox/api/ports/) - Complete port exposure API
* [Background processes guide](https://developers.cloudflare.com/sandbox/guides/background-processes/) - Managing services
* [Execute commands guide](https://developers.cloudflare.com/sandbox/guides/execute-commands/) - Starting services

---
title: Use code interpreter · Cloudflare Sandbox SDK docs
description: This guide shows you how to execute Python and JavaScript code with
  rich outputs using the Code Interpreter API.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/guides/code-execution/
  md: https://developers.cloudflare.com/sandbox/guides/code-execution/index.md
---

This guide shows you how to execute Python and JavaScript code with rich outputs using the Code Interpreter API.

## When to use code interpreter

Use the Code Interpreter API for **simple, direct code execution** with minimal setup:

* **Quick code execution** - Run Python/JS code without environment setup
* **Rich outputs** - Get charts, tables, images, HTML automatically
* **AI-generated code** - Execute LLM-generated code with structured results
* **Persistent state** - Variables preserved between executions in the same context

Use `exec()` for **advanced or custom workflows**:

* **System operations** - Install packages, manage files, run builds
* **Custom environments** - Configure specific versions, dependencies
* **Shell commands** - Git operations, system utilities, complex pipelines
* **Long-running processes** - Background services, servers

## Create an execution context

Code contexts maintain state between executions:

* JavaScript

  ```js
  import { getSandbox } from "@cloudflare/sandbox";


  const sandbox = getSandbox(env.Sandbox, "my-sandbox");


  // Create a Python context
  const pythonContext = await sandbox.createCodeContext({
    language: "python",
  });


  console.log("Context ID:", pythonContext.id);
  console.log("Language:", pythonContext.language);


  // Create a JavaScript context
  const jsContext = await sandbox.createCodeContext({
    language: "javascript",
  });
  ```

* TypeScript

  ```ts
  import { getSandbox } from '@cloudflare/sandbox';


  const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


  // Create a Python context
  const pythonContext = await sandbox.createCodeContext({
    language: 'python'
  });


  console.log('Context ID:', pythonContext.id);
  console.log('Language:', pythonContext.language);


  // Create a JavaScript context
  const jsContext = await sandbox.createCodeContext({
    language: 'javascript'
  });
  ```

## Execute code

### Simple execution

* JavaScript

  ```js
  // Create context
  const context = await sandbox.createCodeContext({
    language: "python",
  });


  // Execute code
  const result = await sandbox.runCode(
    context.id,
    `
  print("Hello from Code Interpreter!")
  result = 2 + 2
  print(f"2 + 2 = {result}")
  `,
  );


  console.log("Output:", result.output);
  console.log("Success:", result.success);
  ```

* TypeScript

  ```ts
  // Create context
  const context = await sandbox.createCodeContext({
    language: 'python'
  });


  // Execute code
  const result = await sandbox.runCode(context.id, `
  print("Hello from Code Interpreter!")
  result = 2 + 2
  print(f"2 + 2 = {result}")
  `);


  console.log('Output:', result.output);
  console.log('Success:', result.success);
  ```

### Persistent state

Variables and imports persist between executions in the same context:

* JavaScript

  ```js
  const context = await sandbox.createCodeContext({
    language: "python",
  });


  // First execution - import and define variables
  await sandbox.runCode(
    context.id,
    `
  import pandas as pd
  import numpy as np


  data = [1, 2, 3, 4, 5]
  print("Data initialized")
  `,
  );


  // Second execution - use previously defined variables
  const result = await sandbox.runCode(
    context.id,
    `
  mean = np.mean(data)
  print(f"Mean: {mean}")
  `,
  );


  console.log(result.output); // "Mean: 3.0"
  ```

* TypeScript

  ```ts
  const context = await sandbox.createCodeContext({
    language: 'python'
  });


  // First execution - import and define variables
  await sandbox.runCode(context.id, `
  import pandas as pd
  import numpy as np


  data = [1, 2, 3, 4, 5]
  print("Data initialized")
  `);


  // Second execution - use previously defined variables
  const result = await sandbox.runCode(context.id, `
  mean = np.mean(data)
  print(f"Mean: {mean}")
  `);


  console.log(result.output); // "Mean: 3.0"
  ```

## Handle rich outputs

The code interpreter returns multiple output formats:

* JavaScript

  ```js
  const result = await sandbox.runCode(
    context.id,
    `
  import matplotlib.pyplot as plt


  plt.plot([1, 2, 3], [1, 4, 9])
  plt.title('Simple Chart')
  plt.show()
  `,
  );


  // Check available formats
  console.log("Formats:", result.formats); // ['text', 'png']


  // Access outputs
  if (result.outputs.png) {
    // Return as image
    return new Response(atob(result.outputs.png), {
      headers: { "Content-Type": "image/png" },
    });
  }


  if (result.outputs.html) {
    // Return as HTML (pandas DataFrames)
    return new Response(result.outputs.html, {
      headers: { "Content-Type": "text/html" },
    });
  }


  if (result.outputs.json) {
    // Return as JSON
    return Response.json(result.outputs.json);
  }
  ```

* TypeScript

  ```ts
  const result = await sandbox.runCode(context.id, `
  import matplotlib.pyplot as plt


  plt.plot([1, 2, 3], [1, 4, 9])
  plt.title('Simple Chart')
  plt.show()
  `);


  // Check available formats
  console.log('Formats:', result.formats);  // ['text', 'png']


  // Access outputs
  if (result.outputs.png) {
    // Return as image
    return new Response(atob(result.outputs.png), {
      headers: { 'Content-Type': 'image/png' }
    });
  }


  if (result.outputs.html) {
    // Return as HTML (pandas DataFrames)
    return new Response(result.outputs.html, {
      headers: { 'Content-Type': 'text/html' }
    });
  }


  if (result.outputs.json) {
    // Return as JSON
    return Response.json(result.outputs.json);
  }
  ```

## Stream execution output

For long-running code, stream output in real-time:

* JavaScript

  ```js
  const context = await sandbox.createCodeContext({
    language: "python",
  });


  const result = await sandbox.runCode(
    context.id,
    `
  import time


  for i in range(10):
      print(f"Processing item {i+1}/10...")
      time.sleep(0.5)


  print("Done!")
  `,
    {
      stream: true,
      onOutput: (data) => {
        console.log("Output:", data);
      },
      onResult: (result) => {
        console.log("Result:", result);
      },
      onError: (error) => {
        console.error("Error:", error);
      },
    },
  );
  ```

* TypeScript

  ```ts
  const context = await sandbox.createCodeContext({
    language: 'python'
  });


  const result = await sandbox.runCode(
    context.id,
    `
  import time


  for i in range(10):
      print(f"Processing item {i+1}/10...")
      time.sleep(0.5)


  print("Done!")
  `,
    {
      stream: true,
      onOutput: (data) => {
        console.log('Output:', data);
      },
      onResult: (result) => {
        console.log('Result:', result);
      },
      onError: (error) => {
        console.error('Error:', error);
      }
    }
  );
  ```

## Execute AI-generated code

Run LLM-generated code safely in a sandbox:

* JavaScript

  ```js
  // 1. Generate code with Claude
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: "Write Python code to calculate fibonacci sequence up to 100",
        },
      ],
    }),
  });


  const { content } = await response.json();
  const code = content[0].text;


  // 2. Execute in sandbox
  const context = await sandbox.createCodeContext({ language: "python" });
  const result = await sandbox.runCode(context.id, code);


  console.log("Generated code:", code);
  console.log("Output:", result.output);
  console.log("Success:", result.success);
  ```

* TypeScript

  ```ts
  // 1. Generate code with Claude
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: 'Write Python code to calculate fibonacci sequence up to 100'
      }]
    })
  });


  const { content } = await response.json();
  const code = content[0].text;


  // 2. Execute in sandbox
  const context = await sandbox.createCodeContext({ language: 'python' });
  const result = await sandbox.runCode(context.id, code);


  console.log('Generated code:', code);
  console.log('Output:', result.output);
  console.log('Success:', result.success);
  ```

## Manage contexts

### List all contexts

* JavaScript

  ```js
  const contexts = await sandbox.listCodeContexts();


  console.log(`${contexts.length} active contexts:`);


  for (const ctx of contexts) {
    console.log(`  ${ctx.id} (${ctx.language})`);
  }
  ```

* TypeScript

  ```ts
  const contexts = await sandbox.listCodeContexts();


  console.log(`${contexts.length} active contexts:`);


  for (const ctx of contexts) {
    console.log(`  ${ctx.id} (${ctx.language})`);
  }
  ```

### Delete contexts

* JavaScript

  ```js
  // Delete specific context
  await sandbox.deleteCodeContext(context.id);
  console.log("Context deleted");


  // Clean up all contexts
  const contexts = await sandbox.listCodeContexts();
  for (const ctx of contexts) {
    await sandbox.deleteCodeContext(ctx.id);
  }
  console.log("All contexts deleted");
  ```

* TypeScript

  ```ts
  // Delete specific context
  await sandbox.deleteCodeContext(context.id);
  console.log('Context deleted');


  // Clean up all contexts
  const contexts = await sandbox.listCodeContexts();
  for (const ctx of contexts) {
    await sandbox.deleteCodeContext(ctx.id);
  }
  console.log('All contexts deleted');
  ```

## Best practices

* **Clean up contexts** - Delete contexts when done to free resources
* **Handle errors** - Always check `result.success` and `result.error`
* **Stream long operations** - Use streaming for code that takes >2 seconds
* **Validate AI code** - Review generated code before execution

## Related resources

* [Code Interpreter API reference](https://developers.cloudflare.com/sandbox/api/interpreter/) - Complete API documentation
* [AI code executor tutorial](https://developers.cloudflare.com/sandbox/tutorials/ai-code-executor/) - Build complete AI executor
* [Execute commands guide](https://developers.cloudflare.com/sandbox/guides/execute-commands/) - Lower-level command execution


---
title: Work with Git · Cloudflare Sandbox SDK docs
description: This guide shows you how to clone repositories, manage branches,
  and automate Git operations in the sandbox.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/guides/git-workflows/
  md: https://developers.cloudflare.com/sandbox/guides/git-workflows/index.md
---

This guide shows you how to clone repositories, manage branches, and automate Git operations in the sandbox.

## Clone repositories

* JavaScript

  ```js
  import { getSandbox } from "@cloudflare/sandbox";


  const sandbox = getSandbox(env.Sandbox, "my-sandbox");


  // Basic clone
  await sandbox.gitCheckout("https://github.com/user/repo");


  // Clone specific branch
  await sandbox.gitCheckout("https://github.com/user/repo", {
    branch: "develop",
  });


  // Shallow clone (faster for large repos)
  await sandbox.gitCheckout("https://github.com/user/large-repo", {
    depth: 1,
  });


  // Clone to specific directory
  await sandbox.gitCheckout("https://github.com/user/my-app", {
    targetDir: "/workspace/project",
  });
  ```

* TypeScript

  ```ts
  import { getSandbox } from '@cloudflare/sandbox';


  const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


  // Basic clone
  await sandbox.gitCheckout('https://github.com/user/repo');


  // Clone specific branch
  await sandbox.gitCheckout('https://github.com/user/repo', {
    branch: 'develop'
  });


  // Shallow clone (faster for large repos)
  await sandbox.gitCheckout('https://github.com/user/large-repo', {
    depth: 1
  });


  // Clone to specific directory
  await sandbox.gitCheckout('https://github.com/user/my-app', {
    targetDir: '/workspace/project'
  });
  ```

## Clone private repositories

Use a personal access token in the URL:

* JavaScript

  ```js
  const token = env.GITHUB_TOKEN;
  const repoUrl = `https://${token}@github.com/user/private-repo.git`;


  await sandbox.gitCheckout(repoUrl);
  ```

* TypeScript

  ```ts
  const token = env.GITHUB_TOKEN;
  const repoUrl = `https://${token}@github.com/user/private-repo.git`;


  await sandbox.gitCheckout(repoUrl);
  ```

## Clone and build

Clone a repository and run build steps:

* JavaScript

  ```js
  await sandbox.gitCheckout("https://github.com/user/my-app");


  const repoName = "my-app";


  // Install and build
  await sandbox.exec(`cd ${repoName} && npm install`);
  await sandbox.exec(`cd ${repoName} && npm run build`);


  console.log("Build complete");
  ```

* TypeScript

  ```ts
  await sandbox.gitCheckout('https://github.com/user/my-app');


  const repoName = 'my-app';


  // Install and build
  await sandbox.exec(`cd ${repoName} && npm install`);
  await sandbox.exec(`cd ${repoName} && npm run build`);


  console.log('Build complete');
  ```

## Work with branches

* JavaScript

  ```js
  await sandbox.gitCheckout("https://github.com/user/repo");


  // Switch branches
  await sandbox.exec("cd repo && git checkout feature-branch");


  // Create new branch
  await sandbox.exec("cd repo && git checkout -b new-feature");
  ```

* TypeScript

  ```ts
  await sandbox.gitCheckout('https://github.com/user/repo');


  // Switch branches
  await sandbox.exec('cd repo && git checkout feature-branch');


  // Create new branch
  await sandbox.exec('cd repo && git checkout -b new-feature');
  ```

## Make changes and commit

* JavaScript

  ```js
  await sandbox.gitCheckout("https://github.com/user/repo");


  // Modify a file
  const readme = await sandbox.readFile("/workspace/repo/README.md");
  await sandbox.writeFile(
    "/workspace/repo/README.md",
    readme.content + "\n\n## New Section",
  );


  // Commit changes
  await sandbox.exec('cd repo && git config user.name "Sandbox Bot"');
  await sandbox.exec('cd repo && git config user.email "bot@example.com"');
  await sandbox.exec("cd repo && git add README.md");
  await sandbox.exec('cd repo && git commit -m "Update README"');
  ```

* TypeScript

  ```ts
  await sandbox.gitCheckout('https://github.com/user/repo');


  // Modify a file
  const readme = await sandbox.readFile('/workspace/repo/README.md');
  await sandbox.writeFile('/workspace/repo/README.md', readme.content + '\n\n## New Section');


  // Commit changes
  await sandbox.exec('cd repo && git config user.name "Sandbox Bot"');
  await sandbox.exec('cd repo && git config user.email "bot@example.com"');
  await sandbox.exec('cd repo && git add README.md');
  await sandbox.exec('cd repo && git commit -m "Update README"');
  ```

## Best practices

* **Use shallow clones** - Faster for large repos with `depth: 1`
* **Store credentials securely** - Use environment variables for tokens
* **Clean up** - Delete unused repositories to save space

## Troubleshooting

### Authentication fails

Verify your token is set:

* JavaScript

  ```js
  if (!env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN not configured");
  }


  const repoUrl = `https://${env.GITHUB_TOKEN}@github.com/user/private-repo.git`;
  await sandbox.gitCheckout(repoUrl);
  ```

* TypeScript

  ```ts
  if (!env.GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN not configured');
  }


  const repoUrl = `https://${env.GITHUB_TOKEN}@github.com/user/private-repo.git`;
  await sandbox.gitCheckout(repoUrl);
  ```

### Large repository timeout

Use shallow clone:

* JavaScript

  ```js
  await sandbox.gitCheckout("https://github.com/user/large-repo", {
    depth: 1,
  });
  ```

* TypeScript

  ```ts
  await sandbox.gitCheckout('https://github.com/user/large-repo', {
    depth: 1
  });
  ```

## Related resources

* [Files API reference](https://developers.cloudflare.com/sandbox/api/files/) - File operations after cloning
* [Execute commands guide](https://developers.cloudflare.com/sandbox/guides/execute-commands/) - Run git commands
* [Manage files guide](https://developers.cloudflare.com/sandbox/guides/manage-files/) - Work with cloned files


---
title: Stream output · Cloudflare Sandbox SDK docs
description: This guide shows you how to handle real-time output from commands,
  processes, and code execution.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/guides/streaming-output/
  md: https://developers.cloudflare.com/sandbox/guides/streaming-output/index.md
---

This guide shows you how to handle real-time output from commands, processes, and code execution.

## When to use streaming

Use streaming when you need:

* **Real-time feedback** - Show progress as it happens
* **Long-running operations** - Builds, tests, installations that take time
* **Interactive applications** - Chat bots, code execution, live demos
* **Large output** - Process output incrementally instead of all at once
* **User experience** - Prevent users from waiting with no feedback

Use non-streaming (`exec()`) for:

* **Quick operations** - Commands that complete in seconds
* **Small output** - When output fits easily in memory
* **Post-processing** - When you need complete output before processing

## Stream command execution

Use `execStream()` to get real-time output:

* JavaScript

  ```js
  import { getSandbox, parseSSEStream } from "@cloudflare/sandbox";


  const sandbox = getSandbox(env.Sandbox, "my-sandbox");


  const stream = await sandbox.execStream("npm run build");


  for await (const event of parseSSEStream(stream)) {
    switch (event.type) {
      case "stdout":
        console.log(event.data);
        break;


      case "stderr":
        console.error(event.data);
        break;


      case "complete":
        console.log("Exit code:", event.exitCode);
        break;


      case "error":
        console.error("Failed:", event.error);
        break;
    }
  }
  ```

* TypeScript

  ```ts
  import { getSandbox, parseSSEStream, type ExecEvent } from '@cloudflare/sandbox';


  const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


  const stream = await sandbox.execStream('npm run build');


  for await (const event of parseSSEStream<ExecEvent>(stream)) {
    switch (event.type) {
      case 'stdout':
        console.log(event.data);
        break;


      case 'stderr':
        console.error(event.data);
        break;


      case 'complete':
        console.log('Exit code:', event.exitCode);
        break;


      case 'error':
        console.error('Failed:', event.error);
        break;
    }
  }
  ```

## Stream to client

Return streaming output to users via Server-Sent Events:

* JavaScript

  ```js
  export default {
    async fetch(request, env) {
      const sandbox = getSandbox(env.Sandbox, "builder");


      const stream = await sandbox.execStream("npm run build");


      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    },
  };
  ```

* TypeScript

  ```ts
  export default {
    async fetch(request: Request, env: Env): Promise<Response> {
      const sandbox = getSandbox(env.Sandbox, 'builder');


      const stream = await sandbox.execStream('npm run build');


      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache'
        }
      });
    }
  };
  ```

Client-side consumption:

* JavaScript

  ```js
  // Browser JavaScript
  const eventSource = new EventSource("/build");


  eventSource.addEventListener("stdout", (event) => {
    const data = JSON.parse(event.data);
    console.log(data.data);
  });


  eventSource.addEventListener("complete", (event) => {
    const data = JSON.parse(event.data);
    console.log("Exit code:", data.exitCode);
    eventSource.close();
  });
  ```

* TypeScript

  ```ts
  // Browser JavaScript
  const eventSource = new EventSource('/build');


  eventSource.addEventListener('stdout', (event) => {
    const data = JSON.parse(event.data);
    console.log(data.data);
  });


  eventSource.addEventListener('complete', (event) => {
    const data = JSON.parse(event.data);
    console.log('Exit code:', data.exitCode);
    eventSource.close();
  });
  ```

## Stream process logs

Monitor background process output:

* JavaScript

  ```js
  import { parseSSEStream } from "@cloudflare/sandbox";


  const process = await sandbox.startProcess("node server.js");


  const logStream = await sandbox.streamProcessLogs(process.id);


  for await (const log of parseSSEStream(logStream)) {
    console.log(log.data);


    if (log.data.includes("Server listening")) {
      console.log("Server is ready");
      break;
    }
  }
  ```

* TypeScript

  ```ts
  import { parseSSEStream, type LogEvent } from '@cloudflare/sandbox';


  const process = await sandbox.startProcess('node server.js');


  const logStream = await sandbox.streamProcessLogs(process.id);


  for await (const log of parseSSEStream<LogEvent>(logStream)) {
    console.log(log.data);


    if (log.data.includes('Server listening')) {
      console.log('Server is ready');
      break;
    }
  }
  ```

## Handle errors

Check exit codes and handle stream errors:

* JavaScript

  ```js
  const stream = await sandbox.execStream("npm run build");


  for await (const event of parseSSEStream(stream)) {
    switch (event.type) {
      case "stdout":
        console.log(event.data);
        break;


      case "error":
        throw new Error(`Build failed: ${event.error}`);


      case "complete":
        if (event.exitCode !== 0) {
          throw new Error(`Build failed with exit code ${event.exitCode}`);
        }
        break;
    }
  }
  ```

* TypeScript

  ```ts
  const stream = await sandbox.execStream('npm run build');


  for await (const event of parseSSEStream<ExecEvent>(stream)) {
    switch (event.type) {
      case 'stdout':
        console.log(event.data);
        break;


      case 'error':
        throw new Error(`Build failed: ${event.error}`);


      case 'complete':
        if (event.exitCode !== 0) {
          throw new Error(`Build failed with exit code ${event.exitCode}`);
        }
        break;
    }
  }
  ```

## Best practices

* **Always consume streams** - Don't let streams hang unconsumed
* **Handle all event types** - Process stdout, stderr, complete, and error events
* **Check exit codes** - Non-zero exit codes indicate failure
* **Provide feedback** - Show progress to users for long operations

## Related resources

* [Commands API reference](https://developers.cloudflare.com/sandbox/api/commands/) - Complete streaming API
* [Execute commands guide](https://developers.cloudflare.com/sandbox/guides/execute-commands/) - Command execution patterns
* [Background processes guide](https://developers.cloudflare.com/sandbox/guides/background-processes/) - Process log streaming
* [Code Interpreter guide](https://developers.cloudflare.com/sandbox/guides/code-execution/) - Stream code execution output


---
title: Architecture · Cloudflare Sandbox SDK docs
description: "The Sandbox SDK provides isolated code execution environments on
  Cloudflare's edge network. It combines three Cloudflare technologies:"
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/concepts/architecture/
  md: https://developers.cloudflare.com/sandbox/concepts/architecture/index.md
---

The Sandbox SDK provides isolated code execution environments on Cloudflare's edge network. It combines three Cloudflare technologies:

* **Workers** - JavaScript runtime at the edge
* **Durable Objects** - Stateful compute with persistent storage
* **Containers** - Isolated execution environments with full Linux capabilities

## Three-layer architecture

```plaintext
┌─────────────────────────────────────────────────────────┐
│                     Your Application                    │
│                    (Cloudflare Worker)                  │
└───────────────────────────┬─────────────────────────────┘
                            ├─ getSandbox()
                            ├─ exec()
                            ├─ writeFile()
                            │
           ┌────────────────▼──────────────────┐
           │ Container-enabled Durable Object  │
           │ (SDK methods via RPC from Worker) │
           └───────────────────────────────────┘
                            │ HTTP/JSON
                            │
                    ┌───────▼───────┐
                    │ Durable Object │ Layer 2: State Management
                    │  (Persistent)  │
                    └───────┬───────┘
                            │ Container Protocol
                            │
                    ┌───────▼───────┐
                    │   Container   │ Layer 3: Isolated Execution
                    │  (Linux + Bun) │
                    └───────────────┘
```

### Layer 1: Client SDK

The developer-facing API you use in your Workers:

```typescript
import { getSandbox } from "@cloudflare/sandbox";


const sandbox = getSandbox(env.Sandbox, "my-sandbox");
const result = await sandbox.exec("python script.py");
```

**Purpose**: Provide a clean, type-safe TypeScript interface for all sandbox operations.

### Layer 2: Durable Object

Manages sandbox lifecycle and routing:

```typescript
export class Sandbox extends DurableObject<Env> {
  // Extends Cloudflare Container for isolation
  // Routes requests between client and container
  // Manages preview URLs and state
}
```

**Purpose**: Provide persistent, stateful sandbox instances with unique identities.

**Why Durable Objects**:

* **Persistent identity** - Same sandbox ID always routes to same instance
* **State management** - Filesystem and processes persist between requests
* **Geographic distribution** - Sandboxes run close to users
* **Automatic scaling** - Cloudflare manages provisioning

### Layer 3: Container Runtime

Executes code in isolation with full Linux capabilities.

**Purpose**: Safely execute untrusted code.

**Why containers**:

* **True isolation** - Process-level isolation with namespaces
* **Full environment** - Real Linux with Python, Node.js, Git, etc.
* **Resource limits** - CPU, memory, disk constraints

## Request flow

When you execute a command:

```typescript
await sandbox.exec("python script.py");
```

1. **Client SDK** validates parameters and sends HTTP request to Durable Object
2. **Durable Object** authenticates and routes to container runtime
3. **Container Runtime** validates inputs, executes command, captures output
4. **Response flows back** through all layers with proper error transformation

## State persistence

Sandboxes maintain state across requests:

**Filesystem**:

```typescript
// Request 1
await sandbox.writeFile("/workspace/data.txt", "hello");


// Request 2 (minutes later)
const file = await sandbox.readFile("/workspace/data.txt");
// Returns 'hello' - file persisted
```

**Processes**:

```typescript
// Request 1
await sandbox.startProcess("node server.js");


// Request 2 (minutes later)
const processes = await sandbox.listProcesses();
// Server still running
```

## Performance

**Cold start**: 100-300ms (container initialization)\
**Warm start**: <10ms (reuse existing container)\
**Network latency**: 10-50ms (edge-to-edge)

## Related resources

* [Sandbox lifecycle](https://developers.cloudflare.com/sandbox/concepts/sandboxes/) - How sandboxes are created and managed
* [Container runtime](https://developers.cloudflare.com/sandbox/concepts/containers/) - Inside the execution environment
* [Security model](https://developers.cloudflare.com/sandbox/concepts/security/) - How isolation and validation work
* [Session management](https://developers.cloudflare.com/sandbox/concepts/sessions/) - Advanced state management


---
title: Sandbox lifecycle · Cloudflare Sandbox SDK docs
description: "A sandbox is an isolated execution environment where your code
  runs. Each sandbox:"
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/concepts/sandboxes/
  md: https://developers.cloudflare.com/sandbox/concepts/sandboxes/index.md
---

A sandbox is an isolated execution environment where your code runs. Each sandbox:

* Has a unique identifier (sandbox ID)
* Contains an isolated filesystem
* Runs in a dedicated Linux container
* Persists state between requests
* Exists as a Cloudflare Durable Object

## Lifecycle states

### Creation

A sandbox is created the first time you reference its ID:

```typescript
const sandbox = getSandbox(env.Sandbox, 'user-123');
await sandbox.exec('echo "Hello"'); // First request creates sandbox
```

**Duration**: 100-300ms (cold start) or <10ms (if warm)

### Active

The sandbox is running and processing requests. Filesystem, processes, and environment variables persist across requests.

### Idle

After inactivity, the sandbox may enter idle state. Filesystem state is preserved, but the container may be paused. Next request triggers a warm start.

### Destruction

Sandboxes are explicitly destroyed or automatically cleaned up:

```typescript
await sandbox.destroy();
// All files, processes, and state deleted permanently
```

## Persistence

Between requests to the same sandbox:

**What persists**:

* Files in `/workspace`, `/tmp`, `/home`
* Background processes (started with `startProcess()`)
* Code interpreter contexts and variables
* Environment variables and port exposures

**What doesn't persist**:

* Nothing survives `destroy()`
* Background processes may stop after container restarts (rare)

## Naming strategies

### Per-user sandboxes

```typescript
const sandbox = getSandbox(env.Sandbox, `user-${userId}`);
```

User's work persists across sessions. Good for interactive environments, playgrounds, and notebooks.

### Per-session sandboxes

```typescript
const sessionId = `session-${Date.now()}-${Math.random()}`;
const sandbox = getSandbox(env.Sandbox, sessionId);
// Later:
await sandbox.destroy();
```

Fresh environment each time. Good for one-time execution, CI/CD, and isolated tests.

### Per-task sandboxes

```typescript
const sandbox = getSandbox(env.Sandbox, `build-${repoName}-${commit}`);
```

Idempotent operations with clear task-to-sandbox mapping. Good for builds, pipelines, and background jobs.

## Request routing

The first request to a sandbox determines its geographic location. Subsequent requests route to the same location.

**For global apps**:

* Option 1: Multiple sandboxes per user with region suffix (`user-123-us`, `user-123-eu`)
* Option 2: Single sandbox per user (simpler, but some users see higher latency)

## Lifecycle management

### When to destroy

```typescript
try {
  const sandbox = getSandbox(env.Sandbox, sessionId);
  await sandbox.exec('npm run build');
} finally {
  await sandbox.destroy(); // Clean up temporary sandboxes
}
```

**Destroy when**: Session ends, task completes, resources no longer needed

**Don't destroy**: Personal environments, long-running services

### Failure recovery

If container crashes or Durable Object is evicted (rare):

```typescript
try {
  await sandbox.exec('command');
} catch (error) {
  if (error.message.includes('container') || error.message.includes('connection')) {
    await sandbox.exec('command'); // Retry - container recreates
  }
}
```

## Best practices

* **Name consistently** - Use clear, predictable naming schemes
* **Clean up temporary sandboxes** - Always destroy when done
* **Reuse long-lived sandboxes** - One per user is often sufficient
* **Batch operations** - Combine commands: `npm install && npm test && npm build`
* **Handle failures** - Design for container restarts

## Related resources

* [Architecture](https://developers.cloudflare.com/sandbox/concepts/architecture/) - How sandboxes fit in the system
* [Container runtime](https://developers.cloudflare.com/sandbox/concepts/containers/) - What runs inside sandboxes
* [Session management](https://developers.cloudflare.com/sandbox/concepts/sessions/) - Advanced state isolation
* [Sessions API](https://developers.cloudflare.com/sandbox/api/sessions/) - Programmatic lifecycle control

---
title: Container runtime · Cloudflare Sandbox SDK docs
description: Each sandbox runs in an isolated Linux container based on Ubuntu 22.04.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/concepts/containers/
  md: https://developers.cloudflare.com/sandbox/concepts/containers/index.md
---

Each sandbox runs in an isolated Linux container based on Ubuntu 22.04.

## Pre-installed software

The base container comes pre-packaged with a full development environment:

**Languages and runtimes**:

* Python 3.11 (with pip)
* Node.js 20 LTS (with npm)
* Bun (JavaScript/TypeScript runtime)

**Python packages**:

* NumPy - Numerical computing
* pandas - Data analysis
* Matplotlib - Plotting and visualization
* IPython - Interactive Python

**Development tools**:

* Git - Version control
* Build tools (gcc, make, pkg-config)
* Text editors (vim, nano)
* Process monitoring (htop, procps)

**Utilities**:

* curl, wget - HTTP clients
* jq - JSON processor
* Network tools (ping, dig, netstat)
* Compression (zip, unzip)

Install additional software at runtime or [customize the base image](https://developers.cloudflare.com/sandbox/configuration/dockerfile/):

```bash
# Python packages
pip install scikit-learn tensorflow


# Node.js packages
npm install express


# System packages
apt-get install redis-server
```

## Filesystem

The container provides a standard Linux filesystem. You can read and write anywhere you have permissions.

**Standard directories**:

* `/workspace` - Default working directory for user code
* `/tmp` - Temporary files
* `/home` - User home directory
* `/usr/bin`, `/usr/local/bin` - Executable binaries

**Example**:

```typescript
await sandbox.writeFile('/workspace/app.py', 'print("Hello")');
await sandbox.writeFile('/tmp/cache.json', '{}');
await sandbox.exec('ls -la /workspace');
```

## Process management

Processes run as you'd expect in a regular Linux environment.

**Foreground processes** (`exec()`):

```typescript
const result = await sandbox.exec('npm test');
// Waits for completion, returns output
```

**Background processes** (`startProcess()`):

```typescript
const process = await sandbox.startProcess('node server.js');
// Returns immediately, process runs in background
```

## Network capabilities

**Outbound connections** work:

```bash
curl https://api.example.com/data
pip install requests
npm install express
```

**Inbound connections** require port exposure:

```typescript
await sandbox.startProcess('python -m http.server 8000');
const exposed = await sandbox.exposePort(8000);
console.log(exposed.exposedAt); // Public URL
```

**Localhost** works within sandbox:

```bash
redis-server &      # Start server
redis-cli ping      # Connect locally
```

## Security

**Between sandboxes** (isolated):

* Each sandbox is a separate container
* Filesystem, memory and network are all isolated

**Within sandbox** (shared):

* All processes see the same files
* Processes can communicate with each other
* Environment variables are session-scoped

To run untrusted code, use separate sandboxes per user:

```typescript
const sandbox = getSandbox(env.Sandbox, `user-${userId}`);
```

## Limitations

**Cannot**:

* Load kernel modules or access host hardware
* Run nested containers (no Docker-in-Docker)

## Related resources

* [Architecture](https://developers.cloudflare.com/sandbox/concepts/architecture/) - How containers fit in the system
* [Security model](https://developers.cloudflare.com/sandbox/concepts/security/) - Container isolation details
* [Sandbox lifecycle](https://developers.cloudflare.com/sandbox/concepts/sandboxes/) - Container lifecycle management


---
title: Session management · Cloudflare Sandbox SDK docs
description: Sessions are bash shell execution contexts within a sandbox. Think
  of them like terminal tabs or panes in the same container.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/concepts/sessions/
  md: https://developers.cloudflare.com/sandbox/concepts/sessions/index.md
---

Sessions are bash shell execution contexts within a sandbox. Think of them like terminal tabs or panes in the same container.

* **Sandbox** = A computer (container)
* **Session** = A terminal shell session in that computer

## Default session

Every sandbox has a default session that maintains shell state across commands:

```typescript
const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


// These commands run in the default session
await sandbox.exec("cd /app");
await sandbox.exec("pwd");  // Output: /app


await sandbox.exec("export MY_VAR=hello");
await sandbox.exec("echo $MY_VAR");  // Output: hello
```

Shell state persists: working directory, environment variables, exported variables all carry over between commands.

## Creating sessions

Create additional sessions for isolated shell contexts:

```typescript
const buildSession = await sandbox.createSession({
  name: "build",
  env: { NODE_ENV: "production" },
  cwd: "/build"
});


const testSession = await sandbox.createSession({
  name: "test",
  env: { NODE_ENV: "test" },
  cwd: "/test"
});


// Different shell contexts
await buildSession.exec("npm run build");
await testSession.exec("npm test");
```

## What's isolated per session

Each session has its own:

**Shell environment**:

```typescript
await session1.exec("export MY_VAR=hello");
await session2.exec("echo $MY_VAR");  // Empty - different shell
```

**Working directory**:

```typescript
await session1.exec("cd /workspace/project1");
await session2.exec("pwd");  // Different working directory
```

**Environment variables** (set via `createSession` options):

```typescript
const session1 = await sandbox.createSession({
  env: { API_KEY: 'key-1' }
});
const session2 = await sandbox.createSession({
  env: { API_KEY: 'key-2' }
});
```

## What's shared

All sessions in a sandbox share:

**Filesystem**:

```typescript
await session1.writeFile('/workspace/file.txt', 'data');
await session2.readFile('/workspace/file.txt');  // Can read it
```

**Processes**:

```typescript
await session1.startProcess('node server.js');
await session2.listProcesses();  // Sees the server
```

**Ports**:

```typescript
await session1.exposePort(3000);
await session2.getExposedPorts();  // Sees port 3000
```

## When to use sessions

**Use sessions when**:

* You need isolated shell state for different tasks
* Running parallel operations with different environments
* Keeping AI agent credentials separate from app runtime

**Example - separate dev and runtime environments**:

```typescript
// Phase 1: AI agent writes code (with API keys)
const devSession = await sandbox.createSession({
  name: "dev",
  env: { ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY }
});
await devSession.exec('ai-tool "build a web server"');


// Phase 2: Run the code (without API keys)
const appSession = await sandbox.createSession({
  name: "app",
  env: { PORT: "3000" }
});
await appSession.exec("node server.js");
```

**Use separate sandboxes when**:

* You need complete isolation (untrusted code)
* Different users require fully separated environments
* Independent resource allocation is needed

## Best practices

**Clean up temporary sessions**:

```typescript
try {
  const session = await sandbox.createSession({ name: 'temp' });
  await session.exec('command');
} finally {
  await sandbox.deleteSession('temp');
}
```

**Sessions share filesystem**:

```typescript
// Bad - affects all sessions
await session.exec('rm -rf /workspace/*');


// Use separate sandboxes for untrusted isolation
const userSandbox = getSandbox(env.Sandbox, userId);
```

## Related resources

* [Sandbox lifecycle](https://developers.cloudflare.com/sandbox/concepts/sandboxes/) - Understanding sandbox management
* [Sessions API](https://developers.cloudflare.com/sandbox/api/sessions/) - Complete session API reference


---
title: Preview URLs · Cloudflare Sandbox SDK docs
description: Preview URLs provide public access to services running inside
  sandboxes. When you expose a port, you get a unique HTTPS URL that proxies
  requests to your service.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/concepts/preview-urls/
  md: https://developers.cloudflare.com/sandbox/concepts/preview-urls/index.md
---

Preview URLs provide public access to services running inside sandboxes. When you expose a port, you get a unique HTTPS URL that proxies requests to your service.

```typescript
await sandbox.startProcess('python -m http.server 8000');
const exposed = await sandbox.exposePort(8000);


console.log(exposed.exposedAt);
// https://abc123-8000.sandbox.workers.dev
```

## URL format

Preview URLs follow this pattern:

```plaintext
https://{sandbox-id}-{port}.sandbox.workers.dev
```

**Examples**:

* Port 3000: `https://abc123-3000.sandbox.workers.dev`
* Port 8080: `https://abc123-8080.sandbox.workers.dev`

**URL stability**: URLs remain the same for a given sandbox ID and port. You can share, bookmark, or use them in webhooks.

## Request routing

```plaintext
User's Browser
     ↓ HTTPS
Your Worker
     ↓
Durable Object (sandbox)
     ↓ HTTP
Your Service (on exposed port)
```

**Important**: You must handle preview URL routing in your Worker using `proxyToSandbox()`:

```typescript
import { proxyToSandbox, getSandbox } from "@cloudflare/sandbox";


export default {
  async fetch(request, env) {
    // Route preview URL requests to sandboxes
    const proxyResponse = await proxyToSandbox(request, env);
    if (proxyResponse) return proxyResponse;


    // Your custom routes here
    // ...
  }
};
```

Without this, preview URLs won't work.

## Multiple ports

Expose multiple services simultaneously:

```typescript
await sandbox.startProcess('node api.js');      // Port 3000
await sandbox.startProcess('node admin.js');    // Port 3001


const api = await sandbox.exposePort(3000, { name: 'api' });
const admin = await sandbox.exposePort(3001, { name: 'admin' });


// Each gets its own URL:
// https://abc123-3000.sandbox.workers.dev
// https://abc123-3001.sandbox.workers.dev
```

## What works

* HTTP/HTTPS requests
* WebSocket (WSS) via HTTP upgrade
* Server-Sent Events
* All HTTP methods (GET, POST, PUT, DELETE, etc.)
* Request and response headers

## What doesn't work

* Raw TCP/UDP connections
* Custom protocols (must wrap in HTTP)
* Ports 80/443 (use 1024+)

## Security

Warning

Preview URLs are publicly accessible. Anyone with the URL can access your service.

**Add authentication in your service**:

```python
from flask import Flask, request, abort


app = Flask(__name__)


@app.route('/data')
def get_data():
    token = request.headers.get('Authorization')
    if token != 'Bearer secret-token':
        abort(401)
    return {'data': 'protected'}
```

**Security features**:

* All traffic is HTTPS (automatic TLS)
* URLs use random sandbox IDs (hard to guess)
* You control authentication in your service

## Troubleshooting

### URL not accessible

Check if service is running and listening:

```typescript
// 1. Is service running?
const processes = await sandbox.listProcesses();


// 2. Is port exposed?
const ports = await sandbox.getExposedPorts();


// 3. Is service binding to 0.0.0.0 (not 127.0.0.1)?
// Good:
app.run(host='0.0.0.0', port=3000)


// Bad (localhost only):
app.run(host='127.0.0.1', port=3000)
```

## Best practices

**Service design**:

* Bind to `0.0.0.0` to make accessible
* Add authentication (don't rely on URL secrecy)
* Include health check endpoints
* Handle CORS if accessed from browsers

**Cleanup**:

* Unexpose ports when done: `await sandbox.unexposePort(port)`
* Stop processes: `await sandbox.killAllProcesses()`

## Local development

Local development only

When using `wrangler dev`, you must expose ports in your Dockerfile:

```dockerfile
FROM docker.io/cloudflare/sandbox:0.3.3


# Required for local development
EXPOSE 3000
EXPOSE 8080
```

Without `EXPOSE`, you'll see: `connect(): Connection refused: container port not found`

This is **only required for local development**. In production, all container ports are automatically accessible.

## Related resources

* [Ports API reference](https://developers.cloudflare.com/sandbox/api/ports/) - Complete port exposure API
* [Expose services guide](https://developers.cloudflare.com/sandbox/guides/expose-services/) - Practical patterns


---
title: Configuration · Cloudflare Sandbox SDK docs
description: Configure your Sandbox SDK deployment with Wrangler, customize
  container images, and manage environment variables.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/configuration/
  md: https://developers.cloudflare.com/sandbox/configuration/index.md
---

Configure your Sandbox SDK deployment with Wrangler, customize container images, and manage environment variables.

[Wrangler configuration](https://developers.cloudflare.com/sandbox/configuration/wrangler/)

Configure Durable Objects bindings, container images, and Worker settings in wrangler.jsonc.

[Dockerfile reference](https://developers.cloudflare.com/sandbox/configuration/dockerfile/)

Customize the sandbox container image with your own packages, tools, and configurations.

[Environment variables](https://developers.cloudflare.com/sandbox/configuration/environment-variables/)

Pass configuration and secrets to your sandboxes using environment variables.

## Quick reference

### Essential wrangler.jsonc settings

```jsonc
{
  "name": "my-worker",
  "main": "src/index.ts",
  "compatibility_date": "2024-09-02",
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [
      {
        "name": "Sandbox",
        "class_name": "Sandbox",
        "script_name": "@cloudflare/sandbox"
      }
    ]
  },
  "containers": [
    {
      "binding": "CONTAINER",
      "image": "ghcr.io/cloudflare/sandbox-runtime:latest"
    }
  ]
}
```

### Common Dockerfile customizations

```dockerfile
FROM ghcr.io/cloudflare/sandbox-runtime:latest


# Install additional Python packages
RUN pip install scikit-learn tensorflow pandas


# Install Node.js packages globally
RUN npm install -g typescript ts-node


# Install system packages
RUN apt-get update && apt-get install -y postgresql-client


# Add custom scripts
COPY ./scripts /usr/local/bin/
```

### Environment variables

```typescript
// Pass to sandbox at creation
const sandbox = getSandbox(env.Sandbox, 'my-sandbox');


// Configure environment for commands
await sandbox.exec('node app.js', {
  env: {
    NODE_ENV: 'production',
    API_KEY: env.API_KEY,
    DATABASE_URL: env.DATABASE_URL
  }
});
```

## Related resources

* [Get Started guide](https://developers.cloudflare.com/sandbox/get-started/) - Initial setup walkthrough
* [Wrangler documentation](https://developers.cloudflare.com/workers/wrangler/) - Complete Wrangler reference
* [Docker documentation](https://docs.docker.com/engine/reference/builder/) - Dockerfile syntax
* [Security model](https://developers.cloudflare.com/sandbox/concepts/security/) - Understanding environment isolation


---
title: Wrangler configuration · Cloudflare Sandbox SDK docs
description: "The minimum required configuration for using Sandbox SDK:"
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/configuration/wrangler/
  md: https://developers.cloudflare.com/sandbox/configuration/wrangler/index.md
---

## Minimal configuration

The minimum required configuration for using Sandbox SDK:

```jsonc
{
  "name": "my-sandbox-worker",
  "main": "src/index.ts",
  "compatibility_date": "2025-10-13",
  "compatibility_flags": ["nodejs_compat"],
  "containers": [
    {
      "class_name": "Sandbox",
      "image": "docker.io/cloudflare/sandbox:0.3.3",
    },
  ],
  "durable_objects": {
    "bindings": [
      {
        "class_name": "Sandbox",
        "name": "Sandbox",
      },
    ],
  },
  "migrations": [
    {
      "new_sqlite_classes": ["Sandbox"],
      "tag": "v1",
    },
  ],
}
```

## Required settings

### containers

Each container is backed by its own Durable Object. The container image contains your runtime environment.

```jsonc
{
  "containers": [
    {
      "class_name": "Sandbox",
      "image": "docker.io/cloudflare/sandbox:0.3.3",
    },
  ],
}
```

**Parameters**:

* **class\_name** (string, required) - Must match the `class_name` of the Durable Object.
* **image** (string, required) - The Docker image to use. Must match your npm package version.

For custom images, use a Dockerfile:

```jsonc
{
  "containers": [
    {
      "class_name": "Sandbox",
      "image": "./Dockerfile",
    },
  ],
}
```

See [Dockerfile reference](https://developers.cloudflare.com/sandbox/configuration/dockerfile/) for customization.

### durable\_objects.bindings

Bind the Sandbox Durable Object to your Worker:

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "class_name": "Sandbox",
        "name": "Sandbox",
      },
    ],
  },
}
```

**Parameters**:

* **class\_name** (string, required) - Must match the `class_name` of the container configuration.
* **name** (string, required) - The binding name you'll use in your code. Conventionally `"Sandbox"`.

### migrations

Required for Durable Object initialization:

```jsonc
{
  "migrations": [
    {
      "new_sqlite_classes": ["Sandbox"],
      "tag": "v1",
    },
  ],
}
```

This tells Cloudflare to initialize the Sandbox Durable Object with SQLite storage.

## Optional settings

These settings are illustrative and not required for basic usage.

### Environment variables

Pass configuration to your Worker:

```jsonc
{
  "vars": {
    "ENVIRONMENT": "production",
    "LOG_LEVEL": "info",
  },
}
```

Access in your Worker:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    console.log(`Running in ${env.ENVIRONMENT} mode`);
    // ...
  },
};
```

### Secrets

Store sensitive values securely:

```bash
# Set secrets via CLI (never commit these)
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put GITHUB_TOKEN
wrangler secret put DATABASE_URL
```

Access like environment variables:

```typescript
interface Env {
  Sandbox: DurableObjectNamespace;
  ANTHROPIC_API_KEY: string;
  GITHUB_TOKEN: string;
}
```

### Cron triggers

Run sandboxes on a schedule:

```jsonc
{
  "triggers": {
    "crons": ["0 0 * * *"], // Daily at midnight
  },
}
```

```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    const sandbox = getSandbox(env.Sandbox, "scheduled-task");
    await sandbox.exec("python3 /workspace/daily-report.py");
    await sandbox.destroy();
  },
};
```

## Troubleshooting

### Binding not found

**Error**: `TypeError: env.Sandbox is undefined`

**Solution**: Ensure your `wrangler.jsonc` includes the Durable Objects binding:

```jsonc
{
  "durable_objects": {
    "bindings": [
      {
        "class_name": "Sandbox",
        "name": "Sandbox",
      },
    ],
  },
}
```

### Container image pull fails

**Error**: `Failed to pull container image`

**Solution**: Ensure you're using the correct image version (must match npm package):

```jsonc
{
  "containers": [
    {
      "class_name": "Sandbox",
      "image": "docker.io/cloudflare/sandbox:0.3.3",
    },
  ],
}
```

### Missing migrations

**Error**: Durable Object not initialized

**Solution**: Add migrations for the Sandbox class:

```jsonc
{
  "migrations": [
    {
      "new_sqlite_classes": ["Sandbox"],
      "tag": "v1",
    },
  ],
}
```

## Related resources

* [Wrangler documentation](https://developers.cloudflare.com/workers/wrangler/) - Complete Wrangler reference
* [Durable Objects setup](https://developers.cloudflare.com/durable-objects/get-started/) - DO-specific configuration
* [Dockerfile reference](https://developers.cloudflare.com/sandbox/configuration/dockerfile/) - Custom container images
* [Environment variables](https://developers.cloudflare.com/sandbox/configuration/environment-variables/) - Passing configuration to sandboxes
* [Get Started guide](https://developers.cloudflare.com/sandbox/get-started/) - Initial setup walkthrough


---
title: Dockerfile reference · Cloudflare Sandbox SDK docs
description: Customize the sandbox container image with your own packages,
  tools, and configurations by extending the base runtime image.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/configuration/dockerfile/
  md: https://developers.cloudflare.com/sandbox/configuration/dockerfile/index.md
---

Customize the sandbox container image with your own packages, tools, and configurations by extending the base runtime image.

## Base image

The Sandbox SDK uses a Ubuntu-based Linux container with Python, Node.js (via Bun), and common development tools pre-installed:

```dockerfile
FROM docker.io/cloudflare/sandbox:0.3.3
```

Note

Always match the Docker image version to your npm package version. If you're using `@cloudflare/sandbox@0.3.3`, use `docker.io/cloudflare/sandbox:0.3.3` as your base image.

**What's included:**

* Ubuntu 22.04 LTS base
* Python 3.11+ with pip
* Bun (JavaScript/TypeScript runtime)
* Git, curl, wget, and common CLI tools
* Pre-installed Python packages: pandas, numpy, matplotlib
* System libraries for most common use cases

## Creating a custom image

Create a `Dockerfile` in your project root:

```dockerfile
FROM docker.io/cloudflare/sandbox:0.3.3


# Install additional Python packages
RUN pip install --no-cache-dir \
    scikit-learn==1.3.0 \
    tensorflow==2.13.0 \
    transformers==4.30.0


# Install Node.js packages globally
RUN npm install -g typescript ts-node prettier


# Install system packages
RUN apt-get update && apt-get install -y \
    postgresql-client \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*
```

Update `wrangler.jsonc` to reference your Dockerfile:

```jsonc
{
  "containers": [
    {
      "binding": "CONTAINER",
      "dockerfile": "./Dockerfile",
    },
  ],
}
```

When you run `wrangler dev` or `wrangler deploy`, Wrangler automatically builds your Docker image and pushes it to Cloudflare's container registry. You don't need to manually build or publish images.

## Related resources

* [Wrangler configuration](https://developers.cloudflare.com/sandbox/configuration/wrangler/) - Using custom images in wrangler.jsonc
* [Docker documentation](https://docs.docker.com/reference/dockerfile/) - Complete Dockerfile syntax
* [Container concepts](https://developers.cloudflare.com/sandbox/concepts/containers/) - Understanding the runtime environment


---
title: Environment variables · Cloudflare Sandbox SDK docs
description: Pass configuration, secrets, and runtime settings to your sandboxes
  using environment variables.
lastUpdated: 2025-10-15T15:03:46.000Z
chatbotDeprioritize: false
source_url:
  html: https://developers.cloudflare.com/sandbox/configuration/environment-variables/
  md: https://developers.cloudflare.com/sandbox/configuration/environment-variables/index.md
---

Pass configuration, secrets, and runtime settings to your sandboxes using environment variables.

### Command and process variables

Pass environment variables when executing commands or starting processes:

```typescript
// Commands
await sandbox.exec("node app.js", {
  env: {
    NODE_ENV: "production",
    API_KEY: env.API_KEY, // Pass from Worker env
    PORT: "3000",
  },
});


// Background processes (same syntax)
await sandbox.startProcess("python server.py", {
  env: {
    DATABASE_URL: env.DATABASE_URL,
    SECRET_KEY: env.SECRET_KEY,
  },
});
```

### Session-level variables

Set environment variables for all commands in a session:

```typescript
const session = await sandbox.createSession();


await session.setEnvVars({
  DATABASE_URL: env.DATABASE_URL,
  SECRET_KEY: env.SECRET_KEY,
});


// All commands in this session have these vars
await session.exec("python migrate.py");
await session.exec("python seed.py");
```

## Common patterns

### Pass Worker secrets to sandbox

Securely pass secrets from Worker environment:

```typescript
interface Env {
  Sandbox: DurableObjectNamespace;
  OPENAI_API_KEY: string; // Set with `wrangler secret put`
  DATABASE_URL: string;
}


export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const sandbox = getSandbox(env.Sandbox, "user-sandbox");


    const result = await sandbox.exec("python analyze.py", {
      env: {
        OPENAI_API_KEY: env.OPENAI_API_KEY,
        DATABASE_URL: env.DATABASE_URL,
      },
    });


    return Response.json({ result });
  },
};
```

### Default values with spreading

Combine default and command-specific variables:

```typescript
const defaults = {
  NODE_ENV: env.ENVIRONMENT || "production",
  LOG_LEVEL: "info",
  TZ: "UTC",
};


await sandbox.exec("npm start", {
  env: {
    ...defaults,
    PORT: "3000", // Command-specific override
    API_KEY: env.API_KEY,
  },
});
```

## Environment variable precedence

When the same variable is set at multiple levels:

1. **Command-level** (highest) - Passed to `exec()` or `startProcess()`
2. **Session-level** - Set with `setEnvVars()`
3. **Container default** - Built into the Docker image
4. **System default** (lowest) - Operating system defaults

Example:

```typescript
// In Dockerfile: ENV NODE_ENV=development
// In session: await sandbox.setEnvVars({ NODE_ENV: 'staging' });


// In command (overrides all):
await sandbox.exec("node app.js", {
  env: { NODE_ENV: "production" }, // This wins
});
```

## Security best practices

### Never hardcode secrets

**Bad** - Secrets in code:

```typescript
await sandbox.exec("python app.py", {
  env: {
    API_KEY: "sk-1234567890abcdef", // NEVER DO THIS
  },
});
```

**Good** - Secrets from Worker environment:

```typescript
await sandbox.exec("python app.py", {
  env: {
    API_KEY: env.API_KEY, // From Wrangler secret
  },
});
```

Set secrets with Wrangler:

```bash
wrangler secret put API_KEY
```

## Debugging

List all environment variables:

```typescript
const result = await sandbox.exec("env");
console.log(result.stdout);
```

Check specific variable:

```typescript
const result = await sandbox.exec("echo $NODE_ENV");
console.log("NODE_ENV:", result.stdout.trim());
```

## Troubleshooting

### Variable not set

Verify the variable is being passed:

```typescript
console.log("Worker env:", env.API_KEY ? "Set" : "Missing");


const result = await sandbox.exec("env | grep API_KEY", {
  env: { API_KEY: env.API_KEY },
});
console.log("Sandbox:", result.stdout);
```

### Shell expansion issues

Use runtime-specific access instead of shell variables:

```typescript
// Instead of: await sandbox.exec('echo $NODE_ENV')
await sandbox.exec('node -e "console.log(process.env.NODE_ENV)"', {
  env: { NODE_ENV: "production" },
});
```

## Related resources

* [Wrangler configuration](https://developers.cloudflare.com/sandbox/configuration/wrangler/) - Setting Worker-level environment
* [Secrets](https://developers.cloudflare.com/workers/configuration/secrets/) - Managing sensitive data
* [Sessions API](https://developers.cloudflare.com/sandbox/api/sessions/) - Session-level environment variables
* [Security model](https://developers.cloudflare.com/sandbox/concepts/security/) - Understanding data isolation


