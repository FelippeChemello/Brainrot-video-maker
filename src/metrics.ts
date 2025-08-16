import fs from 'fs'
import path from 'path'

import { SocialMediaClient } from "./clients/interfaces/SocialMedia";
import { TiktokClient } from "./clients/tiktok";
import { outputDir } from './config/path';

const tiktok: SocialMediaClient = new TiktokClient()

fs.writeFileSync(path.resolve(outputDir, 'metrics.json'), JSON.stringify(await tiktok.getMetrics(), null, 2), 'utf-8')