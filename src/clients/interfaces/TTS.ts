import { Script, Speaker } from "../../config/types";

export interface TTSClient {
    synthesize(voice: Speaker, text: string, id?: string | number): Promise<{ audioFileName: string, duration?: number }>;
    synthesizeScript(script: Script, id?: string | number): Promise<{ audioFileName: string, duration?: number }>;
}