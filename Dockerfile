FROM node:lts
RUN apt update && apt install build-essential -y
WORKDIR /app
COPY package.json .
COPY packages ./packages
COPY jest.config.js .
COPY tsconfig.json .
RUN apt install build-essential libpoppler-cpp-dev pkg-config python3-dev python3-pip python3 -y

RUN pip3 install pdftotext

RUN yarn install
CMD npm run start
