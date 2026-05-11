#!/usr/bin/env node

// -----------------------------
// Required packages
// -----------------------------
const inquirer = require("inquirer").default;
const fs = require("fs");
const path = require("path");
const net = require("net");
const { execSync } = require("child_process");

// -----------------------------
// starter --help and --version
// -----------------------------
const packageJson = require("../package.json");

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

Options:
  --help, -h       Show help
  --version, -v    Show version
  --react          Use React.js (Vite)
  --html           Use HTML / CSS / JavaScript
  --node           Use Node.js (Express)
  --port           Custom backend port
  --pm             Package manager (npm, yarn, pnpm)

What it can create:
  • HTML / CSS / JavaScript starter
  • React.js (Vite) starter
  • Node.js (Express) backend
`);
  process.exit(0);
}

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  console.log(packageJson.version);
  process.exit(0);
}

// -----------------------------
// CLI flags
// -----------------------------
const cliProjectName =
  process.argv[2] && !process.argv[2].startsWith("-")
    ? process.argv[2]
    : null;

const useReact = process.argv.includes("--react");
const useHtml = process.argv.includes("--html");
const useNode = process.argv.includes("--node");

const portIndex = process.argv.indexOf("--port");
const cliPort = portIndex !== -1 ? process.argv[portIndex + 1] : null;

const pmIndex = process.argv.indexOf("--pm");
const cliPackageManager = pmIndex !== -1 ? process.argv[pmIndex + 1] : null;

// -----------------------------
// Resolve CLI-selected frontend/backend
// -----------------------------
let cliFrontend = null;
let cliBackend = null;

if (useReact) cliFrontend = "React.js (Vite)";
if (useHtml) cliFrontend = "HTML / CSS / JavaScript";
if (useNode) cliBackend = "Node.js (Express)";

// -----------------------------
// Helper: copy template files
// -----------------------------
function copyTemplate(source, destination) {
  const content = fs.readFileSync(source, "utf-8");
  fs.writeFileSync(destination, content);
}

// -----------------------------
// Helper: check package manager
// -----------------------------
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

// -----------------------------
// Helper: check port free
// -----------------------------
function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
}

// -----------------------------
// Ask user for project details
// -----------------------------
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
      name: "frontend",
      message: "Choose frontend:",
      type: "rawlist",
      choices: ["HTML / CSS / JavaScript", "React.js (Vite)", "None"],
      default: 2,
      when: !cliFrontend,
    },
    {
      name: "backend",
      message: "Choose backend:",
      type: "rawlist",
      choices: ["Node.js (Express)", "None"],
      default: 1,
      when: !cliBackend,
    },
    {
      name: "port",
      message: "Enter backend port:",
      default: cliPort || "5000",
      when: !cliPort && (cliBackend || useNode),
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
    if (cliProjectName) {
      answers.projectName = cliProjectName;
    }

    if (cliFrontend) {
      answers.frontend = cliFrontend;
    }

    if (cliBackend) {
      answers.backend = cliBackend;
    }

    if (!answers.frontend) {
      answers.frontend = "None";
    }

    if (!answers.backend) {
      answers.backend = "None";
    }

    answers.packageManager = cliPackageManager || answers.packageManager || "npm";

    if (answers.backend === "Node.js (Express)") {
      answers.port = Number(cliPort || answers.port || 5000);

      if (!/^[0-9]+$/.test(String(answers.port))) {
        console.log("\nEntered wrong port number format. Example: 8000");
        return;
      }

      const free = await isPortFree(answers.port);

      if (!free) {
        console.log(
          `\nSomething is already running on port ${answers.port}. Choose another port.`
        );
        return;
      }
    }

    if (!["npm", "yarn", "pnpm"].includes(answers.packageManager)) {
      console.log("\nInvalid package manager. Use npm, yarn, or pnpm.");
      return;
    }

    if (!isPackageManagerInstalled(answers.packageManager)) {
      console.log(`\n${answers.packageManager} is not installed on this machine.`);
      return;
    }

    const projectPath = path.join(process.cwd(), answers.projectName);

    // -----------------------------
    // Prevent duplicate folder names
    // -----------------------------
    if (fs.existsSync(projectPath)) {
      console.log("\nA project with this name already exists.");
      return;
    }

    // -----------------------------
    // Create root project folder
    // -----------------------------
    fs.mkdirSync(projectPath);

    // -----------------------------
    // Base project files
    // -----------------------------
    fs.writeFileSync(
      path.join(projectPath, ".gitignore"),
      "node_modules\n.env\ndist\n.vite\n.DS_Store\ncoverage"
    );

    fs.writeFileSync(
      path.join(projectPath, "README.md"),
      `# ${answers.projectName}`
    );

    // =====================================================
    // BACKEND SETUP
    // =====================================================
    if (answers.backend === "Node.js (Express)") {
      const serverPath = path.join(projectPath, "server");

      fs.mkdirSync(serverPath);

      console.log("\nSetting up backend...");

      try {
        const pm = answers.packageManager;

        execSync(`${pm} init -y`, {
          cwd: serverPath,
          stdio: "inherit",
          shell: process.env.ComSpec,
        });

        const pkgPath = path.join(serverPath, "package.json");

        if (fs.existsSync(pkgPath)) {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

          pkg.scripts = {
            start: "node index.js",
            dev: "nodemon index.js",
          };

          fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

          console.log("✅ Scripts added to package.json");
        }

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

        // create .env
        fs.writeFileSync(
          path.join(serverPath, ".env"),
          `PORT=${answers.port}`
        );

        // inject selected port
        let serverCode = fs.readFileSync(
          path.join(serverPath, "index.js"),
          "utf8"
        );

        serverCode = serverCode.replace(
          "process.env.PORT || 5000",
          "process.env.PORT || " + 5000
        );

        fs.writeFileSync(path.join(serverPath, "index.js"), serverCode);
      } catch (error) {
        console.log("\n❌ Backend setup failed.");
        console.log("Check package manager installation or internet connection.");
        return;
      }
    }

    // =====================================================
    // FRONTEND SETUP - HTML / CSS / JS
    // =====================================================
    if (answers.frontend === "HTML / CSS / JavaScript") {
      const clientPath = path.join(projectPath, "client");

      fs.mkdirSync(clientPath);

      console.log("\nSetting up HTML / CSS / JavaScript frontend...");

      fs.writeFileSync(
        path.join(clientPath, "index.html"),
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${answers.projectName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Frontend Status: <span id="status">Loading...</span></h1>

  <div id="response-box" style="padding: 20px; border: 1px solid #ccc; margin-top: 20px;">
    Backend Message: <strong id="message">Please wait...</strong>
  </div>

  <script src="script.js"></script>
</body>
</html>`
      );

      fs.writeFileSync(
        path.join(clientPath, "style.css"),
        `body {
  font-family: Arial, sans-serif;
  padding: 40px;
  text-align: center;
  background: #f5f5f5;
}

#response-box {
  background: white;
  display: inline-block;
  padding: 20px;
  border-radius: 8px;
}`
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
          `const statusEl = document.getElementById("status");
const messageEl = document.getElementById("message");

statusEl.textContent = "Standalone";
statusEl.style.color = "green";

messageEl.textContent = "No backend selected. Frontend is ready.";`
        );
      }
    }

    // =====================================================
    // FRONTEND SETUP - REACT
    // =====================================================
    else if (answers.frontend === "React.js (Vite)") {
      const clientPath = path.join(projectPath, "client");

      console.log("\nScaffolding React project...");

      try {
        execSync(
          `${answers.packageManager === "npm" ? "npm create vite@latest" : answers.packageManager + " create vite"} client --yes -- --template react`,
          {
            cwd: projectPath,
            stdio: ["ignore", "pipe", "pipe"],
            shell: process.env.ComSpec,
          }
        );

        console.log("Installing React dependencies...");

        execSync(`${answers.packageManager} install`, {
          cwd: clientPath,
          stdio: "inherit",
          shell: process.env.ComSpec,
        });

        console.log("✅ React installation complete!");

        if (answers.backend === "Node.js (Express)") {
          let appCode = fs.readFileSync(
            path.join(__dirname, "..", "templates", "react", "App.jsx"),
            "utf8"
          );

          appCode = appCode.replace(/5000/g, answers.port);

          fs.writeFileSync(path.join(clientPath, "src", "App.jsx"), appCode);
        }
      } catch (error) {
        console.log("\n❌ React setup failed.");
        console.log("Check package manager installation or internet connection.");
        return;
      }
    }

    // =====================================================
    // FINAL INSTRUCTIONS
    // =====================================================
    console.log(`\n✅ Project "${answers.projectName}" created successfully!`);

    if (
      answers.frontend === "HTML / CSS / JavaScript" &&
      answers.backend === "Node.js (Express)"
    ) {
      console.log("\nRun backend:");
      console.log(`cd ${answers.projectName}/server`);
      console.log(`${answers.packageManager} run dev`);

      console.log("\nThen open frontend:");
      console.log(`${answers.projectName}/client/index.html`);
    } else if (
      answers.frontend === "React.js (Vite)" &&
      answers.backend === "Node.js (Express)"
    ) {
      console.log("\nRun backend:");
      console.log(`cd ${answers.projectName}/server`);
      console.log(`${answers.packageManager} run dev`);

      console.log("\nOpen another terminal and run frontend:");
      console.log(`cd ${answers.projectName}/client`);
      console.log(`${answers.packageManager} run dev`);
    } else if (answers.frontend === "HTML / CSS / JavaScript") {
      console.log("\nOpen frontend:");
      console.log(`${answers.projectName}/client/index.html`);
    } else if (answers.frontend === "React.js (Vite)") {
      console.log("\nRun frontend:");
      console.log(`cd ${answers.projectName}/client`);
      console.log(`${answers.packageManager} run dev`);
    } else if (answers.backend === "Node.js (Express)") {
      console.log("\nRun backend:");
      console.log(`cd ${answers.projectName}/server`);
      console.log(`${answers.packageManager} run dev`);
    }
  });