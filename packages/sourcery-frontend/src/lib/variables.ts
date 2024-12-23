import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export const PROJECT_DIR = path.resolve(process.env.PROJECT_DIR || 'projects');
export const FILETYPES = ['pdf', 'txt', 'html'];
