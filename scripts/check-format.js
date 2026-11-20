"use strict";

const fs = require("node:fs");
const path = require("node:path");

const roots = ["bin", "test"];
const files = [];

function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(filename);
    else if (entry.isFile() && filename.endsWith(".js")) files.push(filename);
  }
}

for (const root of roots) collect(root);

let errors = 0;
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (!content.endsWith("\n")) {
    console.error(`${file}: missing final newline`);
    errors++;
  }
  if (content.includes("\r")) {
    console.error(`${file}: use LF line endings`);
    errors++;
  }
  for (const [index, line] of content.split("\n").entries()) {
    if (/[ \t]+$/.test(line)) {
      console.error(`${file}:${index + 1}: trailing whitespace`);
      errors++;
    }
  }
}
if (errors) process.exitCode = 1;
else console.log(`Formatting hygiene passed for ${files.length} JavaScript files.`);
