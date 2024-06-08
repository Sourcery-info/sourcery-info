import { Validate } from "../src/pipeline/validate";
import { File } from "@sourcery/common/src/file";
import { SourceryFile, FileStage, FileStatus, FileTypes } from "@sourcery/common/types/SourceryFile.type";

const pdf_doc = new File("test", null, "./docs/test.pdf")
const txt_doc = new File("test", null, "./docs/abramov.txt")

describe("Test validating stage", () => {
    test('test validating a valid PDF file', async () => {
        const validate = new Validate(pdf_doc);
        const response = await validate.process();
        expect(response.stage_logs?.length).toBeGreaterThan(0);
    });
    // test('test validating an invalid PDF file', async () => {
    //     const validate = new Validate(invalid_doc);
    //     const response = await validate.process();
    //     expect(response).toBe(false);
    // });
    test("test validating a valid text file", async () => {
        const validate = new Validate(txt_doc);
        const response = await validate.process();
        expect(response.stage_logs?.length).toBeGreaterThan(0);
    })
    // test("test validating an invalid text file", async () => {
    //     const invalid_txt = {
    //         ...test_doc,
    //         filename: "./docs/not-utf8.txt",
    //         filetype: FileTypes.TXT
    //     }
    //     const validate = new Validate(invalid_txt);
    //     const response = await validate.process();
    //     expect(response).toBe(false);
    // })
});