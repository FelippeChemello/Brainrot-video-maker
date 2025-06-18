import fs from 'fs';

import { ENV } from "../config/env";
import { AudioAlignerDTO, AudioToVisemeResponse, MontrealAudioAlignment } from '../config/types';
import { Phone2Viseme, VisemeAlignerClient } from './interfaces/VisemeAligner';

export class MFAClient implements VisemeAlignerClient {
    async alignViseme({ audio, text }: AudioAlignerDTO): Promise<AudioToVisemeResponse> {
        console.log(`[MFA] Aligning audio with text`)

        const audioBuffer = fs.readFileSync(audio.filepath)

        const formData = new FormData()
        const blob = new Blob([audioBuffer], { type: audio.mimeType })
        formData.append('audio_file', blob)
        formData.append('text', text)

        const aligned = await fetch(
            `${ENV.MFA_BASE_URL}`, 
            {
                method: 'POST',
                headers: { 'x-api-key': ENV.MFA_API_KEY },
                body: formData
            })
            .then(async res => {
                if (!res.ok) {
                    const response = await res.text();
                    console.log(`[MFA] Error response: ${response}`);

                    throw new Error(`Failed to align audio: ${res.status} ${res.statusText}`)
                }

                console.log(`[MFA] Audio aligned successfully`)

                return res.json() as Promise<MontrealAudioAlignment>
            })
            .catch(err => {
                console.error(`[MFA] Error aligning audio: ${err.message}`)
                throw new Error('Failed to align audio with text')
            })

        const visemes = aligned.tiers.phones.entries.map(phone => {
            const viseme = Phone2Viseme[phone[2]]
            if (!viseme) {
                console.warn(`[MFA] Unknown viseme for phone: ${phone[2]}`);
            }

            return {
                start: phone[0],
                end: phone[1],
                viseme: viseme || 'X'
            }
        })

        return {
            visemes
        }
    }
}