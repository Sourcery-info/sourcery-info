import { spawn } from "child_process";

export function easyocr(img, lang = ["en"], gpu = true, detail = 1) {
    const child = spawn("easyocr", "-f", img, "-l", lang.join(","), "--gpu", gpu ? "True" : "False", "--detail", detail);
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

