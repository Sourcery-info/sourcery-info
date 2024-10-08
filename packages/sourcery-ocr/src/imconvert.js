import { spawnSync } from "child_process";
import path from "path";

export async function imconvert(pdf, output_dir = "./", dpi = 300) {
    const page_count = await pagecount(pdf);
    console.log(page_count);
    return;
    const png_name = path.join(output_dir, path.basename(pdf, ".pdf") + "-%02d.png");
    console.log(`convert -density ${dpi} -trim ${pdf} -quality 100 -sharpen 0.5, -flatten ${png_name}`);
    const child = spawn(`convert -density ${dpi} -trim ${pdf} -quality 100 -sharpen 0.5 -flatten ${png_name}`);
    return new Promise((resolve, reject) => {
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (data) => {
            stdout += data;
        });
        child.stderr.on("data", (data) => {
            stderr += data;
        });
        child.on("close", (code) => {
            if (code === 0) {
                resolve(JSON.parse(stdout));
            } else {
                reject(stderr);
            }
        });
    });
};

async function pagecount(pdf) {
    console.log(`pdftk ${pdf} dump_data`)
    const result = spawnSync(`pdftk ${pdf} dump_data`);
    if (result.error) {
        console.error(result.error);
        throw result.error;
    }
    const stdout = result.stdout.toString();
    const page_count = stdout.match(/NumberOfPages:\s+(\d+)/)[1];
    return page_count;
}