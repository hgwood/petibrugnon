import { readFileSync } from "fs";
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
const outputsDirectory = path.resolve(stashDirectory, "outputs");
const metaFile = path.resolve(stashDirectory, "meta.json");

function parseMetaFile() {
  try {
    return JSON.parse(readFileSync(metaFile).toString());
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

const meta = parseMetaFile();

export default {
  paths: {
    project: projectDirectory,
    stash: stashDirectory,
    sourcesZip: sourcesZipFile,
    statement: statementFile,
    inputs: inputsDirectory,
    outputs: outputsDirectory,
    meta: metaFile,
    ignore: parseIgnoreFiles(),
    relative: {
      sourcesZip: relative(sourcesZipFile),
      statement: relative(statementFile),
      inputs: relative(inputsDirectory),
      outputs: relative(outputsDirectory),
      meta: relative(metaFile),
    },
  },
  meta: {
    challengeId: meta?.id,
    taskId: meta?.tasks[0].id,
  },
  token: process.env.PETIBRUGNON_TOKEN,
};
