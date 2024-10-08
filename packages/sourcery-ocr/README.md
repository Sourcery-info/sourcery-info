# Sourcery OCR

The Sourcery OCR offers an API that accepts PDFs and other document formats, converts them into images, uses an AI model to extract text from the images, and returns the text as a string.

It runs independently from the rest of the Sourcery architecture as it is Python-based. It is designed to run in a Docker container but can run outside of it too provided the dependencies are installed.

It uses Imagemagick for the image conversions and EasyOCR for the text extraction.

On systems with a GPU, it uses Cuda for acceleration.

## Running on Docker

```
docker build -t sourcery-ocr .
docker run --gpus all --privileged -it sourcery-ocr
```