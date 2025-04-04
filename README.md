[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

# Sourcery.info

Sourcery.info empowers journalists to unlock insights and tell compelling stories through document analysis with complete privacy. It allows you to "interview" your source documents using natural language, uncovering connections and finding answers to questions you didn't know to ask - all without ever sending your data outside your system.

## Key Features

- **Absolute Privacy**: Run everything locally - from OCR to embeddings to queries. No data ever leaves your system. Works in air-gapped environments.
- **Intelligent Discovery**: Surface unexpected connections and insights using natural language queries.
- **Optimized RAG**: Powered by Retrieval-Augmented Generation (RAG) with local processing, automatically optimizing embeddings, chunk sizes, and model selection.

Sourcery.info is perfect for journalists (especially those in investigative roles), OSInt researchers, and anyone working with sensitive documents.

## Installation and Setup

### Prerequisites

- Docker and Docker Compose
- NVIDIA GPU (recommended) with appropriate drivers installed

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Sourcery.info.git
   cd Sourcery.info
   ```

2. Configure environment variables:
   - Copy the example environment file:
     ```bash
     cp dotenv-example .env
     ```
   - Edit the `.env` file to customize your configuration

### Configuration Options

#### GPU Configuration
```
NVIDIA_DRIVER=nvidia        # NVIDIA driver name
NVIDIA_CAPABILITIES=gpu     # GPU capabilities
OLLAMA_GPU_COUNT=1          # Number of GPUs for Ollama
RERANKING_GPU_COUNT=1       # Number of GPUs for reranking
SOURCERY_GPU_COUNT=1        # Number of GPUs for Sourcery
```

#### Ollama Configuration
```
OLLAMA_NUM_PARALLEL=1       # Number of parallel requests Ollama can handle
OLLAMA_KEEP_ALIVE=5         # Keep-alive timeout in seconds
```

#### Port Configuration
```
QDRANT_PORT_1=6333          # Qdrant main port
QDRANT_PORT_2=6334          # Qdrant secondary port
REDIS_PORT=6379             # Redis port
OLLAMA_PORT=11435           # Ollama port
SOURCERY_PORT=9000          # Sourcery main port
SOURCERY_WEBSOCKET_PORT=9001 # Sourcery WebSocket port
MONGODB_PORT=27017          # MongoDB port
MAILHOG_PORT=8026           # MailHog web UI port
```

### Starting Sourcery

Start all services using Docker Compose:

```bash
docker compose up -d
```

To build the containers before starting (required for the first run or after updates):

```bash
docker compose build
docker compose up -d
```

To view logs:

```bash
docker compose logs -f
```

To view logs for a specific service:

```bash
docker compose logs -f sourcery
```

If you want to start specific services only:

```bash
docker compose up -d sourcery-qdrant sourcery-redis sourcery-ollama
```

### Stopping Sourcery

To stop all services:

```bash
docker compose down
```

### Accessing Services

- Sourcery Web Interface: http://localhost:9000
- MailHog Interface: http://localhost:8026

## Troubleshooting

If you encounter issues:

1. Check service logs:
   ```bash
   docker compose logs -f [service-name]
   ```

2. Verify GPU availability:
   ```bash
   docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
   ```

3. Restart services:
   ```bash
   docker compose restart [service-name]
   ```

4. For complete reset:
   ```bash
   docker compose down
   docker compose up -d
   ```

## License

Sourcery is available under dual licensing:

### Open Source License
Sourcery is released under the GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later). This means:

- You can freely download, use, and modify the software
- If you modify Sourcery and share it with others or run it as a network service, you must:
  - Make your modifications available under the AGPL-3.0-or-later
  - Share the source code with users who interact with the service
  - Maintain all copyright and license notices

### Commercial License
For organizations that cannot comply with AGPL-3.0-or-later terms, commercial licensing options are available:

- **Enterprise License**: For on-premises deployment
- **SaaS License**: For cloud/hosted deployments
- **Custom Solutions**: For specialized implementations

Commercial licenses include:
- Ability to use and modify Sourcery without AGPL obligations
- Priority support
- Additional enterprise features
- Custom development options

For commercial licensing inquiries, please contact: jason@10layer.com

---
Copyright (C) 2024 Jason Norwood-Young. All rights reserved.