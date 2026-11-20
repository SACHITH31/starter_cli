const test = require("node:test");
const assert = require("node:assert/strict");
const { createQuestions } = require("../bin/questions");

const defaults = {
  cliProjectName: null,
  cliPreset: null,
  cliFrontend: null,
  cliBackend: null,
  cliPort: null,
  cliPackageManager: null,
};

function question(questions, name) {
  return questions.find((item) => item.name === name);
}

test("interactive mode asks for a project, frontend, backend and package manager", () => {
  const questions = createQuestions(defaults);
  assert.equal(question(questions, "projectName").when, true);
  assert.equal(question(questions, "frontend").when, true);
  assert.equal(question(questions, "backend").when, true);
  assert.equal(question(questions, "packageManager").when, true);
});

test("CLI-provided values suppress corresponding interactive questions", () => {
  const questions = createQuestions({ ...defaults, cliProjectName: "demo", cliFrontend: "React.js (Vite)", cliBackend: "None", cliPackageManager: "npm" });
  assert.equal(question(questions, "projectName").when, false);
  assert.equal(question(questions, "frontend").when, false);
  assert.equal(question(questions, "backend").when, false);
  assert.equal(question(questions, "packageManager").when, false);
});

test("backend port prompt only appears when a port was not supplied", () => {
  const questions = createQuestions({ ...defaults, cliBackend: "Node.js (Express)" });
  const port = question(questions, "port");
  assert.equal(port.when({}), true);
  assert.equal(port.validate("4321"), true);
  assert.notEqual(port.validate("65536"), true);
  const supplied = createQuestions({ ...defaults, cliBackend: "Node.js (Express)", cliPort: "4321" });
  assert.equal(question(supplied, "port").when({}), false);
});

test("frontend preset displays only preset selection", () => {
  const questions = createQuestions({ ...defaults, cliPreset: "frontend" });
  assert.equal(questions.filter((item) => item.name === "presetChoice" && item.when).length, 1);
  assert.equal(question(questions, "frontend").when, false);
});
