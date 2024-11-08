export const fileTypeWorkflows: Record<string, { stages: string[] }> = {
    "pdf": {
        "stages": [
            // "virus_scanning",
            "ocr",
            // "text_extraction",
            "vectorising"
        ]
    },
    "text": {
        "stages": [
            "virus_scanning",
            "vectorising"
        ]
    },
    "default": {
        "stages": [
            "virus_scanning",
            "vectorising"
        ]
    }
}

export const stages = [
    "unprocessed",
    "validating",
    "ocr",
    "text_extraction",
    "chunking",
    "vectorising",
    "saving",
    "done",
    "error"
]
