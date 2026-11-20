const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const cli = path.join(__dirname, "..", "bin", "index.js");

function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "stack-starter-test-"));
  const bin = path.join(root, "mock-bin");
  fs.mkdirSync(bin);
  const mock = String.raw`
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
if (args.includes("--version")) { console.log("10.0.0"); process.exit(0); }
if (args[0] === "init") {
  fs.writeFileSync(path.join(process.cwd(), "package.json"), JSON.stringify({ name: "mock-backend", version: "1.0.0" }));
  process.exit(0);
}
if (args[0] === "install") {
  if (process.env.MOCK_FAIL_INSTALL === "1") process.exit(7);
  process.exit(0);
}
if (args[0] === "create" && args.some(a => a.startsWith("vite"))) {
  const dir = path.join(process.cwd(), "client");
  fs.mkdirSync(path.join(dir, "src"), { recursive: true });
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify({ scripts: { build: "vite build" } }));
  fs.writeFileSync(path.join(dir, "src", "App.jsx"), "export default function App() { return null; }");
  process.exit(0);
}
console.error("Unexpected npm invocation", args);
process.exit(9);
`.trimStart();
  fs.writeFileSync(path.join(bin, "mock-npm.js"), mock);
  if (process.platform === "win32") {
    fs.writeFileSync(path.join(bin, "npm.cmd"), '@echo off\r\nnode "%~dp0mock-npm.js" %*\r\n');
  } else {
    const launcher = path.join(bin, "npm");
    fs.writeFileSync(launcher, '#!/bin/sh\nexec node "$(dirname "$0")/mock-npm.js" "$@"\n');
    fs.chmodSync(launcher, 0o755);
  }
  return { root, bin };
}

function run(root, bin, args, extraEnv = {}) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: "utf8",
    timeout: 30000,
    input: "",
    env: { ...process.env, PATH: bin + path.delimiter + process.env.PATH, ...extraEnv },
  });
}

function withSandbox(fn) {
  const { root, bin } = sandbox();
  try { fn(root, bin); } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

test("standalone HTML project has expected files and no server", () => withSandbox((root, bin) => {
  const result = run(root, bin, ["html-app", "--html", "--pm", "npm"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const project = path.join(root, "html-app");
  assert.ok(fs.existsSync(path.join(project, "client", "index.html")));
  assert.ok(fs.existsSync(path.join(project, "client", "script.js")));
  assert.ok(fs.existsSync(path.join(project, "client", "style.css")));
  assert.ok(!fs.existsSync(path.join(project, "server")));
}));

test("backend scaffold writes configured port and package scripts", () => withSandbox((root, bin) => {
  const result = run(root, bin, ["api-app", "--node", "--port", "43210", "--pm", "npm"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const project = path.join(root, "api-app");
  assert.match(fs.readFileSync(path.join(project, "server", ".env"), "utf8"), /PORT=43210/);
  const pkg = JSON.parse(fs.readFileSync(path.join(project, "server", "package.json"), "utf8"));
  assert.equal(pkg.scripts.start, "node index.js");
  assert.equal(pkg.scripts.dev, "nodemon index.js");
}));

test("React plus backend scaffold substitutes the chosen port", () => withSandbox((root, bin) => {
  const result = run(root, bin, ["full-app", "--react", "--node", "--port", "43211", "--pm", "npm"]);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const app = fs.readFileSync(path.join(root, "full-app", "client", "src", "App.jsx"), "utf8");
  assert.match(app, /43211/);
  assert.ok(fs.existsSync(path.join(root, "full-app", "server", "index.js")));
}));

test("backend install failure removes incomplete project", () => withSandbox((root, bin) => {
  const result = run(root, bin, ["failed-app", "--node", "--port", "43212", "--pm", "npm"], { MOCK_FAIL_INSTALL: "1" });
  assert.equal(result.status, 1, result.stderr + result.stdout);
  assert.match(result.stderr + result.stdout, /incomplete project removed/);
  assert.ok(!fs.existsSync(path.join(root, "failed-app")));
}));

test("existing project is never overwritten", () => withSandbox((root, bin) => {
  const project = path.join(root, "existing");
  fs.mkdirSync(project);
  fs.writeFileSync(path.join(project, "sentinel.txt"), "preserve me");
  const result = run(root, bin, ["existing", "--html", "--pm", "npm"]);
  assert.equal(result.status, 1);
  assert.equal(fs.readFileSync(path.join(project, "sentinel.txt"), "utf8"), "preserve me");
}));
