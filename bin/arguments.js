"use strict";

// Parse command-line options without changing existing CLI exit behavior.
function parseArguments(argv = process.argv) {
  // ------------------------------------------------
  // VALID FLAGS
  // ------------------------------------------------
  const validFlags = [
    "--help",
    "-h",
    "--version",
    "-v",
    "--react",
    "--ts",
    "--html",
    "--node",
    "--port",
    "--pm",
    "--git",
    "--preset",
  ];

  // ------------------------------------------------
  // INVALID FLAG CHECK
  // ------------------------------------------------
  const invalidFlags = argv
    .slice(2)
    .filter((arg) => arg.startsWith("-") && !validFlags.includes(arg));

  if (invalidFlags.length > 0) {
    console.log(`
  Invalid flag(s):
  ${invalidFlags.join("\n")}

  Use --help to see available options.
  `);
    process.exit(1);
  }

  // ------------------------------------------------
  // CLI FLAGS
  // ------------------------------------------------
  const args = argv.slice(2);
  const valueFlags = new Set(["--port", "--pm", "--preset"]);
  const positionalArgs = [];
  for (let i = 0; i < args.length; i++) {
    if (valueFlags.has(args[i])) {
      // Consume only a genuine value, not the next option.
      if (i + 1 < args.length && !args[i + 1].startsWith("-")) {
        i++;
      }
    } else if (!args[i].startsWith("-")) {
      positionalArgs.push(args[i]);
    }
  }
  if (positionalArgs.length > 1) {
    console.error("\nProvide only one project name.");
    process.exit(1);
  }
  const cliProjectName = positionalArgs[0] || null;

  const useReact = argv.includes("--react");
  const useTypeScript = argv.includes("--ts");
  const useHtml = argv.includes("--html");
  const useNode = argv.includes("--node");
  const useGit = argv.includes("--git");

  const portIndex = argv.indexOf("--port");

  const cliPort =
    portIndex !== -1 &&
    argv[portIndex + 1] &&
    !argv[portIndex + 1].startsWith("-")
      ? argv[portIndex + 1]
      : null;

  const pmIndex = argv.indexOf("--pm");

  const cliPackageManager =
    pmIndex !== -1 &&
    argv[pmIndex + 1] &&
    !argv[pmIndex + 1].startsWith("-")
      ? argv[pmIndex + 1]
      : null;

  const presetIndex = argv.indexOf("--preset");

  const cliPreset =
    presetIndex !== -1 &&
    argv[presetIndex + 1] &&
    !argv[presetIndex + 1].startsWith("-")
      ? argv[presetIndex + 1]
      : null;


  return { args, cliProjectName, useReact, useTypeScript, useHtml, useNode, useGit, portIndex, cliPort, pmIndex, cliPackageManager, presetIndex, cliPreset, valueFlags };
}

module.exports = { parseArguments };
