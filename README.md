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
REDIS_PORT=6379             # Redis/KeyDB port
OLLAMA_PORT=11435           # Ollama port
SOURCERY_PORT=9000          # Sourcery main port
SOURCERY_WEBSOCKET_PORT=9001 # Sourcery WebSocket port
MONGODB_PORT=27017          # MongoDB port
MAILHOG_PORT=8026           # MailHog web UI port
```

#### Selective Service Configuration

You can control which services are started using environment variables or Docker Compose profiles:

```
# Service enablement controls (set to anything other than "default" to disable)
ENABLE_QDRANT=default       # Enable/disable Qdrant vector database
ENABLE_KEYDB=default        # Enable/disable KeyDB/Redis cache
ENABLE_OLLAMA=default       # Enable/disable Ollama LLM service
ENABLE_RERANKING=default    # Enable/disable document reranking service
ENABLE_SOURCERY=default     # Enable/disable main Sourcery application
ENABLE_MONGODB=default      # Enable/disable MongoDB database
ENABLE_NER=default          # Enable/disable Named Entity Recognition service
ENABLE_MAILHOG=default      # Enable/disable MailHog email testing service
```

### Starting Sourcery

Start all services using Docker Compose:

```bash
docker compose up -d
```

To start only specific services using environment variables:

```bash
# Method 1: Set environment variables to disable specific services
ENABLE_MAILHOG=disabled ENABLE_NER=disabled docker compose up -d

# Method 2: Use profiles to start functional groups
docker compose --profile database up -d  # Start all database services
docker compose --profile ai up -d        # Start all AI-related services
```

Available profiles:
- `database`: Starts database services (qdrant, keydb, mongodb)
- `ai`: Starts AI services (ollama, reranking, ner)
- `app`: Starts the main Sourcery application
- `utility`: Starts utility services like MailHog
- `vector`: Starts vector database (qdrant)
- `cache`: Starts caching service (keydb)
- `llm`: Starts language model service (ollama)

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