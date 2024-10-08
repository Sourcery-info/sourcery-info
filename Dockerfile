FROM node:lts
RUN apt update && apt install build-essential -y
WORKDIR /app
COPY package.json .
COPY packages ./packages
COPY jest.config.js .
COPY tsconfig.json .
RUN yarn install
CMD npm run start
