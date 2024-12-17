export const fileTypeWorkflows: Record<string, { stages: string[] }> = {
    "pdf": {
        "stages": [
            // "pdf_to_image",
            // "easyocr",
            // "llama-mm",
            "marker_pdf",
            // "entities",
            "chunking",
            // "filename",
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
    "easyocr",
    "marker_pdf",
    "validating",
    "docling",
    "llama-mm",
    "entities",
    "montage",
    "filename",
    "text_extraction",
    "chunking",
    "vectorising",
    "saving",
    "done",
    "error"
]
