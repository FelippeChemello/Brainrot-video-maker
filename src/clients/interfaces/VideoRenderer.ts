import { ScriptWithTitle } from "../../config/types";

export interface VideoRendererClient {
    getBundle(): Promise<string>;
    renderVideo(script: ScriptWithTitle, composition: string, bundle?: string): Promise<string>;
}