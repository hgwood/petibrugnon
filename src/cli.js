import yargs from "yargs";
import { login } from "./login.js";
import { logout } from "./logout.js";
import { download } from "./download.js";
import { upload } from "./upload.js";
import { score } from "./score.js";

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
  .demandCommand()
  .help()
  .parse();
