import fs from 'fs';
import path from 'path';

import { publicDir, rootDir } from './config/path';
import { ScriptWithTitle } from './config/types';
import { sleep } from './utils/sleep';
import { ScriptManagerClient } from './clients/interfaces/ScriptManager';
import { NotionClient } from './clients/notion';
import { ImageGeneratorClient } from './clients/interfaces/ImageGenerator';
import { GeminiClient } from './clients/gemini';
import { titleToFileName } from './utils/title-to-filename';

const jsonScript = fs.readFileSync(path.join(rootDir, 'script.json'), 'utf-8')
const script = JSON.parse(jsonScript) as ScriptWithTitle;


fs.writeFileSync(path.join(rootDir, `${titleToFileName(script.title)}.txt`), `
Read aloud this conversation between Felippe and his dog Cody. Cody has a curious and playful personality with an animated character like voice, while Felippe is knowledgeable and enthusiastic.
Felippe is known for his vast knowledge, and Cody is a curious dog who is always asking questions about the world, both are Brazilian Portuguese speakers and have a super very fast-paced, energetic, and enthusiastic way of speaking.

${script.segments.map((s) => `${s.speaker}: ${s.text}`).join('\n')}
`, 'utf-8');

const scriptManagerClient: ScriptManagerClient = new NotionClient();
const imageGenerator: ImageGeneratorClient = new GeminiClient();

// Add rate limiting to avoid exceeding the FREE TIER limit from Gemini
// https://ai.google.dev/gemini-api/docs/rate-limits?hl=pt-br#free-tier
const maxIterationsPerMinute = 8;
let iterationsInMinute = 0;
let minuteStartTime = Date.now();

for (const [index, segment] of script.segments.entries()) {
    if (segment.image_description) {
        if (iterationsInMinute >= maxIterationsPerMinute) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - minuteStartTime;
            if (elapsedTime < 60000) {
                const waitTime = 60000 - elapsedTime;

                console.log(`Rate limit reached. Waiting for ${(waitTime / 1000).toFixed(1)} seconds...`);
                await sleep(waitTime);
            }
            iterationsInMinute = 0;
            minuteStartTime = Date.now();
        }

        console.log(`[${index + 1}/${script.segments.length}] Generating image`);
        const { imageSrc } = await imageGenerator.generate(segment.image_description, index);
        
        script.segments[index].imageSrc = imageSrc;
        iterationsInMinute++;
    }
}

await scriptManagerClient.saveScript(script)

console.log(`Cleaning up assets...`)
for (const segment of script.segments) {
    if (segment.imageSrc) {
        const imagePath = path.join(publicDir, segment.imageSrc);
        fs.unlinkSync(imagePath);
    }
}
