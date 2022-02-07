import { readdir } from "fs/promises";
import * as path from "path";
import { inspect } from "util";
import concurrently from "concurrently";
import env from "./env.js";

export async function run(argv) {
  const [, command, ...args] = argv._;
  const inputFileNames = await readdir(env.paths.inputs);
  console.log(
    `[petibrugnon] Running '${command} ${args.join(" ")}' on ${
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
      command: `${command} ${args.join(" ")}`,
      name: testName,
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
