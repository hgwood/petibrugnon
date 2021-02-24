import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";
import archiver from "archiver";
import glob from "glob";

const SUBMISSIONS_DIR =
  process.env.PETIBRUGNON_SUBMISSIONS_DIR || ".petibrugnon/submissions";

const sha1 = childProcess
  .execSync("git rev-parse HEAD", { encoding: "utf8" })
  .trim();
const date = new Date().toISOString().replace(/:/g, "-");
const zipPath = path.resolve(
  SUBMISSIONS_DIR,
  `submission-sources-${date}-${sha1}.zip`
);

try {
  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
} catch (err) {
  if (err.code !== "EEXIST") throw err;
}

const files = glob.sync("!(node_modules)", {});
const archive = archiver("zip");
files.forEach((file) => archive.file(file, { name: path.basename(file) }));
archive.pipe(fs.createWriteStream(zipPath));
archive.finalize().then(() => {
  console.log(`wrote ${files.length} files to ${zipPath}`);
});
