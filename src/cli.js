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
    (yargs) => {
      yargs.option("only", {
        description: "Run only tests with the given IDs",
        type: "array",
        default: [],
      });
    },
    async (argv) => {
      await run(argv);
    }
  )
  .demandCommand()
  .option("google-oauth-client-id", {
    alias: "cid",
    type: "string",
    description:
      "The ID of Google OAuth 2.0 client to use to authorize access to the Google Code Jam API.",
    demandOption: true,
  })
  .option("config", {
    default: ".petibrugnonrc.json",
    config: true,
  })
  .help()
  .parse();
