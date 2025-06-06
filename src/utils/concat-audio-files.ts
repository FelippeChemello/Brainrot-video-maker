import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { publicDir } from '../config/path';


export async function concatAudioFiles(filePaths: string[], outputFilePath: string): Promise<void> {
    if (filePaths.length === 0) {
        throw new Error('[FFMPEG] No audio files provided for concatenation');
    }

    if (filePaths.length === 1) {
        console.log(`[FFMPEG] Only one audio file provided, copying directly: ${filePaths[0]} to ${outputFilePath}`);

        fs.copyFileSync(filePaths[0], outputFilePath);
        return;
    }
    
    return new Promise<void>((resolve, reject) => {
       const command = ffmpeg();
        filePaths.forEach(filePath => {
            command.input(filePath);
        })

        command
            .on('start', () => {
                console.log(`[FFMPEG] Starting to concatenate audio files: ${filePaths.join(', ')}`);
            })
            .on('error', (err) => {
                console.error(`[FFMPEG] Error during concatenation: ${err.message}`);
                reject(err);
            })
            .on('end', () => {
                console.log(`[FFMPEG] Successfully concatenated audio files to ${outputFilePath}`);
                resolve();
            })
            .mergeToFile(outputFilePath, publicDir);
    })
}