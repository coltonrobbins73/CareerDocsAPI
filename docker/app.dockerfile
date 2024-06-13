FROM node:22-alpine3.18 AS build

WORKDIR ./

COPY package*.json ./
COPY tsconfig*.json ./
COPY ./src ./src

RUN npm ci && npm run build

FROM node:22-alpine3.18 AS final

ENV NODE_ENV=production

COPY --from=build ./dist ./dist
COPY package*.json ./

RUN npm ci --production

CMD [ "npm", "run", "start:prod" ]