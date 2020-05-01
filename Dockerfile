FROM node:current-slim

WORKDIR /usr/src/app
COPY package.json .
COPY yarn.lock .
RUN yarn

ENV TZ Europe/Moscow
ENV DB_PATH ./db/botdb.db
ENV DAYS_TO_CHECK 4

CMD [ "npm", "start" ]

COPY . .