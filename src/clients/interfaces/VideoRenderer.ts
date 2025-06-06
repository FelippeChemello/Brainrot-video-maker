import { ScriptWithTitle } from "../../config/types";

export interface VideoRendererClient {
    renderVideo(script: ScriptWithTitle, composition: string): Promise<string>;
}