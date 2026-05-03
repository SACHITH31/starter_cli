#!/usr/bin/env node

const inquirer = require("inquirer").default;
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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
      default: 2, // Sets "None" as default if you want, or change to 0 for HTML
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

    if (fs.existsSync(projectPath)) {
      console.log("\nA project with this name already exists.");
      return;
    }

    // Create Root Directory
    fs.mkdirSync(projectPath);

    // Create Base Files
    fs.writeFileSync(
      path.join(projectPath, ".gitignore"),
      "node_modules\n.env"
    );

    fs.writeFileSync(
      path.join(projectPath, "README.md"),
      `# ${answers.projectName}`
    );

    // --- BACKEND LOGIC ---
    // --- BACKEND LOGIC ---
    if (answers.backend === "Node.js (Express)") {
      const serverPath = path.join(projectPath, "server");
      fs.mkdirSync(serverPath);

      console.log("\nSetting up backend...");
      
      // 1. Initialize npm
      execSync("npm init -y", {
        cwd: serverPath,
        stdio: "inherit",
        shell: process.env.ComSpec
      });

      // 2. IMMEDIATELY Inject the scripts into package.json
      const pkgPath = path.join(serverPath, "package.json");
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        pkg.scripts = {
          "start": "node index.js",
          "dev": "nodemon index.js"
        };
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        console.log("✅ Scripts injected into package.json");
      }

      // 3. Install dependencies
      execSync("npm install express cors dotenv", {
        cwd: serverPath,
        stdio: "inherit",
        shell: process.env.ComSpec
      });

      execSync("npm install -D nodemon", {
        cwd: serverPath,
        stdio: "inherit",
        shell: process.env.ComSpec
      });

      // 4. Create the server file
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
});`
      );
    }

    // --- FRONTEND LOGIC (Unified) ---
    if (answers.frontend === "HTML / CSS / JavaScript") {
      const clientPath = path.join(projectPath, "client");
      fs.mkdirSync(clientPath);

      console.log("Setting up HTML/JS frontend...");

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

      // script.js (Connection logic)
      fs.writeFileSync(
        path.join(clientPath, "script.js"),
        `const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");

fetch("http://localhost:5000/")
  .then((res) => {
    if(res.ok) return res.text();
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
  });`
      );
    } else if (answers.frontend === "React.js (Vite)") {
      console.log("\nSetting up React with Vite...");
      execSync("npm create vite@latest client -- --template react", {
        cwd: projectPath,
        stdio: "inherit",
        shell: process.env.ComSpec
      });
    }

    console.log(`\n✅ Project "${answers.projectName}" created successfully!`);
    console.log(`\nNext steps:`);
    if (answers.backend !== "None") console.log(`1. cd ${answers.projectName}/server && npm run dev`);
    if (answers.frontend !== "None") console.log(`2. Open ${answers.projectName}/client/index.html in your browser`);
  });