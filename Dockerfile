ARG NODE_VERSION=20.11

FROM node:${NODE_VERSION}-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json", "./"]
RUN npm install --production
COPY . .
CMD ["node", "index.js"]