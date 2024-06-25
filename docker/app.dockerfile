FROM node:22

WORKDIR /app

COPY package*.json /app
COPY tsconfig*.json /app
COPY ./src /app/src

RUN npm ci && npm run build



EXPOSE 3000

CMD ["npm", "run", "start:prod"]
