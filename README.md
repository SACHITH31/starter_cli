# stack-starter-cli

A simple CLI tool to quickly create starter projects for frontend, backend, or full stack development.

It helps you create project folders, install dependencies, and generate starter files in a few commands.

---

## Features

* HTML / CSS / JavaScript starter
* React starter using Vite
* Node.js backend using Express
* Custom backend port support
* Automatic `.env` file creation
* Package manager choice: npm, yarn, or pnpm
* Ready-to-use starter folder structure

---

## Install

Install globally from npm:

```bash
npm install -g stack-starter-cli
```

After installing, use the command:

```bash
stack-starter
```

---

## Basic Usage

### Interactive mode

```bash
stack-starter
```

The CLI will ask for project details step by step.

---

### Create a project with only project name

```bash
stack-starter my-app
```

The CLI will ask the remaining questions.

---

## Frontend and Backend Commands

### React + Node.js

```bash
stack-starter my-app --react --node
```

### HTML + Node.js

```bash
stack-starter my-app --html --node
```

### React only

```bash
stack-starter my-app --react
```

### HTML only

```bash
stack-starter my-app --html
```

### Node.js only

```bash
stack-starter my-app --node
```

---

## Version 1.1.0 Features

### Custom backend port

```bash
stack-starter my-app --react --node --port 8000
```

If no port is given, the default port is `5000`.

If the selected port is invalid or already in use, the CLI shows a clear message.

---

### Package manager selection

### npm

```bash
stack-starter my-app --react --node --pm npm
```

### yarn

```bash
stack-starter my-app --react --node --pm yarn
```

### pnpm

```bash
stack-starter my-app --react --node --pm pnpm
```

If the selected package manager is not installed, the CLI will stop and show a message.

---

## Generated Project Structure

Example for full stack projects:

```text
my-app/
  client/
  server/
  .gitignore
  README.md
```

---

## Help

Show help:

```bash
stack-starter --help
```

Show version:

```bash
stack-starter --version
```

---

## Example Commands

```bash
stack-starter
stack-starter my-app
stack-starter my-app --react
stack-starter my-app --html
stack-starter my-app --react --node
stack-starter my-app --html --node
stack-starter my-app --react --node --port 8000
stack-starter my-app --react --node --pm npm
```

---

## Notes

* The project folder name must be unique.
* If the folder already exists, the CLI will stop before asking setup questions.
* For backend projects, a `.env` file is created automatically.

---

## License

MIT
