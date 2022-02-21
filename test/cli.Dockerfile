FROM node:lts

COPY ./ /petibrugnon
RUN npm install --global /petibrugnon
