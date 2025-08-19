export interface MermaidRendererClient {
    exportMermaid(mermaidCode: string, id?: string | number): Promise<{ mediaSrc?: string }>
}