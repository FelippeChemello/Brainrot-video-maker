import { ScriptManagerClient } from './clients/interfaces/ScriptManager';
import { NotionClient } from './clients/notion';

const scriptManager: ScriptManagerClient = new NotionClient()

await scriptManager.downloadOutputOfDoneScripts();