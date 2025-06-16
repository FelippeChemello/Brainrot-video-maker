/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-asserted-optional-chain */
import fs from 'fs'
import { GoogleGenAI } from '@google/genai'
import terminalImage from 'terminal-image';

import { ImageGeneratorClient } from './interfaces/ImageGenerator';
import { ENV } from '../config/env';
import { publicDir } from '../config/path';
import { v4 } from 'uuid';
import { TTSClient } from './interfaces/TTS';
import { Script, Speaker } from '../config/types';
import { saveWaveFile } from '../utils/save-wav-file';
import getAudioDurationInSeconds from 'get-audio-duration';
import { Agent, Agents, LLMClient } from './interfaces/LLM';

const genAI = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY })

const voices: { [key in keyof typeof Speaker]: string } = {
    Cody: 'Puck',
    Felippe: 'Achird',
}

export class GeminiClient implements ImageGeneratorClient, TTSClient, LLMClient {
    async synthesize(_: Speaker, text: string, id?: string | number): Promise<{ audioFileName: string; duration: number; }> {
        throw new Error('Method not implemented.');
    }

    async synthesizeScript(script: Script, id?: string | number): Promise<{ audioFileName: string; duration: number; }> {
        const audioFileName = `audio-${id}.mp3`
        const filePath = `${publicDir}/${audioFileName}`
        
        const prompt = `
            Read aloud this conversation between Felippe and his dog Cody.
            Felippe is known for his vast knowledge, and Cody is a curious dog who is always asking questions about the world, both are Brazilian Portuguese speakers and have a fast-paced, energetic, and enthusiastic way of speaking.

            ${script.map((s) => `${s.speaker}: ${s.text}`).join('\n')}
        `;

        console.log(`[GEMINI] Synthesizing script`);
        const audioResult = await genAI.models.generateContent({
            model: 'gemini-2.5-pro-preview-tts',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    // @ts-expect-error preview feature
                    multiSpeakerVoiceConfig: {
                        speakerVoiceConfigs: [
                            {
                                speaker: Speaker.Cody,
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: voices.Cody }
                                }
                            },
                            {
                                speaker: Speaker.Felippe,
                                voiceConfig: {
                                    prebuiltVoiceConfig: { voiceName: voices.Felippe }
                                }
                            }
                        ]
                    }
                }
            }
        })

        const data = audioResult.candidates?.[0].content?.parts?.[0]?.inlineData?.data
        if (!data) {
            throw new Error('No audio data found in the response');
        }

        const audioBuffer = Buffer.from(data, 'base64')
        await saveWaveFile(filePath, audioBuffer)

        console.log(`[GEMINI] Audio synthesized successfully: ${filePath}`);

        const duration = await getAudioDurationInSeconds(filePath);
        console.log(`[GEMINI] Audio duration: ${duration}`);

        return { audioFileName, duration }
    }

    async generate(prompt: string, id: string | number = v4()) {
        try {
            console.log(`[GEMINI] Generating image with prompt: ${prompt}`);

            const imageResult = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-exp-image-generation',
                contents: `Generate an image for the following prompt: ${prompt}`,
                config: { responseModalities: ['text', 'image'] },
            })

            const parts = imageResult.candidates![0].content?.parts!
            for (const part of parts) {
                if (part.text) {
                    console.log(`[GEMINI] Text response: ${part.text}`);
                    continue
                }

                if (part.inlineData) {
                    const mimeType = part.inlineData.mimeType
                    const base64Data = part.inlineData.data
                    if (!base64Data) {
                        throw new Error('No base64 data found in the response');
                    }

                    console.log(`[GEMINI] Image generated successfully: ${mimeType}`);

                    const imageBuffer = Buffer.from(base64Data, 'base64')
                    console.log(await terminalImage.buffer(imageBuffer))

                    const filename = `image-${id}.png`
                    const filePath = `${publicDir}/${filename}`
                    fs.writeFileSync(filePath, imageBuffer)
                    console.log(`[GEMINI] Image saved to ${filePath}`);
                    
                    return { mediaSrc: filename }
                }
            }

            throw new Error('No image data found in the response');
        } catch (error) {
            console.log(`[GEMINI] Error generating image: ${error}`);
            
            return { mediaSrc: undefined }
        }
    }

    async complete(agent: Agent, prompt: string): Promise<{ text: string }> {
        console.log(`[GEMINI] Running agent: ${agent}`);

        const response = await genAI.models.generateContent({
            model: Agents[agent].model.gemini,
            contents: prompt,
            config: {
                systemInstruction: Agents[agent].systemPrompt,
                responseModalities: ['text'],
                maxOutputTokens: 65536,
                temperature: 0.7,
                tools: [{ googleSearch: {} }],
                thinkingConfig: {
                    thinkingBudget: 4096,
                }    
            }
        });

        const text = response.text!
        const parsedResponse = Agents[agent].responseParser(text);

        return { text: parsedResponse };
    }
}