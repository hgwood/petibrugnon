import { mkdirSync, readFileSync } from "fs";
import * as path from "path";
import parseIgnoreFile from "parse-gitignore";

const projectDirectory = path.resolve(".");
const gitginoreFile = path.resolve(projectDirectory, ".gitignore");
const petibrugnonignoreFile = path.resolve(
  projectDirectory,
  ".petibrugnonignore"
);
const stashDirectory = path.resolve(projectDirectory, ".petibrugnon");
const sourcesZipFile = path.resolve(stashDirectory, "sources.zip");
const statementFile = path.resolve(stashDirectory, "statement.html");
const inputsDirectory = path.resolve(stashDirectory, "inputs");
const inputsJsonDirectory = path.resolve(stashDirectory, "inputs.json");
const outputsDirectory = path.resolve(stashDirectory, "outputs");
const metaFile = path.resolve(stashDirectory, "meta.json");
const inputToTestMappingFile = path.resolve(
  stashDirectory,
  "inputToTestMapping.json"
);
const credentialsFile = path.resolve(stashDirectory, "credentials.json");
const runSaveFile = path.resolve(stashDirectory, "runSaveFile.sh");

/**
 *
 * @param {string} filePath
 * @returns {any}
 */
function parseFile(filePath) {
  try {
    return JSON.parse(readFileSync(filePath).toString());
  } catch (err) {
    return null;
  }
}

function parseIgnoreFiles() {
  try {
    return parseIgnoreFile(readFileSync(petibrugnonignoreFile).toString());
  } catch (err) {}
  try {
    return parseIgnoreFile(readFileSync(gitginoreFile).toString());
  } catch (err) {
    return [];
  }
}

function relative(filePath) {
  return path.relative(projectDirectory, filePath);
}

mkdirSync(stashDirectory, { recursive: true });
const meta = parseFile(metaFile);

export default {
  paths: {
    project: projectDirectory,
    stash: stashDirectory,
    sourcesZip: sourcesZipFile,
    statement: statementFile,
    inputs: inputsDirectory,
    inputsJson: inputsJsonDirectory,
    outputs: outputsDirectory,
    meta: metaFile,
    inputToTestMapping: inputToTestMappingFile,
    credentials: credentialsFile,
    ignore: parseIgnoreFiles(),
    runSave: runSaveFile,
    relative: {
      sourcesZip: relative(sourcesZipFile),
      statement: relative(statementFile),
      inputs: relative(inputsDirectory),
      inputsJson: relative(inputsJsonDirectory),
      outputs: relative(outputsDirectory),
      meta: relative(metaFile),
      credentials: relative(credentialsFile),
      of(filePath) {
        return relative(filePath);
      },
    },
  },
  meta: {
    challengeId: meta?.id,
    taskId: meta?.tasks[0].id,
    competitorId: meta?.ticket.competitor?.id,
    tests: meta?.tasks[0].tests,
  },
  inputToTestMapping: parseFile(inputToTestMappingFile),
};
