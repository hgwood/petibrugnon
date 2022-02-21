# Buidling this dockerfile successfully proves the CLI works when installed
# globally on a fresh environment.

FROM node:16

WORKDIR /petibrugnon

COPY package.json package-lock.json .npmignore ./
COPY src/ src/
RUN npm pack .

WORKDIR /app

RUN npm install --global /petibrugnon/petibrugnon*.tgz

RUN petibrugnon --help
