#!/usr/bin/env bash

# Run this file to test if petibrugnon works as a freshly insttalled CLI.

docker build -f cli.Dockerfile -t petibrugnon:test-cli ..
MSYS_NO_PATHCONV=1 docker run -it --rm -v $(pwd)/..://petibrugnon petibrugnon:test-cli petibrugnon --help
