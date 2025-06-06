import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const rootDir = path.join(__dirname, '..', '..');
export const publicDir = path.join(rootDir, 'public');
export const outputDir = path.join(rootDir, 'out');
export const videoDir = path.join(rootDir, 'src', 'video');