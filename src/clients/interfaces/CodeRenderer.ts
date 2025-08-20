export interface CodeRendererClient {
    exportCode(code: string, id?: string | number): Promise<{ mediaSrc?: string }>
}