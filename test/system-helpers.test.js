const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const { createSystemHelpers } = require("../bin/system-helpers");

const helpers = createSystemHelpers(process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : undefined);

test("copyTemplate preserves template text", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "stack-starter-helper-"));
  try {
    const source = path.join(dir, "source.txt");
    const destination = path.join(dir, "destination.txt");
    fs.writeFileSync(source, "hello\\nworld\\n");
    helpers.copyTemplate(source, destination);
    assert.equal(fs.readFileSync(destination, "utf8"), "hello\\nworld\\n");
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("isPortFree reports a port occupied by a listener", async () => {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    // Use the same default bind address as isPortFree (IPv4/IPv6 differs by OS).
    server.listen(0, resolve);
  });
  try {
    assert.equal(await helpers.isPortFree(server.address().port), false);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
