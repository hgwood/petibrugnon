import { readdir, readFile, writeFile } from "fs/promises";
import * as path from "path";
import { inspect } from "util";
import {
  concurrently,
  Logger as ConcurentlyLogger,
  KillOnSignal,
  KillOthers,
  LogError,
  LogExit,
  LogTimings,
  RestartProcess,
} from "concurrently";
import env from "../env.js";
import fs from "fs";
import { pipeline } from "stream/promises";

export async function run(argv, { logger }) {
  await mkdir(env.paths.outputs, { recursive: true });
  const testNames = Object.values(env.meta.tests).map(({ name }) => name);
  const testNameMaxLength = testNames.reduce(
    (maxLength, name) => Math.max(maxLength, name.length),
    0
  );
  const argvCommand = argv._.slice(1).join(" ").trim();
  const savedCommand = await restoreCommand();
  const command = argvCommand || savedCommand;
  if (!command) {
    throw new Error(`No command to run.`);
  }
  await saveCommand(command);
  const inputFileNames = await readdir(env.paths.inputs);
  if (inputFileNames.length === 0) {
    logger.error(`There are no input files in '${env.paths.inputs}'.`);
    return;
  }
  logger.info(
    `Running '${command}' on ${inputFileNames.length} files: ${inspect(
      inputFileNames,
      {
        maxArrayLength: 3,
        breakLength: Infinity,
      }
    )}`
  );
  const inputs = inputFileNames.map((inputFileName) => {
    const testId = env.inputToTestMapping[inputFileName];
    const testName = env.meta.tests[testId].name;
    return {
      fileName: inputFileName,
      testId,
      testName,
    };
  });
  const outputPaths = [];
  const inputPaths = [];
  const commands = inputs
    .filter(
      ({ testId }) => argv.only.length === 0 || argv.only.includes(testId)
    )
    .map(({ fileName, testId, testName }) => {
      const inputPath = path.join(env.paths.inputs, fileName);
      const outputPath = path.join(env.paths.outputs, fileName);
      outputPaths.push(outputPath);
      inputPaths.push(inputPath);
      return {
        command: command,
        name: testName.padEnd(testNameMaxLength),
        env: {
          PETIBRUGNON_INPUT_FILE_PATH: inputPath,
          PETIBRUGNON_INPUT_JSON_FILE_PATH: path.join(
            env.paths.inputsJson,
            fileName + ".json"
          ),
          PETIBRUGNON_OUTPUT_FILE_PATH: outputPath,
          PETIBRUGNON_TEST_ID: testId,
          PETIBRUGNON_TEST_NAME: testName,
        },
      };
    });
  if (commands.length === 0) {
    const availableTests = inputs.map(({ testId }) => testId).join(" ");
    const selectedTests = argv.only.join(" ");
    logger.error(
      `'--only ${selectedTests}' results in to tests running. Available tests are: ${availableTests}.`
    );
    return;
  }
  const concurrentlylogger = new ConcurentlyLogger({
    prefixFormat: "[{time}] ({name}):",
    timestampFormat: "HH:mm:ss.SSS",
  });
  await concurrently(commands, {
    logger: concurrentlylogger,
    outputStream: process.stdout,
    controllers: [
      new LogError({ logger: concurrentlylogger }),
      new LogExit({ logger: concurrentlylogger }),
      new PetiBrugnonController({
        logger: concurrentlylogger,
        outputPaths,
        inputPaths,
      }),
      new KillOnSignal({ process }),
      new RestartProcess({
        logger: concurrentlylogger,
      }),
      new KillOthers({
        logger: concurrentlylogger,
        conditions: undefined,
      }),
      new LogTimings({
        logger: concurrentlylogger,
        timestampFormat: "HH:mm:ss.SSS",
      }),
    ],
    prefixColors: ["green", "yellow", "blue", "magenta", "cyan"],
  });
}

async function restoreCommand() {
  try {
    return (await readFile(env.paths.runSave)).toString().trim();
  } catch (err) {
    return "";
  }
}

async function saveCommand(command) {
  await writeFile(env.paths.runSave, command);
}

class PetiBrugnonController {
  constructor(options) {
    this.logger = options.logger;
    this.outputPaths = options.outputPaths;
    this.inputPaths = options.inputPaths;
  }
  handle(commands) {
    commands.forEach((command, index) => {
      const outputStream = fs.createWriteStream(this.outputPaths[index]);
      command.stdout.subscribe(
        (text) => outputStream.write(text),
        (err) => {
          this.logger.logCommandText(
            `Error while output command: ${err}`,
            command
          );
        }
      );
      command.stderr.subscribe(
        (text) => this.logger.logCommandText(text.toString(), command),
        (err) => {
          this.logger.logCommandText(
            `Error while error command: ${err}`,
            command
          );
        }
      );
      command.close.subscribe(
        () => {
          outputStream.close();
        },
        (err) => {
          this.logger.logCommandText(
            `Error while close command: ${err}`,
            command
          );
        }
      );
    });
    return { commands };
  }
}
