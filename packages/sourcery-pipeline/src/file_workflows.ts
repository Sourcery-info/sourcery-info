import { FileStage } from "@sourcery/common/types/SourceryFile.type";

export const fileTypeWorkflows: Record<string, { stages: string[] }> = {
    "pdf": {
        "stages": [
            // "pdf_to_image",
            // "easyocr",
            // "llama-mm",
            FileStage.MARKER_PDF,
            // "entities",
            FileStage.CHUNKING,
            // "filename",
            FileStage.CONTEXTUAL_CHUNKING,
            FileStage.VECTORISING,
            FileStage.SAVING,
            FileStage.DONE
        ]
    },
    "text": {
        "stages": [
            FileStage.VIRUS_SCANNING,
            FileStage.VECTORISING,
            FileStage.SAVING,
            FileStage.DONE
        ]
    },
    "default": {
        "stages": [
            FileStage.VIRUS_SCANNING,
            FileStage.VECTORISING,
            FileStage.SAVING,
            FileStage.DONE
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
    "contextual-chunk",
    "vectorising",
    "saving",
    "done",
    "error"
]
