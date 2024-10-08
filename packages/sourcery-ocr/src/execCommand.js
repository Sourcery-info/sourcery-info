import { exec } from 'child_process';

export const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr);
            }
            resolve(stdout.trim());
        });
    });
};