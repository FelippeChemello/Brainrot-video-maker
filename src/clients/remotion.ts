import { bundle as bundler} from '@remotion/bundler';
import { enableTailwind } from '@remotion/tailwind-v4';
import path from 'path';
import { MultiBar } from 'cli-progress'

import { ScriptWithTitle } from '../config/types';
import { VideoRendererClient } from './interfaces/VideoRenderer';
import { outputDir, videoDir } from '../config/path';
import { renderMedia, selectComposition } from '@remotion/renderer';

const timeout = 2 * 60 * 1000; // 2 minutes in milliseconds
const port = 9999; // Port for Remotion server

export class RemotionClient implements VideoRendererClient {
    async renderVideo(script: ScriptWithTitle, compositionName: string): Promise<string> {
        console.log(`[REMOTION] Bundling video for script "${script.title}" with composition "${compositionName}"...`);
        const bundle = await bundler({
            entryPoint: path.resolve(videoDir, 'index.ts'),
            webpackOverride: enableTailwind,
        })

        console.log(`[REMOTION] Getting composition "${compositionName}" from bundle...`);
        const composition = await selectComposition({
            serveUrl: bundle,
            id: compositionName,
            inputProps: script,
            timeoutInMilliseconds: timeout,
            port
        })

        const filename = script.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        const outputFilename = `${filename}-${compositionName}.mp4`;
        const outputPath = path.join(outputDir, outputFilename);

        console.log(`[REMOTION] Rendering video to ${outputPath}...`);

        const progress = new MultiBar({
            clearOnComplete: false,
            hideCursor: true,
            format: '[REMOTION] {bar} | {percentage}% | ETA: {eta}s | {value}/{total} | {stage}',
            fps: 2,
            etaBuffer: 250
        })
        const renderedFrames = progress.create(100, 0, { stage: 'Starting render' })
        const encodedFrames = progress.create(100, 0, { stage: 'Starting encode' })

        await renderMedia({
            composition,
            serveUrl: bundle,
            codec: 'h264',
            outputLocation: outputPath,
            inputProps: script,
            disallowParallelEncoding: false,
            timeoutInMilliseconds: timeout,
            port,
            onStart: (started) => {
                renderedFrames.setTotal(started.frameCount);
                encodedFrames.setTotal(started.frameCount);
            },
            onProgress: (progress) => {
                renderedFrames.update(progress.renderedFrames, {
                    stage: progress.renderedDoneIn ? `Render done in ${Math.round(progress.renderedDoneIn)}s` : 'Rendering'
                })

                encodedFrames.update(progress.encodedFrames, {
                    stage: progress.stitchStage 
                })
            }
        })

        progress.stop();

        return outputPath;
    }
}