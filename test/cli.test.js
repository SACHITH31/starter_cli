const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const cli = path.join(__dirname, "..", "bin", "index.js");
const run = (...args) => spawnSync(process.execPath, [cli, ...args], {
  encoding: "utf8",
  timeout: 10000,
  input: "",
});

test("help displays usage", () => {
  const result = run("--help");
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
});

test("version matches package metadata", () => {
  const result = run("--version");
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), require("../package.json").version);
});

for (const [name, args, expected] of [
  ["unknown option", ["--unexpected"], /Invalid flag/],
  ["conflicting frontends", ["--react", "--html"], /cannot use/],
  ["missing port value", ["example", "--node", "--port"], /valid port/],
  ["out-of-range port", ["example", "--node", "--port", "65536"], /between 1 and 65535/],
  ["invalid package manager", ["example", "--pm", "other"], /Invalid package manager/],
  ["invalid preset", ["example", "--preset", "unknown"], /Invalid preset/],
  ["invalid project name", ["../escape", "--html"], /only letters/],
  ["multiple project names", ["first", "second", "--html"], /only one project name/],
  ["duplicate value flag", ["example", "--pm", "npm", "--pm", "npm"], /Do not repeat/],
]) {
  test(name + " is rejected before scaffolding", () => {
    const result = run(...args);
    assert.equal(result.status, 1, result.stderr + result.stdout);
    assert.match(result.stdout + result.stderr, expected);
  });
}

test("package lock metadata matches package version and CLI name", () => {
  const pkg = require("../package.json");
  const lock = require("../package-lock.json");
  assert.equal(lock.name, pkg.name);
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].name, pkg.name);
  assert.equal(lock.packages[""].version, pkg.version);
  for (const [command, entry] of Object.entries(pkg.bin)) {
    assert.equal(lock.packages[""].bin[command].replace(/^\\.\\//, ""), entry.replace(/^\\.\\//, ""));
  }
});
