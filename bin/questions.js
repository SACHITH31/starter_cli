"use strict";

// Build the existing interactive question set independently of the CLI entrypoint.
function createQuestions({ cliProjectName, cliPreset, cliFrontend, cliBackend, cliPort, cliPackageManager }) {
  return [
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

      choices: ["HTML / CSS / JavaScript + Node.js", "React.js + Node.js"],

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
  ];
}

module.exports = { createQuestions };
