#!/bin/bash

# Array of models to pull
models=(
    "all-minilm:latest"
    "nomic-embed-text"
    "llama3.2:3b"
    "deepseek-r1:8b"
    # "deepseek-r1:7b"
    # "deepseek-r1:14b"
    # "llama3.2-vision:7b"
    # "artifish/llama3.2-uncensored:3b"
)

# Pull each model
for model in "${models[@]}"; do
    echo "Pulling model: $model"
    ollama pull "$model"
done 