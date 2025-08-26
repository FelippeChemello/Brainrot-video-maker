import { ScriptManagerClient } from './clients/interfaces/ScriptManager';
import { NotionClient } from './clients/notion';

import { ImageEditorClient } from "./clients/interfaces/ImageEditor";
import { SharpClient } from "./clients/sharp";

const scriptManager: ScriptManagerClient = new NotionClient()
const sharp: ImageEditorClient = new SharpClient();

const filesDownloaded = await scriptManager.downloadOutputOfDoneScripts();
console.log(`Downloaded ${filesDownloaded.length} files.`);

const filesThatNeedCompression = filesDownloaded.filter(file => file.endsWith('.png') && file.includes('Thumbnail-Landscape'));
console.log(`Found ${filesThatNeedCompression.length} files that may need compression.`);

for (const file of filesThatNeedCompression) {
    console.log(`Compressing file: ${file}`);
    await sharp.compressImageToMaxSize(file, 2_000);
}