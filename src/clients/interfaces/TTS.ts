import { Speaker } from "../../config/types";

export interface TTSClient {
    synthesize(voice: Speaker, text: string, id?: string | number): Promise<{ audioFileName: string, duration: number }>;
}