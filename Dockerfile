FROM node:lts
RUN apt update && apt install build-essential -y
RUN apt install build-essential libpoppler-cpp-dev pkg-config python3-dev poppler-utils -y
WORKDIR /app
COPY package.json .
COPY packages ./packages
COPY jest.config.js .
COPY tsconfig.json .

RUN yarn install
CMD npm run start
