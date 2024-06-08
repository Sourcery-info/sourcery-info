import {
    Document,
    BaseReader,
    Metadata,
    PDFReader,
    PapaCSVReader,
    DocxReader,
    TextFileReader,
    SimpleDirectoryReader
} from "llamaindex"

class ZipReader implements BaseReader {
    loadData(...args: any[]): Promise<Document<Metadata>[]> {
        throw new Error("Implement me");
    }
}

export async function readDir(dir: string) {
    const reader = new SimpleDirectoryReader();
    const documents = await reader.loadData({
        directoryPath: dir,
        defaultReader: new TextFileReader(),
        fileExtToReader: {
            pdf: new PDFReader(),
            csv: new PapaCSVReader(),
            docx: new DocxReader(),
            zip: new ZipReader(),
        },
    });
    console.log(`Found ${documents.length} documents`);
    return documents;
}