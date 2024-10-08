import { processPdf } from './processPDF.js';
import fs from 'fs';
import path from 'path';

export async function streamConvertPdfToText(req, reply) {
    const file = req.raw.files.pdf;

    if (!file) {
        return reply.status(400).send({ error: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '../uploads/', file.name);
    fs.writeFileSync(filePath, file.data);

    let totalProgress = 0;

    const onUpdateProgress = ({ page, total }) => {
        totalProgress = `${((page / total) * 100).toFixed(2)}%`;
        req.raw.res.write(JSON.stringify({ progress: totalProgress }) + '\n');
    };

    try {
        const textResult = await processPdf(filePath, onUpdateProgress);
        req.raw.res.end(JSON.stringify({ text: textResult }));
    } catch (error) {
        req.raw.res.end(JSON.stringify({ error: error.message }));
    } finally {
        fs.unlinkSync(filePath);
    }
};

export function convertPdfToText(filePath) {
    return processPdf(filePath);
}