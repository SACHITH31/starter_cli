# stack-starter

A simple project scaffolding CLI for creating frontend, backend, and fullstack starter projects fast.

Use it when you want a clean React, HTML, Node.js, or fullstack setup without copying the same files again and again.

---

## Features

| Feature | Included |
| --- | --- |
| React frontend | Vite + React starter |
| HTML frontend | HTML, CSS, and JavaScript starter |
| Node backend | Express server with CORS and dotenv |
| Fullstack setup | Frontend and backend in one project |
| Package managers | npm, yarn, and pnpm |
| Custom backend port | `--port` option |
| Git setup | Optional `git init` and first commit |
| Presets | Quick frontend, backend, and fullstack modes |

---

## Installation

Install globally:

```bash
npm install -g stack-starter-cli
```

Then run:

```bash
stack-starter
```

---

## Usage

Start in interactive mode:

```bash
stack-starter
```

Create a project and answer the remaining questions:

```bash
stack-starter my-app
```

Create a project directly with flags:

```bash
stack-starter my-app --react --node --pm pnpm --git
```

---

## Command Examples

### React only

```bash
stack-starter my-react-app --react
```

### Backend only

```bash
stack-starter my-api --node
```

### Fullstack

```bash
stack-starter my-fullstack-app --react --node
```

### HTML frontend with backend

```bash
stack-starter my-site --html --node
```

### Custom backend port

```bash
stack-starter my-api --node --port 8000
```

### Git initialization

```bash
stack-starter my-app --react --node --git
```

### pnpm usage

```bash
stack-starter my-app --react --node --pm pnpm
```

### yarn usage

```bash
stack-starter my-app --react --node --pm yarn
```

### Presets

```bash
stack-starter my-app --preset fullstack
stack-starter my-app --preset frontend
stack-starter my-app --preset backend
```

---

## Available Flags

| Flag | Description | Example |
| --- | --- | --- |
| `--react` | Create a React.js frontend with Vite | `stack-starter app --react` |
| `--html` | Create an HTML/CSS/JavaScript frontend | `stack-starter app --html` |
| `--node` | Create a Node.js Express backend | `stack-starter app --node` |
| `--port` | Set the backend port | `stack-starter app --node --port 8000` |
| `--pm` | Choose `npm`, `yarn`, or `pnpm` | `stack-starter app --pm pnpm` |
| `--git` | Initialize Git after project creation | `stack-starter app --git` |
| `--preset` | Use `fullstack`, `frontend`, or `backend` | `stack-starter app --preset fullstack` |
| `--help` | Show help | `stack-starter --help` |
| `--version` | Show package version | `stack-starter --version` |

Unknown flags stop the CLI before prompts start:

```bash
stack-starter app --randomFlag
```

Output:

```text
Invalid flag(s):
--randomFlag
```

---

## Presets

Presets are quick setup modes.

| Preset | What it does |
| --- | --- |
| `fullstack` | Lets you choose React + Node.js or HTML + Node.js |
| `frontend` | Lets you choose React or HTML |
| `backend` | Creates a Node.js Express backend |

Examples:

```bash
stack-starter my-app --preset fullstack
stack-starter my-site --preset frontend
stack-starter my-api --preset backend
```

---

## Generated Project Structure Examples

### React + Node.js

```text
my-app/
  client/
    src/
    package.json
  server/
    index.js
    .env
    package.json
  .gitignore
  README.md
```

### HTML + Node.js

```text
my-app/
  client/
    index.html
    style.css
    script.js
  server/
    index.js
    .env
    package.json
  .gitignore
  README.md
```

### Backend only

```text
my-api/
  server/
    index.js
    .env
    package.json
  .gitignore
  README.md
```

---

## Package Manager Support

Choose your package manager with `--pm`.

```bash
stack-starter my-app --react --node --pm npm
stack-starter my-app --react --node --pm yarn
stack-starter my-app --react --node --pm pnpm
```

Backend initialization uses the selected package manager:

> Use the same package manager to run the project later.

### npm

```bash
npm run dev
```

### yarn

```bash
yarn dev
```

### pnpm

```bash
pnpm dev
```

| Package manager | Backend init | Install dependencies |
| --- | --- | --- |
| npm | `npm init -y` | `npm install` |
| yarn | `yarn init -y` | `yarn add` |
| pnpm | `pnpm init` | `pnpm add` |

React projects are also created and installed with the selected package manager.

---

## Git Support

Add `--git` to initialize a Git repository:

```bash
stack-starter my-app --react --node --git
```

The CLI will run:

```bash
git init
git add .
git commit -m "Initial commit"
```

If Git is installed but `user.name` or `user.email` is missing, the repository is still initialized and the commit is skipped.

---

## Example Workflows

### Build a React app with npm

```bash
stack-starter dashboard --react --pm npm
cd dashboard/client
npm run dev
```

### Build a React app with yarn

```bash
stack-starter dashboard --react --pm yarn
cd dashboard/client
yarn dev
```


### Build an Express API

```bash
stack-starter api-server --node --port 8000 --pm pnpm
cd api-server/server
pnpm dev
```

### Build a fullstack app with Git

```bash
stack-starter product-app --react --node --pm yarn --git
cd product-app
```

---

## Why use stack-starter?

- Start projects quickly
- Keep frontend and backend folders organized
- Choose the package manager you already use
- Avoid repeating the same setup steps
- Good for beginners, practice projects, and quick prototypes

---

## Contributing

Contributions are welcome.

To work locally:

```bash
git clone https://github.com/SACHITH31/starter_cli.git
cd starter_cli
npm install
npm start
```

Please keep changes simple, readable, and focused.

---

## License

MIT
