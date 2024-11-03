# Sourcery Queue Design

## Overview

The queue is a simple Redis queue that is used to process files. It is designed to be a simple and scalable solution for processing files.

## Queue Structure

We use Redis (KeyDB) and BullMQ for the queue. The queue functions are available in the `@sourcery/queue` package.

There is a `SourceryPub` and a `SourcerySub` object. 
- The `SourceryPub` is used to add jobs to the queue. It is located at `@sourcery/queue/src/pub.ts`.
- The `SourcerySub` is used to process jobs from the queue. It is located at `@sourcery/queue/src/sub.ts`.

## File Processing Pipeline

Each processor acts as an independent worker that can be scaled independently. It listens for new files matching its stage, and then processes it and passes it on to the next stage.

### Pipeline Stage Process

Each pipeline follows this process:

1. Listen for new files matching its stage
2. Mark the file as being processed
3. Read the file
4. Process the file
5. Mark the file as processed
6. Add the file to the next stage

#### Listening for New Files

Each pipeline stage will listen for new files based on the `stage` property of the file. The stage is appended to the `queue` key to form a sub-queue. For example, if the pipeline stage is `extract_text`, it will listen for new files with the `file:extract_text` key.

#### Marking a File as Being Processed

The file record is updated to include a `processing` property with the current timestamp, and the `stage` property is updated to the current stage in the pipeline. A log is added.

#### Reading a File

The file record contains `filename`, which is always the latest version of the file. The file is read from the filesystem for processing.

#### Processing a File

The file is processed by the current stage.

#### Marking a File as Processed

The file record is updated to include a `processed` property with the current timestamp. A log is added.

#### Adding a File to the Next Stage

The file record is updated to include a `stage` property with the next stage in the pipeline. Depending on the stage logic, a decision may be made to send it to a specific stage. A new message is added to the queue, using the new stage as the key. The completion time and running time is recorded.