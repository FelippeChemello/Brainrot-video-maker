export interface ImageGeneratorClient {
    generate(prompt: string, id?: string | number): Promise<{ mediaSrc?: string }>
}