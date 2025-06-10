import ffmpeg from 'fluent-ffmpeg';

import { MediaEditorClient } from './interfaces/VideoManipulator'

export class FFmpegClient implements MediaEditorClient {
    async speedUpVideo(videoPath: string, speedFactor: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const outputPath = videoPath.replace(/(\.\w+)$/, `-SpeedUp$1`);
    
            ffmpeg(videoPath)
                .videoFilters(`setpts=${1 / speedFactor}*PTS`)
                .audioFilters(`atempo=${speedFactor}`)
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', (err) => reject(err))
                .run();
        });
    }
}