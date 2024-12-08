import { PipelineBase } from "./base";
import { exec } from 'child_process';
import { promisify } from 'util';
import path from "path";
import type { SourceryFile } from "@sourcery/common/types/SourceryFile.type";

const execAsync = promisify(exec);

export class MontagePipeline extends PipelineBase {
    constructor(file: SourceryFile) {
        super(file, "images", "images");
        console.log("Montage Pipeline constructor");
    }

    private async getImageSize(imagePath: string): Promise<string> {
        const command = `identify -format "%wx%h" ${imagePath}`;
        console.log(`Command: ${command}`);
        const { stdout } = await execAsync(command);
        return stdout.trim();
    }
    
    async process() {
        try {
            const images = MontagePipeline.stage_paths.images.files;
            const montageOutputPath = path.join(this.filepath, "images", "montage.jpg");
            
            const imageInputPaths = images.map(image => 
                path.join(this.filepath, "images", image)
            ).filter(file => {
                return file.match(/^.*-\d+\.png$/);
            }).join(' ');

            // Get the size of the images
            const image_size = await this.getImageSize(path.join(this.filepath, "images", images[1]));
            console.log(`Image size: ${image_size}`);
            
            const command = `montage -label %f -frame 5 -background '#336699' -geometry ${image_size}+4+4 ${imageInputPaths} ${montageOutputPath}`;
            await execAsync(command);
            
            return this.file;
        } catch (error) {
            console.error('Error creating montage:', error);
            throw error;
        }
    }
} 