import fs from 'fs';
import path from 'path';

import { outputDir, publicDir } from './config/path';
import { ScriptWithTitle } from './config/types';
import { sleep } from './utils/sleep';
import { ScriptManagerClient } from './clients/interfaces/ScriptManager';
import { NotionClient } from './clients/notion';
import { ImageGeneratorClient } from './clients/interfaces/ImageGenerator';
import { titleToFileName } from './utils/title-to-filename';
import { Agent, LLMClient } from "./clients/interfaces/LLM";
import { OpenAIClient } from "./clients/openai";
import { AnthropicClient } from "./clients/anthropic";
import { GeminiClient } from "./clients/gemini";

const openai: LLMClient = new OpenAIClient();
const anthropic: LLMClient = new AnthropicClient();
const gemini: LLMClient = new GeminiClient();
const scriptManagerClient: ScriptManagerClient = new NotionClient();
const imageGenerator: ImageGeneratorClient = new GeminiClient();

const topic = process.argv[2]
if (!topic) {
    console.error("Please provide a topic as the first argument.");
    process.exit(1);
}

console.log(`Starting research on topic: ${topic}`);
const { text: research } = await gemini.complete(Agent.RESEARCHER, `Tópico: ${topic}`);

console.log("Writing script based on research...");
const { text: scriptText } = await openai.complete(Agent.SCRIPT_WRITER, `Tópico: ${topic}\n\n Utilize o seguinte contexto para escrever um roteiro de vídeo:\n\n${research}`);

console.log("Reviewing script...");
const { text: review } = await anthropic.complete(Agent.SCRIPT_REVIEWER, scriptText)
const scripts = JSON.parse(review) as ScriptWithTitle | ScriptWithTitle[];

for (const script of Array.isArray(scripts) ? scripts : [scripts]) {
    fs.writeFileSync(path.join(outputDir, `${titleToFileName(script.title)}.txt`), `
Read aloud this conversation between Felippe and his dog Cody. Cody has a curious and playful personality with an animated character like voice, while Felippe is knowledgeable and enthusiastic.
Felippe is known for his vast knowledge, and Cody is a curious dog who is always asking questions about the world, both are Brazilian Portuguese speakers and have a super very fast-paced, energetic, and enthusiastic way of speaking.

${script.segments.map((s) => `${s.speaker}: ${s.text}`).join('\n')}
    `, 'utf-8');

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
            const { mediaSrc } = await imageGenerator.generate(segment.image_description, index);
            
            script.segments[index].mediaSrc = mediaSrc;
            iterationsInMinute++;
        }
    }

    console.log("Generating SEO content...");
    const { text: seoText } = await anthropic.complete(Agent.SEO_WRITER, review)
    const seo = JSON.parse(seoText);

    await scriptManagerClient.saveScript(script, seo)

    console.log(`Cleaning up assets...`)
    for (const segment of script.segments) {
        if (segment.mediaSrc) {
            const imagePath = path.join(publicDir, segment.mediaSrc);
            fs.unlinkSync(imagePath);
        }
    }
}