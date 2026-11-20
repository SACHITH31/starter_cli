const test = require("node:test");
const assert = require("node:assert/strict");
const { parseArguments } = require("../bin/arguments");

test("parses project name, stack options, and port", () => {
  const options = parseArguments(["node", "cli", "demo-app", "--react", "--node", "--ts", "--port", "4321", "--pm", "npm"]);
  assert.equal(options.cliProjectName, "demo-app");
  assert.equal(options.useReact, true);
  assert.equal(options.useNode, true);
  assert.equal(options.useTypeScript, true);
  assert.equal(options.cliPort, "4321");
  assert.equal(options.cliPackageManager, "npm");
});

test("parses presets and git flag", () => {
  const options = parseArguments(["node", "cli", "demo", "--preset", "backend", "--git"]);
  assert.equal(options.cliProjectName, "demo");
  assert.equal(options.cliPreset, "backend");
  assert.equal(options.useGit, true);
});

test("missing value is not consumed as another option", () => {
  const options = parseArguments(["node", "cli", "demo", "--port", "--node"]);
  assert.equal(options.cliPort, null);
  assert.equal(options.useNode, true);
});

test("defaults to interactive selection when no flags are supplied", () => {
  const options = parseArguments(["node", "cli"]);
  assert.equal(options.cliProjectName, null);
  assert.equal(options.cliPreset, null);
  assert.equal(options.useReact, false);
});
