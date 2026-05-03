#!/usr/bin/env node

// This is called a shebang.
// It helps when your CLI is installed globally later.

const inquirer = require("inquirer").default;
const fs = require("fs");
const path = require("path");

inquirer
  .prompt([
    {
      name: "projectName",
      message: "Enter your project name:",
    },
    {
      name: "frontend",
      message: "Choose frontend:",
      type: "list",
      choices: ["None", "React", "HTML"],
      default: "None",
    },
    {
      name: "backend",
      message: "Choose backend:",
      type: "list",
      choices: ["None", "Node", "Express"],
      default: "None",
    },
  ])
  .then((answers) => {
    const projectPath = path.join(process.cwd(), answers.projectName);
    const backend = answers.backend.toLowerCase();

    if (fs.existsSync(projectPath)) {
      console.log("\nA project with this name already exists.");
      return;
    }

    fs.mkdirSync(projectPath);

    if (answers.frontend !== "None") {
      fs.mkdirSync(path.join(projectPath, "client"));
    }

    if (backend !== "none") {
      fs.mkdirSync(path.join(projectPath, "server"));
    }

    fs.writeFileSync(
      path.join(projectPath, ".gitignore"),
      "node_modules\n.env",
    );

    fs.writeFileSync(
      path.join(projectPath, "README.md"),
      `# ${answers.projectName}`,
    );

    if (answers.frontend !== "None") {
      const clientTemplate = fs.readFileSync(
        path.join(process.cwd(), "templates", "client", "package.json"),
        "utf-8",
      );

      fs.writeFileSync(
        path.join(projectPath, "client", "package.json"),
        clientTemplate,
      );
    }

    if (backend !== "none") {
      const serverTemplate = fs.readFileSync(
        path.join(process.cwd(), "templates", "server", "index.js"),
        "utf-8",
      );

      fs.writeFileSync(
        path.join(projectPath, "server", "index.js"),
        serverTemplate,
      );
    }

    console.log("\nProject created successfully!");
  });
