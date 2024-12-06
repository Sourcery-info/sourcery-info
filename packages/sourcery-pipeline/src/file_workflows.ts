export const fileTypeWorkflows: Record<string, { stages: string[] }> = {
    "pdf": {
        "stages": [
            "pdf_to_image",
            // "docling",
            "vectorising",
            "saving",
            "done"
        ]
    },
    "text": {
        "stages": [
            "virus_scanning",
            "vectorising",
            "saving",
            "done"
        ]
    },
    "default": {
        "stages": [
            "virus_scanning",
            "vectorising",
            "saving",
            "done"
        ]
    }
}

export const stages = [
    "unprocessed",
    "pdf_to_image",
    "validating",
    "docling",
    "text_extraction",
    "chunking",
    "vectorising",
    "saving",
    "done",
    "error"
]
