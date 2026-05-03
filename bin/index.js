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

  fs.writeFileSync(
    path.join(projectPath, "server", "index.js"),
    'console.log("Server running")'
  )

  fs.writeFileSync(
    path.join(projectPath, "client", "package.json"),
    JSON.stringify(
      {
        name: "client",
        version: "1.0.0"
      },
      null,
      2
    )
  )

  console.log("\nProject created successfully!")
})