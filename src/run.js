import { readdir, readFile, writeFile } from "fs/promises";
import * as path from "path";
import { inspect } from "util";
import concurrently from "concurrently";
import env from "./env.js";

export async function run(argv) {
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
  console.log(
    `[petibrugnon] Running '${command}' on ${
      inputFileNames.length
    } files: ${inspect(inputFileNames, {
      maxArrayLength: 3,
      breakLength: Infinity,
    })}`
  );
  const commands = inputFileNames.map((inputFileName) => {
    const testId = env.inputToTestMapping[inputFileName];
    const testName = env.meta.tests[testId].name;
    return {
      command: command,
      name: testName.padEnd(testNameMaxLength),
      env: {
        PETIBRUGNON_INPUT_FILE_PATH: path.join(env.paths.inputs, inputFileName),
        PETIBRUGNON_OUTPUT_FILE_PATH: path.join(
          env.paths.outputs,
          inputFileName
        ),
        PETIBRUGNON_TEST_ID: testId,
        PETIBRUGNON_TEST_NAME: testName,
      },
    };
  });
  await concurrently(commands, {
    prefix: "{time} [{name}]",
    timestampFormat: "HH:mm:ss.SSS",
  }).result;
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