// Define type for chunk
export type TChunk = {
    id: string;
    title: string;
    level: number;
    content: string;
    parent: string | null;
    children: TChunk[] | null;
    vector?: number[];
}