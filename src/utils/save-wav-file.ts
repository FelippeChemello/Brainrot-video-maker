import wav from 'wav'

export async function saveWaveFile(filePath: string, audioBuffer: Buffer, channels = 1, rate = 24000, sampleWidth = 2) {
    return new Promise<void>((resolve, reject) => {
        const writer = new wav.FileWriter(filePath, {
            channels,
            sampleRate: rate,
            bitDepth: sampleWidth * 8,
        })

        writer.on('error', (err) => {
            console.error(`[SAVE-WAV] Error writing WAV file: ${err}`)
            reject(err)
        })
        writer.on('finish', () => {
            console.log(`[SAVE-WAV] WAV file saved successfully: ${filePath}`)
            resolve()
        })

        writer.write(audioBuffer)
        writer.end()
        console.log(`[SAVE-WAV] Finished writing WAV file: ${filePath}`)
    })
}