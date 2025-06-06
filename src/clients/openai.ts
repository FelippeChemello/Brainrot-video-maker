 
import fs from 'fs'
import OpenAI from 'openai'
import path from 'path';
import { v4 } from 'uuid';

import { ENV } from '../config/env';
import { publicDir } from '../config/path';
import { TTSClient } from './interfaces/TTS';
import { Script, Speaker } from '../config/types';
import { concatAudioFiles } from '../utils/concat-audio-files';

const openai = new OpenAI({
    apiKey: ENV.OPENAI_API_KEY,
});

const voices: { [key in keyof typeof Speaker]: string } = {
    Cody: 'coral',
    Felippe: 'ash',
}

const prompt: { [key in keyof typeof Speaker]: string } = {
    Cody: 'Brazilian, Bright, energetic, neutral accent with playful tones and friendly curiosity. Inquisitive and slightly excitable, genuinely amazed and eager to learn about new things. Very Quick Pace, spontaneous questions with natural enthusiasm, balanced by moments of thoughtful curiosity.',
    Felippe: 'Brazilian, Bright, energetic, young, neutral accent, sophisticated, with clear articulation. Slightly professorial, speaking with pride and confidence in his vast knowledge, yet always approachable. Clearly articulate Portuguese and technical terms authentically. Very Fast Paced.',
}

export class OpenAIClient implements TTSClient {
    async synthesize(speaker: Speaker, text: string, id?: string | number) {
        console.log(`[OPENAI] Synthesizing speech for speaker: ${speaker}, text length: ${text.length}`);
        
        const response = await openai.audio.speech.create({
            model: 'gpt-4o-mini-tts',
            voice: voices[speaker],
            instructions: prompt[speaker],
            input: text,
        })

        const speechFile = `audio-${typeof id === 'undefined' ? v4() : id}.mp3`
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(path.join(publicDir, speechFile), buffer);

        return {
            audioFileName: speechFile,
        }
    }

    async synthesizeScript(script: Script, id?: string | number) {
        const audioFileName = `audio-${typeof id === 'undefined' ? v4() : id}.mp3`;
        const filePath = path.join(publicDir, audioFileName);
        
        console.log(`[OPENAI] Synthesizing script`);
        const audioPromises = script
            .filter((segment) => segment.text && segment.text.trim() !== '')
            .reduce((acc, segment) => {
                const lastSpeaker = acc.length > 0 ? acc[acc.length - 1].speaker : null;
                if (lastSpeaker === segment.speaker) {
                    acc[acc.length - 1].text += ` ${segment.text}`;
                } else {
                    acc.push({ speaker: segment.speaker, text: segment.text });
                }
                
                return acc;
            }, [] as { speaker: Speaker, text: string }[])
            .map(async (segment, index) => this.synthesize(segment.speaker, segment.text, index))           

        const audioResults = await Promise.all(audioPromises);

        await concatAudioFiles(
            audioResults.map((result) => path.join(publicDir, result.audioFileName)),
            filePath
        );

        console.log(`[OPENAI] Merged audio file created`);

        return { audioFileName }
    }
}