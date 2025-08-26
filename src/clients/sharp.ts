import fs from 'node:fs'
import sharp from "sharp";
import { ImageEditorClient } from './interfaces/ImageEditor';

export class SharpClient implements ImageEditorClient {
    async compressImageToMaxSize(imagePath: string, maxSizeKB: number): Promise<string> {
        const currentSize = await fs.statSync(imagePath).size / 1024;
        if (currentSize <= maxSizeKB) {
            console.log(`[SHARP] Image already under ${maxSizeKB}KB, no compression needed.`);
            return imagePath;
        }

        let quality = 80;
        const compressedImagePath = imagePath.replace(/(\.\w+)$/, `-compressed$1`);

        while (quality > 10) {
            await sharp(imagePath)
                .png({ quality })
                .toFile(compressedImagePath);

            const newSize = await fs.statSync(compressedImagePath).size / 1024;
            console.log(`[SHARP] Compressed image to ${newSize.toFixed(2)}KB with quality ${quality}.`);

            if (newSize <= maxSizeKB) {
                console.log(`[SHARP] Compression successful: ${compressedImagePath}`);
                return compressedImagePath;
            }

            quality -= 10;
        }

        console.warn(`[SHARP] Could not compress image to under ${maxSizeKB}KB, returning best effort: ${compressedImagePath}`);
        return compressedImagePath;
    }
}