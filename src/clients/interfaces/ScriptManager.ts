import { ScriptStatus, ScriptWithTitle, VideoBackground } from "../../config/types";

export interface ScriptManagerClient {
    saveScript(script: ScriptWithTitle): Promise<void>;
    retrieveScript(status: ScriptStatus): Promise<Array<ScriptWithTitle>>;
    updateScriptStatus(scriptId: string, status: ScriptStatus): Promise<void>;
    retrieveAssets(scriptId: string): Promise<{ background: VideoBackground }>;
    downloadAssets(script: ScriptWithTitle): Promise<ScriptWithTitle>;
    saveOutput(scriptId: string, output: Array<string>): Promise<void>;
}