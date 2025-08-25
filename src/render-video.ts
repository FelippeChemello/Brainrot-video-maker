import fs from 'fs';
import path from 'path';
import { getVideoDurationInSeconds } from 'get-video-duration';

import { ScriptStatus } from './config/types';
import { publicDir } from './config/path';
import { ScriptManagerClient } from './clients/interfaces/ScriptManager';
import { NotionClient } from './clients/notion';
import { AudioAlignerClient } from './clients/interfaces/AudioAligner';
import { MFAClient } from './clients/mfa';
import { VideoRendererClient } from './clients/interfaces/VideoRenderer';
import { RemotionClient } from './clients/remotion';
import { MediaEditorClient } from './clients/interfaces/VideoManipulator';
import { FFmpegClient } from './clients/ffmpeg';
import { AeneasClient } from './clients/aeneas';
import { VisemeAlignerClient } from './clients/interfaces/VisemeAligner';

const MAX_DURATION_FOR_SHORT_CONVERSION = 350;
const MAX_DURATION_OF_SHORT_VIDEO = 170;

const scriptManager: ScriptManagerClient = new NotionClient()
const audioAligner: AudioAlignerClient = new AeneasClient();
const visemeAligner: VisemeAlignerClient = new MFAClient();
const renderer: VideoRendererClient = new RemotionClient();
const editor: MediaEditorClient = new FFmpegClient();

const scripts = await scriptManager.retrieveScript(ScriptStatus.NOT_STARTED);

for (const script of scripts) {
    console.log(`Downloading assets for script ${script.title}...`);
    await scriptManager.downloadAssets(script);
}

const rendererBundle = await renderer.getBundle();
console.log(`Renderer bundle created at: ${rendererBundle}`);

for (const script of scripts) {
    if (!script.id) {
        console.log(`Script "${script.title}" does not have an ID`);
        continue;
    }

    if (!script.audioSrc || !script.audioMimeType) {
        console.log(`Script "${script.title}" does not have audio source or mime type`);
        continue;
    }

    if (!script.compositions || script.compositions.length === 0) {
        console.log(`Script "${script.title}" does not target any compositions`);
        continue;
    }

    try {
        await scriptManager.updateScriptStatus(script.id, ScriptStatus.IN_PROGRESS);

        const assets = await scriptManager.retrieveAssets(script.id);
        script.background = assets.background;

        const textWithoutHTMLTags = script.segments.map((segment) => {
            return segment.text.replace(/<\/?[^>]+(>|$)/g, "");
        }).join('\n');

        const audioFilePath = path.join(publicDir, script.audioSrc);
        
        if (!fs.existsSync(audioFilePath)) {
            console.error(`Audio file not found: ${audioFilePath}`);
            await scriptManager.updateScriptStatus(script.id, ScriptStatus.ERROR);
            continue;
        }

        console.log(`Aligning audio for script ${script.title}...`);
        const audio = await audioAligner.alignAudio({
            audio: {
                filepath: audioFilePath,
                mimeType: script.audioMimeType!
            },
            text: textWithoutHTMLTags
        })

        script.alignment = audio.alignment;
        script.duration = audio.duration;

        const { visemes } = await visemeAligner.alignViseme({
            audio: {
                filepath: audioFilePath,
                mimeType: script.audioMimeType!
            },
            text: textWithoutHTMLTags
        });

        script.visemes = visemes;

        const scriptFileName = `script-${script.id}.json`;
        fs.writeFileSync(path.join(publicDir, scriptFileName), JSON.stringify(script, null, 2));

        const videos: string[] = []
        for (const composition of script.compositions) {
            console.log(`Rendering ${composition} for script ${script.title}...`);
            const videoPath = await renderer.renderVideo(script, composition, rendererBundle);

            console.log(`Rendered video for composition ${composition} at path: ${videoPath}`);
            videos.push(videoPath);

            const videoDuration = await getVideoDurationInSeconds(videoPath);
            if (
                composition === 'Portrait' 
                && videoDuration <= MAX_DURATION_FOR_SHORT_CONVERSION 
                && videoDuration > MAX_DURATION_OF_SHORT_VIDEO
                && !script.compositions.includes('Landscape')
            ) {
                const speedFactor = Math.ceil((videoDuration / MAX_DURATION_OF_SHORT_VIDEO) * 100) / 100;

                console.log(`Speeding up video by a factor of ${speedFactor} to convert to short format`);
                const videoShortPath = await editor.speedUpVideo(videoPath, speedFactor);
                
                console.log(`Speeded up video saved at: ${videoShortPath}`);
                videos.push(videoShortPath);
            }
        }

        console.log(`Saving output for script ${script.title}...`);
        await scriptManager.saveOutput(script.id, videos)
        await scriptManager.updateScriptStatus(script.id, ScriptStatus.DONE);

        console.log(`Cleaning up assets for script ${script.title}...`);

        if (fs.existsSync(audioFilePath)) {
            fs.unlinkSync(audioFilePath);
        }
        
        const scriptFilePath = path.join(publicDir, scriptFileName);
        if (fs.existsSync(scriptFilePath)) {
            fs.unlinkSync(scriptFilePath);
        }
        
        for (const segment of script.segments) {
            if (segment.mediaSrc) {
                const mediaFilePath = path.join(publicDir, segment.mediaSrc);
                if (fs.existsSync(mediaFilePath)) {
                    fs.unlinkSync(mediaFilePath);
                }
            }
        }
    } catch (error) {
        console.error(`Error processing script ${script.title}:`, error);

        await scriptManager.updateScriptStatus(script.id, ScriptStatus.ERROR);
        
        const audioFilePath = path.join(publicDir, script.audioSrc);
        if (fs.existsSync(audioFilePath)) {
            fs.unlinkSync(audioFilePath);
        }
        
        const scriptFilePath = path.join(publicDir, `script-${script.id}.json`);
        if (fs.existsSync(scriptFilePath)) {
            fs.unlinkSync(scriptFilePath);
        }
        
        for (const segment of script.segments) {
            if (segment.mediaSrc) {
                const mediaFilePath = path.join(publicDir, segment.mediaSrc);
                if (fs.existsSync(mediaFilePath)) {
                    fs.unlinkSync(mediaFilePath);
                }
            }
        }
    }
}

fs.rmSync(rendererBundle, { recursive: true, force: true })
console.log('All scripts processed.');