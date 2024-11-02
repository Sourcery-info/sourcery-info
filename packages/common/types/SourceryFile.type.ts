export enum FileStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted',
    ARCHIVED = 'archived',
}

export enum FileStage {
    UNPROCESSED = 'unprocessed',
    VALIDATING = 'validating',
    VIRUS_SCANNING = 'virus_scanning',
    OCRING = 'OCRing',
    ENTITY_EXTRACTION = 'entity_extraction',
    CHUNKING = 'chunking',
    INDEXING = 'indexing',
    PROCESSED = 'processed',
}

export enum FileTypes {
    PDF = 'pdf',
    DOCX = 'docx',
    XLSX = 'xlsx',
    CSV = 'csv',
    TXT = 'txt',
    JSON = 'json',
    XML = 'xml',
    HTML = 'html',
    JPG = 'jpg',
    JPEG = 'jpeg',
    PNG = 'png',
    GIF = 'gif',
    MP4 = 'mp4',
    MOV = 'mov',
    AVI = 'avi',
    MP3 = 'mp3',
    WAV = 'wav',
    ZIP = 'zip',
    TAR = 'tar',
    GZ = 'gz',
    BZ2 = 'bz2',
    RAR = 'rar',
    SEVENZ = '7z',
}

export enum StageState {
    STARTED = 'started',
    FINISHED = 'finished',
    FAILED = 'failed',
}

export enum StageResult {
    SUCCESS = 'success',
    FAILURE = 'failure',
    WARNING = 'warning',
}

export type StageLog = {
    stage: FileStage | string;
    input: StageLog;
    state: StageState;
    result: StageResult | undefined | null;
    message: string;
    start_time: Date;
    end_time: Date | null;
    duration: number;
    filename: string;
}

export type SourceryFile = {
    _id: string;
    original_name?: string;
    filename: string;
    metadata?: string;
    filetype: FileTypes;
    project: string;
    // data: string;
    status: FileStatus;
    stage: FileStage | string;
    stage_logs?: StageLog[];
    created_at: Date;
    updated_at: Date | null;
}