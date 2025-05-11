export interface AudioAlignerClient {
    alignAudio(audioFile: string, text: string): Promise<Array<{ start: number, end: number, text: string }>>;
}