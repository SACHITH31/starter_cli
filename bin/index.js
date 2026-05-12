#!/usr/bin/env node

const inquirer = require("inquirer").default;
const fs = require("fs");
const path = require("path");
const net = require("net");
const { execSync } = require("child_process");

const packageJson = require("../package.json");

// ------------------------------------------------
// HELP / VERSION
// ------------------------------------------------
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
stack-starter - project scaffolding CLI

Usage:
  stack-starter
  stack-starter my-app
  stack-starter my-app --react --node
  stack-starter my-app --html
  stack-starter my-app --react --node --port 8000
  stack-starter my-app --react --node --pm pnpm
  stack-starter my-app --preset fullstack
  stack-starter my-app --preset frontend
  stack-starter my-app --preset backend
  stack-starter my-app --react --node --git

Options:
  --help, -h       Show help
  --version, -v    Show version
  --react          Use React.js (Vite)
  --html           Use HTML / CSS / JavaScript
  --node           Use Node.js (Express)
  --port           Custom backend port
  --pm             Package manager (npm, yarn, pnpm)
  --git            Initialize git
  --preset         fullstack | frontend | backend
`);
  process.exit(0);
}

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(packageJson.version);
  process.exit(0);
}

// ------------------------------------------------
// CLI FLAGS
// ------------------------------------------------
const cliProjectName =
  process.argv[2] && !process.argv[2].startsWith("-")
    ? process.argv[2]
    : null;

const useReact = process.argv.includes("--react");
const useHtml = process.argv.includes("--html");
const useNode = process.argv.includes("--node");
const useGit = process.argv.includes("--git");

const portIndex = process.argv.indexOf("--port");
const cliPort = portIndex !== -1 ? process.argv[portIndex + 1] : null;

const pmIndex = process.argv.indexOf("--pm");
const cliPackageManager = pmIndex !== -1 ? process.argv[pmIndex + 1] : null;

const presetIndex = process.argv.indexOf("--preset");
const cliPreset = presetIndex !== -1 ? process.argv[presetIndex + 1] : null;

// ------------------------------------------------
// HELPERS
// ------------------------------------------------
function copyTemplate(source, destination) {
  const content = fs.readFileSync(source, "utf-8");
  fs.writeFileSync(destination, content);
}

function isPackageManagerInstalled(pm) {
  try {
    execSync(`${pm} --version`, {
      stdio: "ignore",
      shell: process.env.ComSpec,
    });

    return true;
  } catch {
    return false;
  }
}

function isGitInstalled() {
  try {
    execSync("git --version", {
      stdio: "ignore",
      shell: process.env.ComSpec,
    });

    return true;
  } catch {
    return false;
  }
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(false));

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port);
  });
}

function isGitConfigured() {
  try {
    const name = execSync("git config --global user.name")
      .toString()
      .trim();

    const email = execSync("git config --global user.email")
      .toString()
      .trim();

    return name && email;
  } catch {
    return false;
  }
}

// ------------------------------------------------
// EARLY VALIDATION
// ------------------------------------------------
if (useReact && useHtml) {
  console.log("\nYou cannot use --react and --html together.");
  process.exit(0);
}

if (portIndex !== -1 && !cliPort) {
  console.log("\nPlease provide a port number.");
  process.exit(0);
}

if (pmIndex !== -1 && !cliPackageManager) {
  console.log("\nPlease provide a package manager.");
  process.exit(0);
}

if (presetIndex !== -1 && !cliPreset) {
  console.log("\nPlease provide a preset.");
  process.exit(0);
}

if (cliPort) {
  if (!/^[0-9]+$/.test(cliPort)) {
    console.log("\nEntered wrong port number format. Example: 8000");
    process.exit(0);
  }

  const port = Number(cliPort);

  if (port < 1 || port > 65535) {
    console.log("\nPort must be between 1 and 65535.");
    process.exit(0);
  }
}

if (cliPreset) {
  if (!["fullstack", "frontend", "backend"].includes(cliPreset)) {
    console.log(`
Invalid preset.
Available presets:
fullstack
frontend
backend
`);
    process.exit(0);
  }

  if (useReact || useHtml || useNode) {
    console.log("\nDo not mix --preset with --react, --html, or --node.");
    process.exit(0);
  }
}

if (cliProjectName) {
  const earlyProjectPath = path.join(process.cwd(), cliProjectName);

  if (fs.existsSync(earlyProjectPath)) {
    console.log("\nA project with this name already exists.");
    process.exit(0);
  }
}

if (cliPackageManager) {
  if (!["npm", "yarn", "pnpm"].includes(cliPackageManager)) {
    console.log("\nInvalid package manager. Use npm, yarn, or pnpm.");
    process.exit(0);
  }

  if (!isPackageManagerInstalled(cliPackageManager)) {
    console.log(`\n${cliPackageManager} is not installed on this machine.`);
    process.exit(0);
  }
}

if (useGit && !isGitInstalled()) {
  console.log(`
