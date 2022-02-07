# petibrugnon

A command-line interface to assist Google Hash Code participants. It can interact with the [Hash Code scoring app](https://codingcompetitions.withgoogle.com/hashcode).

## Install

Requires Node.js 16.7.0 or higher.

```shell
npm install --global https://github.com/hgwood/petibrugnon
```

Then try:

```shell
petibrugnon --help
# or, for short
tibru --help
```

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
  `.petibrugnon` directory is always ignored.
- `score`: display the total score, rank, and individual test scores.
- `run -- command...`: run the given command once for each input file. The
  spawned process is provided the following environment variables:
  `PETIBRUGNON_INPUT_FILE_PATH`, `PETIBRUGNON_OUTPUT_FILE_PATH`,
  `PETIBRUGNON_TEST_ID`, `PETIBRUGNON_TEST_NAME`.
- `login`: log in to the scoring app. This automatically done by commands that require it.
- `logout`: log out of the scoring app. Use it if you encounter errors.
