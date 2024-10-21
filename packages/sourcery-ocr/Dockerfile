FROM nvidia/cuda:12.5.0-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y \
    wget \
    curl \
    git \
    imagemagick \
    pdftk \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

# Install tsx globally
RUN npm install -g tsx

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
COPY packages ./packages
COPY jest.config.js .
COPY tsconfig.json .

RUN pip3 install --no-cache-dir -r packages/sourcery-ocr/requirements.txt

RUN yarn install

CMD ["npm", "run", "sourcery-ocr"]
