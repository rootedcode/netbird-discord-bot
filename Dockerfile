FROM node:lts-alpine AS base

WORKDIR /

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm install

FROM node:lts-alpine AS runtime

COPY --from=deps /commands ./commands/
COPY --from=deps index.js ./index.js

CMD ["npm", "start"]