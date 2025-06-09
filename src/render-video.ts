import fs from 'fs';
import path from 'path';

import { ScriptStatus } from './config/types';
import { publicDir } from './config/path';
import { ScriptManagerClient } from './clients/interfaces/ScriptManager';
import { NotionClient } from './clients/notion';
import { AudioAlignerClient } from './clients/interfaces/AudioAligner';
import { AeneasClient } from './clients/aeneas';
import { VideoRendererClient } from './clients/interfaces/VideoRenderer';
import { RemotionClient } from './clients/remotion';

const scriptManager: ScriptManagerClient = new NotionClient()
const audioAligner: AudioAlignerClient = new AeneasClient();
const renderer: VideoRendererClient = new RemotionClient();

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
    }

    await scriptManager.saveOutput(script.id, videos)

    await scriptManager.updateScriptStatus(script.id, ScriptStatus.DONE);

    console.log(`Cleaning up assets for script ${script.title}...`);

    fs.unlinkSync(path.join(publicDir, script.audioSrc));
    for (const segment of script.segments) {
        if (segment.imageSrc) {
            fs.unlinkSync(path.join(publicDir, segment.imageSrc));
        }
    }
}

