#!/usr/bin/env node

import yargs from "yargs";
import * as commands from "./commands/commands.js";
import { createRootLogger } from "./logger.js";

yargs(process.argv.slice(2))
  .command("login", "", (yargs) => {}, handleCommand)
  .command("logout", "", (yargs) => {}, handleCommand)
  .command("download", "", (yargs) => {}, handleCommand)
  .command("upload", "", (yargs) => {}, handleCommand)
  .command("score", "", (yargs) => {}, handleCommand)
  .command(
    "run",
    "",
    (yargs) => {
      yargs.option("only", {
        description: "Run only tests with the given IDs",
        type: "array",
        default: [],
      });
    },
    handleCommand
  )
  .command(
    "parse",
    "",
    (yargs) => {
      yargs.option("schema", {
        description: "The path to a Jolicitron schema file",
        type: "string",
        default: "jolicitron.json",
      });
    },
    handleCommand
  )
  .demandCommand()
  .option("google-oauth-client-id", {
    alias: "cid",
    type: "string",
    description:
      "The ID of Google OAuth 2.0 client to use to authorize access to the Google Code Jam API.",
    demandOption: true,
  })
  .option("log-level", {
    alias: "ll",
    type: "string",
    default: "info",
    choices: ["fatal", "error", "warn", "info", "debug", "trace", "silent"],
    description:
      "The minimum level of log messages to output to stdout. The log file is not affected.",
  })
  .option("log-file", {
    alias: "lf",
    type: "string",
    default: ".petibrugnon/petibrugnon.log",
    description: "The path to a file to write log messages to.",
  })
  .option("config", {
    type: "string",
    description:
      "The path to a JSON configuration file that provides options. Use this to always run petibrugnon with the same options.",
    default: ".petibrugnonrc.json",
    config: true,
  })
  .strict()
  .help()
  .parse();

async function handleCommand(argv) {
  const logger = createRootLogger({ level: argv.logLevel, file: argv.logFile });
  logger.debug(argv, "Starting with argv");
  const {
    _: [commandName],
  } = argv;
  if (!commands[commandName]) {
    throw new Error(`Command not implemented: ${commandName}`);
  }
  await commands[commandName](argv, { logger });
}
