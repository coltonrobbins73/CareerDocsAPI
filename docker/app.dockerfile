FROM node:22 AS build

WORKDIR /app

COPY package*.json /app
COPY tsconfig*.json /app
COPY ./src ./app/src

RUN npm ci && npm run build

FROM node:22 AS final

ENV NODE_ENV=production

COPY --from=build ./dist /app/dist
COPY package*.json /app
EXPOSE 3000
RUN npm ci --production

CMD [ "npm", "run", "start:prod" ]
