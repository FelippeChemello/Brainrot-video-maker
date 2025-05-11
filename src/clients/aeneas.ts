import fs from 'fs'
import path from 'path';

import { ENV } from "../config/env";
import { publicDir } from '../config/path';
import { AudioAlignerClient } from './interfaces/AudioAligner';

export class AeneasClient implements AudioAlignerClient {
    async alignAudio(audioFile: string, text: string) {
        console.log(`[AENEAS] Aligning audio: ${audioFile} with text: ${text}`)

        const formData = new FormData()
        const buffer = fs.readFileSync(path.resolve(publicDir, audioFile))
        const blob = new Blob([buffer], { type: 'audio/mp3' })
        formData.append('audio_file', blob)
        formData.append('text', text)

        const aligned = await fetch(`${ENV.AENEAS_BASE_URL}`, {
            method: 'POST',
            headers: { 'x-api-key': ENV.AENEAS_API_KEY },
            body: formData
        }).then(res => res.json() as Promise<{ fragments: Array<{ begin: string, end: string, id: string, lines: Array<string> }> }>)

        const segments = aligned.fragments.map(fragment => {
            return {
                start: parseFloat(fragment.begin),
                end: parseFloat(fragment.end),
                text: fragment.lines.join(' ')
            }
        })

        return segments
    }
}