export interface MediaEditorClient {
    speedUpVideo(videoPath: string, speedFactor: number): Promise<string>;
}