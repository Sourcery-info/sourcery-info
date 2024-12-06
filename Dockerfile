FROM nvidia/cuda:12.5.1-runtime-ubuntu24.04

# Install system dependencies
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

# Install build dependencies
RUN apt update && apt install -y \
    build-essential \
    libpoppler-cpp-dev \
    pkg-config \
    python3-dev \
    poppler-utils \
    python3-pip \
    python3 \
    python3-venv

WORKDIR /app
COPY package.json .
COPY packages ./packages
COPY jest.config.js .
COPY tsconfig.json .
RUN yarn install

# Set up Python environment
RUN python3 -m venv sourcery-ocr-env
RUN sourcery-ocr-env/bin/pip3 install --no-cache-dir -r packages/sourcery-ocr/requirements.txt

CMD npm run start
