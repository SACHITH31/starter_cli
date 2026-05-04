#!/usr/bin/env node

// -----------------------------
// Required packages
// -----------------------------
const inquirer = require("inquirer").default;
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// -----------------------------
// Ask user for project details
// -----------------------------
inquirer
  .prompt([
    {
      name: "projectName",
      message: "Enter your project name:",
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
//     {
//   name: "initGit",
//   message: "Initialize git repository?",
//   type: "confirm",
//   default: true,
// }
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
    // Create base files
    // -----------------------------
    fs.writeFileSync(
      path.join(projectPath, ".gitignore"),
      "node_modules\n.env"
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

      // Initialize npm inside server folder
      execSync("npm init -y", {
        cwd: serverPath,
        stdio: "inherit",
        shell: process.env.ComSpec,
      });

      // Inject useful scripts immediately
      const pkgPath = path.join(serverPath, "package.json");

      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

        pkg.scripts = {
          start: "node index.js",
          dev: "nodemon index.js",
        };

        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

        console.log("✅ Scripts injected into package.json");
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

      // Create starter backend file
      fs.writeFileSync(
        path.join(serverPath, "index.js"),
        `const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running and connected to Frontend!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`
      );
    }

    // =====================================================
    // FRONTEND SETUP - HTML / CSS / JS
    // =====================================================
    if (answers.frontend === "HTML / CSS / JavaScript") {
      const clientPath = path.join(projectPath, "client");

      fs.mkdirSync(clientPath);

      console.log("\nSetting up HTML/JS frontend...");

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
  <h1>Frontend Status: <span id="status">Connecting...</span></h1>

  <div id="response-box" style="padding: 20px; border: 1px solid #ccc; margin-top: 20px;">
    Backend Message: <strong id="message">Waiting for server...</strong>
  </div>

  <script src="script.js"></script>
</body>
</html>`
      );

      // style.css
      fs.writeFileSync(
        path.join(clientPath, "style.css"),
        `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 40px;
  background-color: #f4f4f4;
  text-align: center;
}

#response-box {
  background: white;
  display: inline-block;
  border-radius: 8px;
}`
      );

      // script.js
      // If backend exists, this will connect automatically.
      fs.writeFileSync(
        path.join(clientPath, "script.js"),
        `const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");

fetch("http://localhost:5000/")
  .then((res) => {
    if (res.ok) return res.text();
    throw new Error("Network response was not ok");
  })
  .then((data) => {
    statusEl.textContent = "Online";
    statusEl.style.color = "green";
    messageEl.textContent = data;
    console.log("Success:", data);
  })
  .catch((err) => {
    statusEl.textContent = "Offline";
    statusEl.style.color = "red";
    messageEl.textContent = "Could not connect to backend (is it running?)";
    console.error("Error:", err);
  });
`
      );
    }

    // =====================================================
    // FRONTEND SETUP - REACT (VITE)
    // =====================================================
    else if (answers.frontend === "React.js (Vite)") {
      const clientPath = path.join(projectPath, "client");

      console.log("\nScaffolding React project...");

      // Create Vite React project
      execSync("npm create vite@latest client --yes -- --template react", {
        cwd: projectPath,
        stdio: ["ignore", "pipe", "pipe"],
        shell: process.env.ComSpec,
      });

      // Install dependencies
      console.log("Installing React dependencies (this may take a minute)...");

      execSync("npm install", {
        cwd: clientPath,
        stdio: "inherit",
        shell: process.env.ComSpec,
      });

      console.log("✅ React installation complete!");

      // Only overwrite App.jsx if backend also exists
      if (answers.backend === "Node.js (Express)") {
        fs.writeFileSync(
          path.join(clientPath, "src", "App.jsx"),
          `import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");

  useEffect(() => {
    fetch("http://localhost:5000/")
      .then((res) => res.text())
      .then((data) => {
        setMessage(data);
      })
      .catch(() => {
        setMessage("Could not connect to backend");
      });
  }, []);

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>React Frontend Connected</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
`
        );
      }
    }

    // =====================================================
    // FINAL SUCCESS MESSAGE
    // =====================================================
    console.log(`\n✅ Project "${answers.projectName}" created successfully!`);
    console.log(`\nNext steps:`);

    if (answers.backend !== "None") {
      console.log(`1. cd ${answers.projectName}/server`);
      console.log(`2. npm run dev`);
    }

    if (answers.frontend === "HTML / CSS / JavaScript") {
      console.log(`3. Open ${answers.projectName}/client/index.html in your browser`);
    }

    if (answers.frontend === "React.js (Vite)") {
      console.log(`3. cd ${answers.projectName}/client`);
      console.log(`4. npm run dev`);
    }
  });