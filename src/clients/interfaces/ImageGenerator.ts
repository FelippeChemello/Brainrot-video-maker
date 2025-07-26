export interface ImageGeneratorClient {
    generate(prompt: string, id?: string | number): Promise<{ mediaSrc?: string }>
    generateThumbnail(videoTitle: string, videoDescription: string): Promise<{ mediaSrc?: string }>
}