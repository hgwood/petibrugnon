import { readFileSync, rmSync } from "fs";
import * as path from "path";
import parseIgnoreFile from "parse-gitignore";
import assert from "assert";

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
const inputToTestMappingFile = path.resolve(
  stashDirectory,
  "inputToTestMapping.json"
);
const credentialsFile = path.resolve(stashDirectory, "credentials.json");

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

function parseCredentialsFile() {
  try {
    const credentials = JSON.parse(readFileSync(credentialsFile).toString());
    assert.ok(
      credentials.expiry_date,
      "expiry_date missing in credentials file"
    );
    assert.ok(
      credentials.access_token,
      "access_token missing in credentials file"
    );
    if (new Date() <= new Date(credentials.expiry_date)) {
      console.log(`[petibrugnon] [INFO] Logged in using cached credentials`);
      return credentials.access_token;
    } else {
      console.warn(
        `[petibrugnon] [INFO] Credentials file at '${relative(
          credentialsFile
        )}' exists but token has expired. You are now logged out.`
      );
      rmSync(credentialsFile);
      return null;
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.warn(
        `[petibrugnon] [WARN] Credentials file at '${relative(
          credentialsFile
        )}' exists but cannot be parsed. You are now logged out.`
      );
    }
    rmSync(credentialsFile, { force: true });
    return null;
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
    inputToTestMapping: inputToTestMappingFile,
    credentials: credentialsFile,
    ignore: parseIgnoreFiles(),
    relative: {
      sourcesZip: relative(sourcesZipFile),
      statement: relative(statementFile),
      inputs: relative(inputsDirectory),
      outputs: relative(outputsDirectory),
      meta: relative(metaFile),
      credentials: relative(credentialsFile),
    },
  },
  meta: {
    challengeId: meta?.id,
    taskId: meta?.tasks[0].id,
    competitorId: meta?.ticket.competitor.id,
    tests: meta?.tasks[0].tests,
  },
  inputToTestMapping: JSON.parse(
    readFileSync(inputToTestMappingFile).toString()
  ),
  token: parseCredentialsFile(),
};
