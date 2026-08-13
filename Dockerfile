FROM node:lts-alpine AS base

WORKDIR /

FROM base AS deps

COPY package.json package-lock.json ./

RUN npm install

FROM node:lts-alpine AS runtime

COPY --from=deps package.json package-lock.json ./
COPY --from=deps /node_modules ./

COPY --from=base /commands ./
COPY --from=base index.js ./

CMD ["npm", "start"]