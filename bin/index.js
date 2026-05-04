#!/usr/bin/env node

// -----------------------------
// Required packages
// -----------------------------
const inquirer = require("inquirer").default;
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// -----------------------------
// Helper: copy template files
// -----------------------------
function copyTemplate(source, destination) {
  const content = fs.readFileSync(source, "utf-8");
  fs.writeFileSync(destination, content);
}

// -----------------------------
// Ask user for project details
// -----------------------------
inquirer
  .prompt([
    {
      name: "projectName",
      message: "Enter your project name:",
      validate(input) {
        if (!input.trim()) {
          return "Project name cannot be empty.";
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
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
    },
    {
      name: "backend",
      message: "Choose backend:",
      type: "rawlist",
      choices: ["Node.js (Express)", "None"],
      default: 1,
    },
  ])
  .then((answers) => {
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
        // Initialize npm
        execSync("npm init -y", {
          cwd: serverPath,
          stdio: "inherit",
          shell: process.env.ComSpec,
        });

        // Update package.json scripts
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

        // Install backend dependencies
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

        // Create backend starter file
        copyTemplate(
          path.join(process.cwd(), "templates", "server", "index.js"),
          path.join(serverPath, "index.js")
        );
      } catch (error) {
        console.log("\n❌ Backend setup failed.");
        console.log("Check npm installation or internet connection.");
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

      // index.html
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

      // style.css
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

      // Backend-connected frontend
      if (answers.backend === "Node.js (Express)") {
        copyTemplate(
          path.join(process.cwd(), "templates", "html", "script.js"),
          path.join(clientPath, "script.js")
        );
      }

      // Standalone frontend
      else {
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
    // FRONTEND SETUP - REACT (VITE)
    // =====================================================
    else if (answers.frontend === "React.js (Vite)") {
      const clientPath = path.join(projectPath, "client");

      console.log("\nScaffolding React project...");

      try {
        // Create React app
        execSync("npm create vite@latest client --yes -- --template react", {
          cwd: projectPath,
          stdio: ["ignore", "pipe", "pipe"],
          shell: process.env.ComSpec,
        });

        // Install dependencies
        console.log("Installing React dependencies...");

        execSync("npm install", {
          cwd: clientPath,
          stdio: "inherit",
          shell: process.env.ComSpec,
        });

        console.log("✅ React installation complete!");

        // Replace App.jsx only if backend exists
        if (answers.backend === "Node.js (Express)") {
          copyTemplate(
            path.join(process.cwd(), "templates", "react", "App.jsx"),
            path.join(clientPath, "src", "App.jsx")
          );
        }
      } catch (error) {
        console.log("\n❌ React setup failed.");
        console.log("Check npm installation or internet connection.");
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
      console.log("npm run dev");

      console.log("\nThen open frontend:");
      console.log(`${answers.projectName}/client/index.html`);
    } else if (
      answers.frontend === "React.js (Vite)" &&
      answers.backend === "Node.js (Express)"
    ) {
      console.log("\nRun backend:");
      console.log(`cd ${answers.projectName}/server`);
      console.log("npm run dev");

      console.log("\nOpen another terminal and run frontend:");
      console.log(`cd ${answers.projectName}/client`);
      console.log("npm run dev");
    } else if (answers.frontend === "HTML / CSS / JavaScript") {
      console.log("\nOpen frontend:");
      console.log(`${answers.projectName}/client/index.html`);
    } else if (answers.frontend === "React.js (Vite)") {
      console.log("\nRun frontend:");
      console.log(`cd ${answers.projectName}/client`);
      console.log("npm run dev");
    } else if (answers.backend === "Node.js (Express)") {
      console.log("\nRun backend:");
      console.log(`cd ${answers.projectName}/server`);
      console.log("npm run dev");
    }
  });