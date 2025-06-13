import fs from 'fs';
import path from 'path';
import { getVideoDurationInSeconds } from 'get-video-duration';

import { ScriptStatus } from './config/types';
import { publicDir } from './config/path';
import { ScriptManagerClient } from './clients/interfaces/ScriptManager';
import { NotionClient } from './clients/notion';
import { AudioAlignerClient } from './clients/interfaces/AudioAligner';
import { AeneasClient } from './clients/aeneas';
import { VideoRendererClient } from './clients/interfaces/VideoRenderer';
import { RemotionClient } from './clients/remotion';
import { MediaEditorClient } from './clients/interfaces/VideoManipulator';
import { FFmpegClient } from './clients/ffmpeg';

const MAX_DURATION_FOR_SHORT_CONVERSION = 350;
const MAX_DURATION_OF_SHORT_VIDEO = 170;

const scriptManager: ScriptManagerClient = new NotionClient()
const audioAligner: AudioAlignerClient = new AeneasClient();
const renderer: VideoRendererClient = new RemotionClient();
const editor: MediaEditorClient = new FFmpegClient();

const scripts = await scriptManager.retrieveScript(ScriptStatus.NOT_STARTED);

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

    await scriptManager.updateScriptStatus(script.id, ScriptStatus.IN_PROGRESS);

    const assets = await scriptManager.retrieveAssets(script.id);
    script.background = assets.background;

    await scriptManager.downloadAssets(script);

    const textWithoutHTMLTags = script.segments.map((segment) => {
        return segment.text.replace(/<\/?[^>]+(>|$)/g, "");
    }).join('\n');

    console.log(`Aligning audio for script ${script.title}...`);
    const audio = await audioAligner.alignAudio({
        audio: {
            filepath: path.join(publicDir, script.audioSrc),
            mimeType: script.audioMimeType!
        },
        text: textWithoutHTMLTags
    })

    script.alignment = audio.alignment;
    script.duration = audio.duration;

    fs.writeFileSync(path.join(publicDir, 'script.json'), JSON.stringify(script, null, 2));

    const videos: string[] = []
    for (const composition of script.compositions) {
        console.log(`Rendering ${composition} for script ${script.title}...`);
        const videoPath = await renderer.renderVideo(script, composition);
        
        console.log(`Rendered video for composition ${composition} at path: ${videoPath}`);
        videos.push(videoPath);

        const videoDuration = await getVideoDurationInSeconds(videoPath);
        if (composition === 'Portrait' && videoDuration <= MAX_DURATION_FOR_SHORT_CONVERSION) {
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

    fs.unlinkSync(path.join(publicDir, script.audioSrc));
    for (const segment of script.segments) {
        if (segment.mediaSrc) {
            fs.unlinkSync(path.join(publicDir, segment.mediaSrc));
        }
    }
}

