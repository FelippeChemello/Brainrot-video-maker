import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
export const rootDir = path.join(__dirname, '..', '..');
export const publicDir = path.join(rootDir, 'public');