import * as path from "path";

const projectDirectory = path.resolve(".");
const stashDirectory = path.resolve(projectDirectory, ".petibrugnon");

export default {
  directories: {
    project: projectDirectory,
    stash: stashDirectory,
  },
};
