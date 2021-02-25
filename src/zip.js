import * as fs from "fs";
import * as path from "path";
import * as childProcess from "child_process";
import archiver from "archiver";
import debug from "debug";

const SUBMISSIONS_DIR =
  process.env.PETIBRUGNON_SUBMISSIONS_DIR || ".petibrugnon/submissions";

const log = debug("zip");

export async function zip() {
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

  const gitignore = fs.readFileSync(".gitignore").toString();
  const archive = archiver("zip");
  archive.glob("**", { ignore: gitignore.split("\n") });
  archive.pipe(fs.createWriteStream(zipPath));
  await archive.finalize();
  log(`zip files to ${zipPath}`);
}
