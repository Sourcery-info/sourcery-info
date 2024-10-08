# Sourcery.info

## Your private, secure investigative journalism AI

## Introduction

Sourcery.info lets you interview a cache of documents using natural language, all within a secure environment. It helps you find answers to questions you didn't know to ask.

Large language models combined with source documents has created a potential treasure trove for investigative journalists, OSInt researchers, or anyone who needs to glean insights from a document cache. However, the process typically involves uploading the documents to third parties, which is inherently insecure and in many cases dangerous. 

With Sourcery.info, you run your own large language model, process the documents locally, and query them locally. You can run it on your own network, on your PC, on a virtual PC, or even in an [air gapped environment](https://en.wikipedia.org/wiki/Air_gap_\(networking\)). 

Sourcery.info uses an AI methodology called [retrieval-augmented generation](https://research.ibm.com/blog/retrieval-augmented-generation-RAG) (RAG) to combine both your own unique knowledge base (the document cache) with the power of a large language model.

Apart from the ability to search through documents using natural language, the RAG-based AI method has the potential of surfacing interesting, useful information to researchers who don't know exactly what they're looking for. This can be particularly useful for large caches of document leaks, for instance. 

Sourcery.info takes the complexity out of RAG by optimising the generation of embeddings (the LLM codes that turn your documents into vectors), deciding on chunk size, using strategies like small-to-big, and selecting the appropriate language model for your use case. 

The user interface is simple without losing the power to inspect the documents manually. It includes features to ingest documents, create the embeddings, query the documents using natural language, and view the original sources along with the results. 

It will: 

- Ingest a cache of documents;  
- OCR and extract the data as necessary;  
- Generate embeddings locally;  
- Store the embeddings in a local vector database;  
- Use local LLMs in a RAG model to query the documents using natural language;  
- Present results with the associated sources for easy reference to the sources.

It won't:

- Send any information out of the system;  
- Load any external dependencies;  
- Censor or refuse to answer questions that could be sensitive;  
- Store any usage information, unless required for auditing purposes (with a specific "opt-in").

## Current State

Sourcery.info is currently in its early development phase. This includes:

* Identifying potential technologies to utilise in the application;  
* Designing application processes and data flows;  
* Investigating and designing tests to determine the best combination of technologies, specifically selecting the correct LLMs for the use case;  
* Looking for funding;  
* Recruiting journalists, investigative journalists and OSInt investigators as early adopters;  
* Setting up processes for continuous product feedback from our early adopters;  
* Finding out real-world use cases from our early adopters;  
* ~~Setting up a website, Github account, domain and email;~~  
* ~~Designing a logo;~~  
* Creating a product roadmap.

## Application Flow

![][image1]

![][image2]

# Roadmap

## Phase One \- MVP

The first phase of development is to develop an MVP within 6 months. This will be more of a proof-of-concept and testbed, with the ability to test different LLMs on different document caches, getting the product into journalists' hands for real feedback.

It will not be a desktop application, but will run as a Docker instance. Depending on the journalists' hardware and capabilities, we may offer it as a hosted solution at this stage. Importantly, this means that we will not be able to handle sensitive documents in the first phase as we cannot guarantee privacy.   
We will focus on a limited number of document type inputs, and will not be doing advanced pre-processing like OCR and virus scanning in this phase.

We will focus on a limited number of LLMs, most likely settling on a single LLM for the Beta release that is good-enough. 

For a full list of planned features, see the diagram below.

Some infrastructure and administration will be required in parallel with software development. 

- Designing, creating and monitoring a feedback loop with journalists so that we can evaluate the real-world performance of different models and configurations;  
- A selection of computer hardware to test the speed of embedding and querying with different models in order to create specifications for computer hardware;  
- Github, domain, website and email setup;  
- Looking for additional funding;  
- Reporting for funders.

![][image3]

## Phase Two \- Desktop App

The second phase will build on what we learned in Phase One. We should have a better idea of what models we want to focus on, what hardware we have to work with, and how journalists are using the product. 

We will include this knowledge in designing and building our desktop app. There will be a redesign based on observerving user behaviour in the MVP. We will also start developing training material and documentation at this point based on feedback from the MVP.

The desktop app will have two primary goals:

* Privacy;  
* Auto-configuration.

### Privacy

In terms of privacy and security, the desktop app must be self-contained, have no connections to the internet, and not leak any data. 

This will be complimented by design and best-practice for building an air-gapped system.

It would be great to get the application audited by a security company once it is developed. 

### Autoconfiguration

The autoconfiguration will select the best LLMs based on:

* The input document types;  
* The volume of input data;  
* And the hardware configuration. 

The privacy and autoconfiguration will need to work together as we will not be able to ship the application with every available model. There will need to be an initial (internet-connected) setup mode, followed by the operational (air-gapped) secure mode. 

There will be use-cases where security and privacy aren't a factor, in which case we could potentially offer additional features using internet access, eg. importing and exporting of data, logs, and embeddings; and importing of pre-trained databases, new models, etc.

## Phase Three \- Multi-Modal, Fine-Tuning and Custom Models

In Phase Three, we can start looking at developing custom models, eg. for news. The model could have up-to-date knowledge of news from selected news agencies, as well as knowledge of company registrars, law, government documents etc. 

We can also look at multi-modal models, such as image, voice and video source documents. 

We will experiment with fine-tuning models (as opposed to or as a compliment to RAG). 