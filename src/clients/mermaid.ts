import fs from 'fs'
import path from 'path'
import { run } from "@mermaid-js/mermaid-cli"
import { MermaidRendererClient } from "./interfaces/MermaidRenderer";
import { publicDir } from '../config/path';
import { v4 } from 'uuid';

export class Mermaid implements MermaidRendererClient {
    async exportMermaid(mermaidCode: string, id?: string | number): Promise<{ mediaSrc?: string; }> {
        console.log(`[MERMAID] Exporting mermaid to SVG`)

        const filename = `mermaid-${id ?? v4()}`
        const inputFile = path.resolve(publicDir, `${filename}.mmd`)
        fs.writeFileSync(inputFile, mermaidCode, 'utf-8')
        
        const outputFileName = `${filename}.svg`
        const outputFile = path.resolve(publicDir, outputFileName) as 'mermaid.svg'

        await run(inputFile, outputFile, {
            outputFormat: 'svg',
            quiet: true,
        })

        fs.rmSync(inputFile)

        console.log(`[MERMAID] Mermaid exported to ${outputFile}`)

        return {
            mediaSrc: outputFileName
        }
    }
}