Git is not installed.

Install Git from:
https://desktop.github.com/download/
`);
  process.exit(0);
}

// ------------------------------------------------
// RESOLVE FRONTEND / BACKEND
// ------------------------------------------------
let cliFrontend = null;
let cliBackend = null;

if (useReact) cliFrontend = "React.js (Vite)";
if (useHtml) cliFrontend = "HTML / CSS / JavaScript";
if (useNode) cliBackend = "Node.js (Express)";

if ((useReact || useHtml) && !useNode) {
  cliBackend = "None";
}

if (useNode && !useReact && !useHtml) {
  cliFrontend = "None";
}

// ------------------------------------------------
// PROMPT
// ------------------------------------------------
inquirer
  .prompt([
    {
      name: "projectName",
      message: "Enter your project name:",
      default: cliProjectName || undefined,

      when: !cliProjectName,

      validate(input) {
        const projectName = cliProjectName || input;

        if (!projectName.trim()) {
          return "Project name cannot be empty.";
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
          return "Use only letters, numbers, hyphen (-), or underscore (_).";
        }

        return true;
      },
    },

    {
      name: "presetChoice",
      message: "Choose fullstack preset:",
      type: "rawlist",

      choices: [
        "HTML / CSS / JavaScript + Node.js",
        "React.js + Node.js",
      ],

      when: cliPreset === "fullstack",
    },

    {
      name: "presetChoice",
      message: "Choose frontend preset:",
      type: "rawlist",

      choices: ["HTML / CSS / JavaScript", "React.js (Vite)"],

      when: cliPreset === "frontend",
    },

    {
      name: "frontend",
      message: "Choose frontend:",
      type: "rawlist",

      choices: ["HTML / CSS / JavaScript", "React.js (Vite)", "None"],

      default: 2,

      when: !cliFrontend && !cliPreset,
    },

    {
      name: "backend",
      message: "Choose backend:",
      type: "rawlist",

      choices: ["Node.js (Express)", "None"],

      default: 1,

      when: !cliBackend && !cliPreset,
    },

    {
      name: "port",
      message: "Enter backend port:",
      default: cliPort || "5000",

      when(answers) {
        return (
          !cliPort &&
          (cliBackend === "Node.js (Express)" ||
            answers.backend === "Node.js (Express)" ||
            cliPreset === "fullstack" ||
            cliPreset === "backend")
        );
      },

      validate(input) {
        if (!/^[0-9]+$/.test(input)) {
          return "Entered wrong port number format. Example: 8000";
        }

        const port = Number(input);

        if (port < 1 || port > 65535) {
          return "Port must be between 1 and 65535.";
        }

        return true;
      },
    },

    {
      name: "packageManager",
      message: "Choose package manager:",
      type: "rawlist",

      choices: ["npm", "yarn", "pnpm"],

      default: 0,

      when: !cliPackageManager,
    },
  ])

  .then(async (answers) => {
    if (cliProjectName) answers.projectName = cliProjectName;

    // ------------------------------------------------
    // PRESET RESOLUTION
    // ------------------------------------------------
    if (cliPreset === "fullstack") {
      if (answers.presetChoice === "HTML / CSS / JavaScript + Node.js") {
        answers.frontend = "HTML / CSS / JavaScript";
        answers.backend = "Node.js (Express)";
      } else {
        answers.frontend = "React.js (Vite)";
        answers.backend = "Node.js (Express)";
      }
    }

    if (cliPreset === "frontend") {
      answers.frontend = answers.presetChoice;
      answers.backend = "None";
    }

    if (cliPreset === "backend") {
      answers.frontend = "None";
      answers.backend = "Node.js (Express)";
    }

    if (cliFrontend) answers.frontend = cliFrontend;
    if (cliBackend) answers.backend = cliBackend;

    if (!answers.frontend) answers.frontend = "None";
    if (!answers.backend) answers.backend = "None";

    answers.packageManager =
      cliPackageManager || answers.packageManager || "npm";

    const projectPath = path.join(process.cwd(), answers.projectName);

    // ------------------------------------------------
    // PORT CHECK
    // ------------------------------------------------
    if (answers.backend === "Node.js (Express)") {
      answers.port = Number(cliPort || answers.port || 5000);

      const free = await isPortFree(answers.port);

      if (!free) {
        console.log(
          `\nSomething is already running on port ${answers.port}. Choose another port.`
        );

        return;
      }
    }

    // ------------------------------------------------
    // ROOT FILES
    // ------------------------------------------------
    fs.mkdirSync(projectPath);

    fs.writeFileSync(
      path.join(projectPath, ".gitignore"),
      "node_modules\n.env\ndist\n.vite\n.DS_Store\ncoverage"
    );

    fs.writeFileSync(
      path.join(projectPath, "README.md"),
      `# ${answers.projectName}`
    );

    // ------------------------------------------------
    // BACKEND
    // ------------------------------------------------
    if (answers.backend === "Node.js (Express)") {
      const serverPath = path.join(projectPath, "server");

      const pm = answers.packageManager;

      fs.mkdirSync(serverPath);

      console.log("\nSetting up backend...");

      try {
        execSync("npm init -y", {
          cwd: serverPath,
          stdio: "inherit",
          shell: process.env.ComSpec,
        });

        const pkgPath = path.join(serverPath, "package.json");

        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

        pkg.scripts = {
          start: "node index.js",
          dev: "nodemon index.js",
        };

        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

        if (pm === "npm") {
          execSync("npm install express cors dotenv", {
            cwd: serverPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });

          execSync("npm install -D nodemon", {
            cwd: serverPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });
        }

        if (pm === "yarn") {
          execSync("yarn add express cors dotenv", {
            cwd: serverPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });

          execSync("yarn add -D nodemon", {
            cwd: serverPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });
        }

        if (pm === "pnpm") {
          execSync("pnpm add express cors dotenv", {
            cwd: serverPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });

          execSync("pnpm add -D nodemon", {
            cwd: serverPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });
        }

        copyTemplate(
          path.join(__dirname, "..", "templates", "server", "index.js"),
          path.join(serverPath, "index.js")
        );

        fs.writeFileSync(
          path.join(serverPath, ".env"),
          `PORT=${answers.port}`
        );
      } catch {
        console.log("\n❌ Backend setup failed.");
        return;
      }
    }

    // ------------------------------------------------
    // HTML FRONTEND
    // ------------------------------------------------
    if (answers.frontend === "HTML / CSS / JavaScript") {
      const clientPath = path.join(projectPath, "client");

      fs.mkdirSync(clientPath);

      copyTemplate(
        path.join(__dirname, "..", "templates", "html", "index.html"),
        path.join(clientPath, "index.html")
      );

      copyTemplate(
        path.join(__dirname, "..", "templates", "html", "style.css"),
        path.join(clientPath, "style.css")
      );

      if (answers.backend === "Node.js (Express)") {
        let script = fs.readFileSync(
          path.join(__dirname, "..", "templates", "html", "script.js"),
          "utf8"
        );

        script = script.replace(/5000/g, answers.port);

        fs.writeFileSync(path.join(clientPath, "script.js"), script);
      } else {
        fs.writeFileSync(
          path.join(clientPath, "script.js"),
          `document.getElementById("status").textContent = "Standalone";
document.getElementById("message").textContent = "No backend selected. Frontend is ready.";`
        );
      }
    }

    // ------------------------------------------------
    // REACT FRONTEND
    // ------------------------------------------------
    if (answers.frontend === "React.js (Vite)") {
      const clientPath = path.join(projectPath, "client");

      console.log("\nScaffolding React project...");

      try {
        const pm = answers.packageManager;

        if (pm === "npm") {
          execSync(
            "npm create vite@latest client --yes -- --template react",
            {
              cwd: projectPath,
              stdio: "inherit",
              shell: process.env.ComSpec,
            }
          );

          execSync("npm install", {
            cwd: clientPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });
        }

        if (pm === "yarn") {
          execSync("yarn create vite client --template react", {
            cwd: projectPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });

          execSync("yarn", {
            cwd: clientPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });
        }

        if (pm === "pnpm") {
          execSync("pnpm create vite client --template react", {
            cwd: projectPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });

          execSync("pnpm install", {
            cwd: clientPath,
            stdio: "inherit",
            shell: process.env.ComSpec,
          });
        }

        if (answers.backend === "Node.js (Express)") {
          let appCode = fs.readFileSync(
            path.join(__dirname, "..", "templates", "react", "App.jsx"),
            "utf8"
          );

          appCode = appCode.replace(/5000/g, answers.port);

          fs.writeFileSync(path.join(clientPath, "src", "App.jsx"), appCode);
        }
      } catch {
        console.log("\n❌ React setup failed.");
        return;
      }
    }

    // ------------------------------------------------
    // GIT
    // ------------------------------------------------
    if (useGit) {
      console.log("\nNow git initialization step is going on...");

      try {
        execSync("git init", {
          cwd: projectPath,
          stdio: "ignore",
          shell: process.env.ComSpec,
        });

        execSync("git add .", {
          cwd: projectPath,
          stdio: "ignore",
          shell: process.env.ComSpec,
        });

        if (isGitConfigured()) {
          execSync('git commit -m "Initial commit"', {
            cwd: projectPath,
            stdio: "ignore",
            shell: process.env.ComSpec,
          });

          console.log("✅ Git repository initialized.");
        } else {
          console.log(`
Git initialized successfully.

Git commit skipped because git user.name or user.email is not configured.
`);
        }
      } catch {
        console.log("\nGit initialization failed.");
      }
    }

    // ------------------------------------------------
    // FINAL
    // ------------------------------------------------
    console.log(`\n✅ Project "${answers.projectName}" created successfully!`);
  });