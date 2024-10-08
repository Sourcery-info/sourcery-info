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

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

COPY . .

CMD ["bash"]