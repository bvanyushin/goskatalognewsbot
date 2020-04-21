FROM node:current-slim

WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN yarn

ENV TZ Europe/Moscow
ENV DB_PATH ./db/botdb.db

CMD [ "npm", "start" ]

COPY . .