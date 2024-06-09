FROM node:lts
RUN apt update && apt install build-essential -y
WORKDIR /app
COPY package.json .
COPY packages/common/package.json packages/common/package.json
COPY packages/sourcery-chat-api/package.json packages/sourcery-chat-api/package.json
COPY packages/sourcery-db/package.json packages/sourcery-db/package.json
COPY packages/sourcery-frontend/package.json packages/sourcery-frontend/package.json
COPY packages/sourcery-llm-api/package.json packages/sourcery-llm-api/package.json
COPY packages/sourcery-pipeline/package.json packages/sourcery-pipeline/package.json
COPY packages/sourcery-ws/package.json packages/sourcery-ws/package.json
RUN yarn install
COPY . .
CMD npm run start
