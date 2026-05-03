#!/usr/bin/env node


// This is called a shebang.
// It helps when your CLI is installed globally later.

const inquirer = require("inquirer").default
const fs = require("fs")
const path = require("path")

inquirer
  .prompt([
    {
      name: "projectName",
      message: "Enter your project name:"
    },
    {
      name: "frontend",
      message: "Choose frontend:",
      type: "list",
      choices: ["React", "HTML"]
    },
    {
      name: "backend",
      message: "Choose backend:",
      type: "list",
      choices: ["Express", "None"]
    }
  ])
  .then((answers) => {
  const projectPath = path.join(process.cwd(), answers.projectName)

  fs.mkdirSync(projectPath)
  fs.mkdirSync(path.join(projectPath, "client"))
  fs.mkdirSync(path.join(projectPath, "server"))

  fs.writeFileSync(
    path.join(projectPath, ".gitignore"),
    "node_modules\n.env"
  )

  fs.writeFileSync(
    path.join(projectPath, "README.md"),
    `# ${answers.projectName}`
  )

  const serverTemplate = fs.readFileSync(
  path.join(process.cwd(), "templates", "server", "index.js"),
  "utf-8"
)

const clientTemplate = fs.readFileSync(
  path.join(process.cwd(), "templates", "client", "package.json"),
  "utf-8"
)

fs.writeFileSync(
  path.join(projectPath, "server", "index.js"),
  serverTemplate
)

fs.writeFileSync(
  path.join(projectPath, "client", "package.json"),
  clientTemplate
)

  console.log("\nProject created successfully!")
})