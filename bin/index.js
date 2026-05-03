#!/usr/bin/env node

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
      type: "rawlist",
      choices: [
        "HTML / CSS / JavaScript",
        "React.js (Vite)",
        "None"
      ],
      default: 3,
    },
    {
      name: "backend",
      message: "Choose backend:",
      type: "rawlist",
      choices: [
        "Node.js (Express)",
        "None"
      ],
      default: 2,
    },
  ])
  .then((answers) => {
    const projectPath = path.join(process.cwd(), answers.projectName);

    if (fs.existsSync(projectPath)) {
      console.log("\nA project with this name already exists.");
      return;
    }

    fs.mkdirSync(projectPath);

    fs.writeFileSync(
      path.join(projectPath, ".gitignore"),
      "node_modules\n.env"
    );

    fs.writeFileSync(
      path.join(projectPath, "README.md"),
      `# ${answers.projectName}`
    );

    if (answers.frontend !== "None") {
      fs.mkdirSync(path.join(projectPath, "client"));
    }

    if (answers.backend !== "None") {
      fs.mkdirSync(path.join(projectPath, "server"));
    }

    if (answers.frontend === "1. HTML / CSS / JavaScript") {
      fs.writeFileSync(
        path.join(projectPath, "client", "index.html"),
        `<!DOCTYPE html>
<html>
<head>
  <title>${answers.projectName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World</h1>

  <script src="script.js"></script>
</body>
</html>`
      );

      fs.writeFileSync(
        path.join(projectPath, "client", "style.css"),
        `body {
  font-family: Arial, sans-serif;
}`
      );

      fs.writeFileSync(
        path.join(projectPath, "client", "script.js"),
        `console.log("JavaScript connected");`
      );
    }

    console.log("\nProject created successfully!");
  });