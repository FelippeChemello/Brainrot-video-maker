export interface ImageGeneratorClient {
    generate(prompt: string, id?: string | number): Promise<{ imageSrc?: string }>
}