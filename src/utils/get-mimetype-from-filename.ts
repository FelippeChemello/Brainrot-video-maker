export function getMimetypeFromFilename(filename: string): { mimeType: string; extension: string } {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension) {
        throw new Error(`Filename "${filename}" does not have an extension`);
    }

    const mimeTypes: Record<string, string> = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        mp4: 'video/mp4',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webm: 'video/webm',
    };

    const mimeType = mimeTypes[extension];
    if (!mimeType) {
        throw new Error(`Unsupported file type: ${extension}`);
    }

    return { mimeType, extension };
}