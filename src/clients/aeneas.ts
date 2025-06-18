import fs from 'fs';

import { ENV } from "../config/env";
import { AudioAlignerClient } from './interfaces/AudioAligner';
import { AeneasAlignment, AudioAlignerDTO, AudioAlignerResponse } from '../config/types';
import { getAudioDurationInSeconds } from "get-audio-duration";

export class AeneasClient implements AudioAlignerClient {
    async alignAudio({ audio, text }: AudioAlignerDTO): Promise<AudioAlignerResponse> {
        console.log(`[AENEAS] Parsing audio metadata`)

        const durationInSeconds = await getAudioDurationInSeconds(audio.filepath)
        if (!durationInSeconds) {
            throw new Error('Could not get audio duration')
        }

        console.log(`[AENEAS] Aligning audio with text`)

        const audioBuffer = fs.readFileSync(audio.filepath)

        const formData = new FormData()
        const blob = new Blob([audioBuffer], { type: audio.mimeType })
        formData.append('audio_file', blob)
        formData.append('text', text)

        const aligned = await fetch(
            `${ENV.AENEAS_BASE_URL}`, 
            {
                method: 'POST',
                headers: { 'x-api-key': ENV.AENEAS_API_KEY },
                body: formData
            })
            .then(async res => {
                if (!res.ok) {
                    const response = await res.text();
                    console.log(`[AENEAS] Error response: ${response}`);

                    throw new Error(`Failed to align audio: ${res.status} ${res.statusText}`)
                }

                console.log(`[AENEAS] Audio aligned successfully`)

                return res.json() as Promise<AeneasAlignment>
            })
            .catch(err => {
                console.error(`[AENEAS] Error aligning audio: ${err.message}`)
                throw new Error('Failed to align audio with text')
            })

        const segments = aligned.fragments.map(fragment => {
            return {
                start: parseFloat(fragment.begin),
                end: parseFloat(fragment.end),
                text: fragment.lines.join(' ')
            }
        })

        return {
            alignment: segments,
            duration: durationInSeconds,
        }
    }
}