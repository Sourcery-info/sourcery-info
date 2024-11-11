import { exec } from 'child_process';

export const exec_command = (command: string) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                return reject(stderr);
            }
            resolve(stdout.trim());
        });
    });
};