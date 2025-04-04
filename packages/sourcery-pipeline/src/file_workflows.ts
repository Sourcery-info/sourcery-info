import { FileStage } from "@sourcery/common/types/SourceryFile.type";

export const fileTypeWorkflows: Record<string, { stages: string[] }> = {
    "pdf": {
        "stages": [
            FileStage.MARKER_PDF,
            FileStage.CHUNKING,
            FileStage.CONTEXTUAL_CHUNKING,
            FileStage.ENTITIES,
            FileStage.VECTORISING_ENTITIES,
            FileStage.VECTORISING,
            FileStage.SAVING,
            FileStage.DONE
        ]
    },
    "docx": {
        "stages": [
            FileStage.MAMMOTH,
            FileStage.CHUNKING,
            FileStage.CONTEXTUAL_CHUNKING,
            FileStage.ENTITIES,
            FileStage.VECTORISING_ENTITIES,
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
    "mammoth",
    "easyocr",
    "marker_pdf",
    "validating",
    "docling",
    "llama-mm",
    "entities",
    "vectorising_entities",
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

export const stage_names = {
    [FileStage.UNPROCESSED]: "Starting",
    [FileStage.MAMMOTH]: "Extracting Docx",
    [FileStage.MARKER_PDF]: "OCR",
    [FileStage.CHUNKING]: "Chunking",
    [FileStage.CONTEXTUAL_CHUNKING]: "Adding Context",
    [FileStage.ENTITIES]: "Extracting Entities",
    [FileStage.VECTORISING_ENTITIES]: "Vectorising Entities",
    [FileStage.VECTORISING]: "Vectorising",
    [FileStage.SAVING]: "Saving",
    [FileStage.DONE]: "Done",
    [FileStage.ERROR]: "Error"
}