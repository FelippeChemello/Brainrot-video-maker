export interface VideoEditorClient {
    speedUpVideo(videoPath: string, speedFactor: number): Promise<string>;
}