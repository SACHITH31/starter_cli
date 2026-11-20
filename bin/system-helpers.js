"use strict";

const fs = require("node:fs");
const net = require("node:net");
const { execSync } = require("node:child_process");

// Keep OS-specific command execution consistent with the CLI.
function createSystemHelpers(shell) {
  function copyTemplate(source, destination) {
    const content = fs.readFileSync(source, "utf-8");
    fs.writeFileSync(destination, content);
  }

  function isPackageManagerInstalled(pm) {
    try {
      execSync(`${pm} --version`, {
        stdio: "ignore",
        shell,
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
        shell,
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
      const name = execSync("git config --global user.name", {
        shell,
      })
        .toString()
        .trim();

      const email = execSync("git config --global user.email", {
        shell,
      })
        .toString()
        .trim();

      return name && email;
    } catch {
      return false;
    }
  }

  return { copyTemplate, isPackageManagerInstalled, isGitInstalled, isPortFree, isGitConfigured };
}

module.exports = { createSystemHelpers };
