import fs from 'fs'
import { GoogleGenAI } from '@google/genai'
import terminalImage from 'terminal-image';

import { ImageGeneratorClient } from './interfaces/ImageGenerator';
import { ENV } from '../config/env';
import { publicDir } from '../config/path';

const genAI = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY })

export class GeminiClient implements ImageGeneratorClient {
    async generate(prompt: string, id?: string | number) {
        try {
            console.log(`[GEMINI] Generating image with prompt: ${prompt}`);

            const imageResult = await genAI.models.generateContent({
                model: 'gemini-2.0-flash-exp-image-generation',
                contents: `Generate an image for the following prompt: ${prompt}`,
                config: { responseModalities: ['text', 'image'] },
            })

            const parts = imageResult.candidates![0].content?.parts!
            fs.writeFileSync(`${publicDir}/response.json`, JSON.stringify(imageResult, null, 2))

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

                    if (id !== undefined) {
                        const filePath = `${publicDir}/image-${id}.png`
                        fs.writeFileSync(filePath, imageBuffer)
                        console.log(`[GEMINI] Image saved to ${filePath}`);
                    }

                    return { imageSrc: `data:${mimeType};base64,${base64Data}` }
                }
            }

            throw new Error('No image data found in the response');
        } catch (error) {
            console.log(`[GEMINI] Error generating image: ${error}`);
            
            return { imageSrc: undefined }
        }
    }
}