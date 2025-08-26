export interface ImageEditorClient {
    compressImageToMaxSize(imagePath: string, maxSizeKB: number): Promise<string>;
}