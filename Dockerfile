FROM nvidia/cuda:12.5.0-runtime-ubuntu22.04
FROM node:lts
RUN apt update && apt install build-essential -y
RUN apt install build-essential libpoppler-cpp-dev pkg-config python3-dev poppler-utils python3-pip python3 python3-venv -y
WORKDIR /app
COPY package.json .
COPY packages ./packages
COPY jest.config.js .
COPY tsconfig.json .
RUN yarn install
RUN python3 -m venv sourcery-ocr-env
RUN sourcery-ocr-env/bin/pip3 install --no-cache-dir -r packages/sourcery-ocr/requirements.txt
CMD npm run start
