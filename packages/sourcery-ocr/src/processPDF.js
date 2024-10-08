import { execCommand } from './execCommand.js';
import fs from 'fs';
import path from 'path';

const extractNumPages = async (filePath) => {
    const command = `pdftk "${filePath}" dump_data | grep NumberOfPages | awk '{print $2}'`;
    const output = await execCommand(command);
    return parseInt(output, 10);
};

const splitPdf = async (filePath, outputDir) => {
    const command = `pdftk "${filePath}" burst output "${outputDir}/page_%02d.pdf"`;
    await execCommand(command);
};

const convertPdfToImage = async (pdfPath, imagePath) => {
    const command = `convert -density 300 "${pdfPath}" -quality 100 "${imagePath}"`;
    await execCommand(command);
};

const ocrImageToText = async (imagePath) => {
    return execCommand(`easyocr -l en --detail 0 --image "${imagePath}"`);
};

export const processPdf = async (filePath, onUpdateProgress, outputDir = "/tmp") => {
    const numPages = await extractNumPages(filePath);
    // const outputDir = path.join(__dirname, '../temp/');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const textResults = [];

    for (let i = 1; i <= numPages; i++) {
        const pagePdfPath = path.join(outputDir, `page_${String(i).padStart(2, '0')}.pdf`);
        const pageImagePath = pagePdfPath.replace('.pdf', '.png');

        await splitPdf(filePath, outputDir);
        await convertPdfToImage(pagePdfPath, pageImagePath);
        const ocrText = await ocrImageToText(pageImagePath);
        textResults.push(ocrText);

        onUpdateProgress({ page: i, total: numPages });
    }

    return textResults.join('\n');
};