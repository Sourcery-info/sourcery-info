export const fileTypeWorkflows: Record<string, { stages: string[] }> = {
    "pdf": {
        "stages": [
            // "virus_scanning",
            "ocr",
            // "text_extraction",
            "vectorisation"
        ]
    },
    "text": {
        "stages": [
            "virus_scanning",
            "vectorisation"
        ]
    },
    "default": {
        "stages": [
            "virus_scanning",
            "vectorisation"
        ]
    }
}

export const stages = [
    "unprocessed",
    "validating",
    "ocr",
    "text_extraction",
    "chunking",
    "vectorizing",
    "saving",
    "done",
    "error"
]
