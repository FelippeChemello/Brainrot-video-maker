/* eslint-disable @typescript-eslint/no-explicit-any */
 
import path from 'path'
import { publicDir } from '../config/path';
import { v4 } from 'uuid';
import { CodeRendererClient } from './interfaces/CodeRenderer';
import { codeToHtml } from 'shiki';
import puppeteer from 'puppeteer';

const LANG_ALIASES: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    yml: 'yaml',
    sh: 'bash',
    pseudo: 'plaintext',
    pseudocode: 'plaintext',
    text: 'plaintext',
};

export class Shiki implements CodeRendererClient {
    private createHtmlCode(htmlCode: string) {
        return String.raw`<!doctype html>
            <meta charset="utf-8" />
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
            <style>
            html, body { margin: 0; padding: 0; background: transparent; }
            #card {
                display: inline-block;
                padding: 16px;
                background: #24292e;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,.35);
            }
            pre.shiki { margin: 0; }
            code {
                font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
                font-size: 14px;
                line-height: 1.6;
                white-space: pre; /* keep exact spacing */
            }
            </style>
            <div id="card">${htmlCode}</div>
        `;
    }

    private extractLangAndCode(markdown: string): { lang: string; code: string } {
        const m = markdown.match(/^```([^\n`]*)\n([\s\S]*?)\n?```$/m);
        if (!m) return { lang: 'plaintext', code: markdown };

        const raw = m[1]?.trim().toLowerCase() || 'plaintext';
        const lang = LANG_ALIASES[raw] ?? raw;
        const code = m[2] ?? '';
        return { lang, code };
    }

    async exportCode(codeBlock: string, id?: string | number): Promise<{ mediaSrc?: string; }> {
        const fileName = `code-${typeof id === 'undefined' ? v4() : id}.png`
        const filePath = path.join(publicDir, fileName)

        const { lang, code } = this.extractLangAndCode(codeBlock);

        console.log(`[SHIKI] Rendering ${lang} code`);

        let highlightedCode: string;
        try {
            highlightedCode = await codeToHtml(code, {
                lang,
                theme: 'github-dark',
            });
        } catch (err: any) {
            console.log(`[SHIKI] Error with lang "${lang}", falling back to plaintext: ${err?.message}`);
            highlightedCode = await codeToHtml(code, {
                lang: 'plaintext',
                theme: 'github-dark',
            });
        }

        const browser = await puppeteer.launch({ headless: true })
        const page = await browser.newPage()
        await page.setViewport({ width: 1440, height: 350 })
        await page.setContent(this.createHtmlCode(highlightedCode), { waitUntil: 'networkidle0' })
        await page.evaluate(() => document.fonts?.ready)

        const codeElement  = await page.$('#card')
        if (!codeElement) throw new Error('Code element not found')

        await codeElement.screenshot({ path: filePath as `${string}.png`, omitBackground: true })
        await browser.close()

        console.log(`[SHIKI] Code exported to ${filePath}`);

        return { mediaSrc: fileName }
    }
}
