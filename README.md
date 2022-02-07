# petibrugnon

A command-line interface to interact with the Hash Code scoring app (https://codingcompetitions.withgoogle.com/hashcode).

## Install

Requires Node.js 16.7.0 or higher.

```shell
npm install --global https://github.com/hgwood/petibrugnon
```

Then try:

```shell
petibrugnon --help
# or, for short
ptbr --help
```

## Usage

### Commands

- `login`: log in to the scoring app.
- `logout`: log out of the scoring app.
- `download`: download the current challenge statement and input files in `.petibrugnon`.
- `upload`: upload output files to the scoring app. All files located in
  `.petibrugnon/outputs` will be uploaded. Output files must have the same name
  as their corresponding input file.
- `score`: display the total score, rank, and individual tests scores.
