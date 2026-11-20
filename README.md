# stack-starter-cli

**Scaffold a frontend, backend, or full-stack project from your terminal.**

[![npm version](https://img.shields.io/npm/v/stack-starter-cli?logo=npm)](https://www.npmjs.com/package/stack-starter-cli)
[![npm downloads](https://img.shields.io/npm/dm/stack-starter-cli?logo=npm)](https://www.npmjs.com/package/stack-starter-cli)
[![CI](https://github.com/SACHITH31/starter_cli/actions/workflows/cli-tests.yml/badge.svg)](https://github.com/SACHITH31/starter_cli/actions/workflows/cli-tests.yml)
[![Node.js](https://img.shields.io/node/v/stack-starter-cli)](https://www.npmjs.com/package/stack-starter-cli)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://www.npmjs.com/package/stack-starter-cli)

**React + Vite · HTML/CSS/JavaScript · Node.js + Express · Optional TypeScript**

stack-starter-cli is an interactive and flag-driven project generator for quickly starting small apps, APIs, and full-stack projects. Choose the pieces you need, select npm, yarn, or pnpm, and optionally initialize Git.

[**Get started**](#quick-start) · [**Examples**](#common-recipes) · [**CLI reference**](#cli-reference) · [**Contributing**](#development--contributing) · [**Releases**](https://github.com/SACHITH31/starter_cli/releases)

> **Current release:** v1.3.1 — maintenance, reliability, testing, and secure release-workflow improvements. [Read the release notes](https://github.com/SACHITH31/starter_cli/releases/tag/v1.3.1).

## Quick start

**Requirements:** Node.js **20.19.0 or newer**, and the package manager you intend to use. Git is optional.

Run without a global installation:

```bash
npx stack-starter-cli@latest
```

Or install globally:

```bash
npm install -g stack-starter-cli
stack-starter
```

To start a named React + Express project:

```bash
stack-starter my-app --react --node --pm npm
```

> The npm package is named `stack-starter-cli`; the installed executable is `stack-starter`.

## What you can build

| Project | Stack | Example |
| --- | --- | --- |
| React app | Vite + React | `stack-starter web --react` |
| TypeScript React app | Vite + React + TypeScript | `stack-starter web --react --ts` |
| Static website | HTML + CSS + JavaScript | `stack-starter site --html` |
| Express API | Node.js + Express | `stack-starter api --node` |
| TypeScript API | Express + TypeScript | `stack-starter api --node --ts` |
| Full-stack app | React or HTML frontend + Express backend | `stack-starter app --react --node` |

**Additional capabilities:** interactive questions, `frontend` / `backend` / `fullstack` presets, configurable backend port, npm/yarn/pnpm selection, and optional Git initialization.

## How scaffolding works

```text
  stack-starter [project-name] [options]
                  |
          Choose a project type
          (flags or prompts)
                  |
          Select a package manager
                  |
       Generate client and/or server
                  |
        Install required dependencies
                  |
         Optional Git initialization
                  |
          Your project is ready
```

This diagram illustrates the typical workflow; steps depend on the chosen template and options.

## Common recipes

### React frontend

```bash
stack-starter dashboard --react --pm npm
cd dashboard/client
npm run dev
```

### TypeScript React frontend

```bash
stack-starter typed-web --react --ts --pm npm
cd typed-web/client
npm run dev
```

### Express API

```bash
stack-starter api-server --node --port 8000 --pm npm
cd api-server/server
npm run dev
```

### TypeScript Express API

```bash
stack-starter typed-api --node --ts --port 8000 --pm npm
cd typed-api/server
npm run dev
```

For a production-style TypeScript server run, build first:

```bash
npm run build
npm start
```

### Full-stack project

```bash
stack-starter product-app --react --node --pm pnpm --git
```

The frontend and backend live in separate `client/` and `server/` directories. Start each component from its own directory using the scripts generated for that component.

### Plain HTML + Express

```bash
stack-starter landing-app --html --node
```

### Interactive presets

```bash
stack-starter my-app --preset fullstack
stack-starter my-site --preset frontend
stack-starter my-api --preset backend
```

Presets streamline the questions; `fullstack` can use React or HTML, `frontend` can use React or HTML, and `backend` uses Express.

## CLI reference

| Option | Purpose |
| --- | --- |
| `--react` | Scaffold a React frontend using Vite |
| `--html` | Scaffold an HTML/CSS/JavaScript frontend |
| `--node` | Scaffold an Express backend |
| `--ts` | Use TypeScript with React and/or Express |
| `--pm npm\|yarn\|pnpm` | Select a package manager |
| `--port <number>` | Configure the backend port |
| `--git` | Initialize a Git repository and attempt an initial commit |
| `--preset frontend\|backend\|fullstack` | Choose a guided setup preset |
| `--help` | Display CLI help |
| `--version` | Display installed CLI version |

**Defaults and constraints**

- JavaScript is the default. `--ts` is supported with React and/or Express, **not** the plain HTML template.
- Running `stack-starter` with no arguments starts the interactive flow.
- Unknown flags are rejected rather than silently ignored.
- A Git commit may be skipped when Git author identity is not configured.

For exact options in your installed version, run:

```bash
stack-starter --help
```

## Generated layout

A typical JavaScript React + Express project has the following structure (the exact files vary by template):

```text
my-app/
├── client/
│   ├── src/
│   └── package.json
├── server/
│   ├── index.js
│   ├── .env
│   └── package.json
├── .gitignore
└── README.md
```

For TypeScript Express projects, the server includes `src/index.ts` and `tsconfig.json`, with scripts for development, compilation, and running the compiled output.

## Package managers

Choose `--pm npm`, `--pm yarn`, or `--pm pnpm`. The CLI uses your selected manager to initialize and install the generated project dependencies. Make sure it is installed and available on your `PATH`.

Run the generated project's commands from the relevant `client/` or `server/` directory, using the package manager you selected.

## Troubleshooting

| Issue | What to check |
| --- | --- |
| `stack-starter` is not recognized | Use `npx stack-starter-cli@latest` or verify your global npm binary directory is on `PATH` |
| Node version is unsupported | Install Node.js 20.19.0 or newer |
| `yarn` or `pnpm` command is missing | Install that package manager or use `--pm npm` |
| Git commit was skipped | Configure `git config user.name` and `git config user.email` |
| TypeScript requested for HTML | Use `--react --ts` or `--node --ts` instead |

If an error persists, [open an issue](https://github.com/SACHITH31/starter_cli/issues) with your operating system, Node.js version, command, and the error output. Remove credentials and private paths before sharing logs.

## Development & contributing

Contributions, bug reports, and documentation improvements are welcome.

```bash
git clone https://github.com/SACHITH31/starter_cli.git
cd starter_cli
npm ci
npm test
npm start
```

Please open an issue for larger proposals before investing significant time. Keep pull requests focused and include tests for behavior changes.

The project runs CLI tests on Windows and Ubuntu with Node.js 20 and 22, alongside JavaScript syntax checks, formatting hygiene, generated-project smoke tests, and package verification. [See CI](https://github.com/SACHITH31/starter_cli/actions).

## Releases & security

- [Changelog](CHANGELOG.md) · [GitHub releases](https://github.com/SACHITH31/starter_cli/releases) · [npm package](https://www.npmjs.com/package/stack-starter-cli)
- Releases use npm Trusted Publishing (OIDC) and a staged review/approval process.
- To report a security concern, avoid publishing sensitive details in a public issue; contact the maintainer privately through an appropriate GitHub channel.

**Maintainer:** [@SACHITH31](https://github.com/SACHITH31)

## License

MIT (as declared in `package.json`).
