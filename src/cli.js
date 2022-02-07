import yargs from "yargs";
import { login } from "./login.js";
import { logout } from "./logout.js";
import { download } from "./download.js";
import { upload } from "./upload.js";
import { score } from "./score.js";
import { run } from "./run.js";

yargs(process.argv.slice(2))
  .command(
    "login",
    "",
    (yargs) => {},
    async (argv) => {
      await login();
    }
  )
  .command(
    "logout",
    "",
    (yargs) => {},
    async (argv) => {
      await logout();
    }
  )
  .command(
    "download",
    "",
    (yargs) => {},
    async (argv) => {
      await download();
    }
  )
  .command(
    "upload",
    "",
    (yargs) => {},
    async (argv) => {
      await upload();
    }
  )
  .command(
    "score",
    "",
    (yargs) => {},
    async (argv) => {
      await score();
    }
  )
  .command(
    "run",
    "",
    (yargs) => {},
    async (argv) => {
      await run(argv);
    }
  )
  .demandCommand()
  .help()
  .parse();
