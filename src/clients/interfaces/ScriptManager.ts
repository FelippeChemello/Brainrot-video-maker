import { ScriptStatus, ScriptWithTitle, SEO, VideoBackground } from "../../config/types";

export interface ScriptManagerClient {
    saveScript(script: ScriptWithTitle, seo: SEO, thumbnailsSrc?: Array<string>, formats?: Array<'Landscape' | 'Portrait'>): Promise<void>;
    retrieveScript(status: ScriptStatus, limit?: number): Promise<Array<ScriptWithTitle>>;
    updateScriptStatus(scriptId: string, status: ScriptStatus): Promise<void>;
    retrieveAssets(scriptId: string): Promise<{ background: VideoBackground }>;
    downloadAssets(script: ScriptWithTitle): Promise<ScriptWithTitle>;
    downloadOutputOfDoneScripts(): Promise<void>;
    saveOutput(scriptId: string, output: Array<string>): Promise<void>;
}