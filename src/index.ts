import fs from 'fs';
import path from 'path';

import { publicDir, rootDir } from './config/path';
import { Script } from './config/types';
import { ElevenLabsTTSClient } from './clients/elevenlabs';
import { TTSClient } from './clients/interfaces/TTS';
import { AeneasClient } from './clients/aeneas';
import { AudioAlignerClient } from './clients/interfaces/AudioAligner';
import { ImageGeneratorClient } from './clients/interfaces/ImageGenerator';
import { GeminiClient } from './clients/gemini';

const script = JSON.parse(fs.readFileSync(path.join(rootDir, 'script.json'), 'utf-8')) as Script;

const ttsClient: TTSClient = new ElevenLabsTTSClient();
const audioAlignerClient: AudioAlignerClient = new AeneasClient()
const imageGenerator: ImageGeneratorClient = new GeminiClient();

for (const [index, segment] of script.entries()) {
    const textWithoutHTMLTags = segment.text.replace(/<[^>]*>/g, '');

    console.log(`[${index + 1}/${script.length}] Generating audio`);
    const { audioFileName, duration } = await ttsClient.synthesize(segment.speaker, textWithoutHTMLTags, index);

    console.log(`[${index + 1}/${script.length}] Aligning ${audioFileName} with text`);
    const alignment = await audioAlignerClient.alignAudio(audioFileName, textWithoutHTMLTags);

    script[index].audioFileName = audioFileName;
    script[index].duration = duration;
    script[index].alignment = alignment;

    console.log(`[${index + 1}/${script.length}] Audio generated and aligned: ${audioFileName}`);
    console.log(`[${index + 1}/${script.length}] Duration: ${duration}`);

    if (segment.image_description) {
        console.log(`[${index + 1}/${script.length}] Generating image`);
        const { imageSrc } = await imageGenerator.generate(segment.image_description, index);
        
        script[index].imageSrc = imageSrc;
    }
}

fs.writeFileSync(path.join(publicDir, 'script.json'), JSON.stringify(script, null, 2));