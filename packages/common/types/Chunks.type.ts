// Define type for chunk
export type TChunk = {
    _id?: string;
    title: string;
    level: number;
    content: string;
    parent: string | null;
    children: TChunk[] | null;
    vector?: number[];
    context?: string;
}