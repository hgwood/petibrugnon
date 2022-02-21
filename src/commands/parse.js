import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import jolicitron from "jolicitron";
import path from "path";
import env from "../env.js";

export async function parse(argv, { logger }) {
  const schemaFilePath = path.resolve(env.paths.project, argv.schema);
  const schemaFileContent = (await readFile(schemaFilePath)).toString();
  let schema = null;
  try {
    schema = JSON.parse(schemaFileContent);
  } catch (err) {
    logger.error(`Cannot parse schema file '${schemaFilePath}': ${err}`);
    throw err;
  }
  const inputFileNames = await readdir(env.paths.inputs);
  for (const inputFileName of inputFileNames) {
    const inputFilePath = path.resolve(env.paths.inputs, inputFileName);
    const inputFileContent = (await readFile(inputFilePath)).toString();
    const parsedInput = await jolicitron.default(schema, inputFileContent);
    await mkdir(env.paths.inputsJson, { recursive: true });
    const parsedFilePath = path.resolve(
      env.paths.inputsJson,
      inputFileName + ".json"
    );
    await writeFile(parsedFilePath, JSON.stringify(parsedInput, null, 2));
    logger.info(
      `Parsed '${env.paths.relative.of(
        inputFilePath
      )}' into '${env.paths.relative.of(parsedFilePath)}'`
    );
  }
}
