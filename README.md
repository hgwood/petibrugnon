# petibrugnon

A command-line interface to assist Google Hash Code participants. It can interact with the [Hash Code scoring app](https://codingcompetitions.withgoogle.com/hashcode).

## Install

Requires Node.js 16.7.0 or higher.

```shell
npm install --global petibrugnon
```

Then try:

```shell
petibrugnon --help
# or, for short
tibru --help
```

### Creating and configuring a Google OAuth 2.0 Client

For petibrugnon to access your data on the Hash Code scoring app, you need to
authorize it to do so. This requires a Google OAuth 2.0 Client. To create one,
go to `console.cloud.google.com`, create a project, then go to APIs & Services >
Credentials > Create Credentials > OAuth Client ID. Select the mobile app type,
and then copy the client ID. Create a `.petibrugnonrc.json` file in your project
directory with the following contents:

```json
{
  "google-oauth-client-id": "<paste the client ID here>"
}
```

Finally, switch back to the Google Cloud Console and go to APIs & Services >
OAuth Consent Screen. In the Test users section, add the users you want to allow
logging in using your client (probably yourself and your team mates).

You're ready to go!

## Usage

### Commands

- `download`: download the current challenge statement in
  `.petibrugnon/statement.html` and input files in `.petibrugnon/inputs`.
- `upload`: upload output files to the scoring app. All files located in
  `.petibrugnon/outputs` that have the same name as an input file will be
  uploaded as a solution for the corresponding test. Sources are also uploaded.
  All files and directories from the working directory will be zipped and
  uploaded, except those which match patterns found in `.gitignore`. If Git is
  not used, a `.petibrugnonignore` file is also accepted. Also, the
  `.petibrugnon` directory and `.petibrugnonrc.json` are always ignored. After
  upload, wait for the scores to settle and display them, along with the
  difference between before and after the upload.
- `score`: display the total score, rank, and individual test scores.
- `parse`: use jolicitron to parse all inputs files.
  - `--schema`: speficy the schema file to use. Default is `jolicitron.json`.
- `run -- command...`: run the given command once for each input file. The
  spawned process is provided the following environment variables:
  `PETIBRUGNON_INPUT_FILE_PATH`, `PETIBRUGNON_INPUT_JSON_FILE_PATH` (output of
  `parse`), `PETIBRUGNON_OUTPUT_FILE_PATH`, `PETIBRUGNON_TEST_ID`,
  `PETIBRUGNON_TEST_NAME`.
  - `--only`: only run the given tests (space-separated list of numbers starting
    from zero).
- `run`: runs the last command ran with `run -- command...`.
- `login`: log in to the scoring app. This is automatically done by commands that require it.
- `logout`: log out of the scoring app. Use it if you encounter errors.

### Global options

See `--help`.
