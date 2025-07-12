import fs from 'fs';
import path from 'path';

import { promptsDir } from '../../config/path';

export enum Agent {
    SCRIPT_WRITER = 'SCRIPT_WRITER',
    SCRIPT_REVIEWER = 'SCRIPT_REVIEWER',
    SEO_WRITER = 'SEO_WRITER',
    RESEARCHER = 'RESEARCHER',
}

enum ModelProvider {
    OPENAI = 'openai',
    ANTHROPIC = 'anthropic',
    GEMINI = 'gemini',
}

export const Agents: {
    [name in Agent]: {
        systemPrompt: string;
        model: { [K in ModelProvider]: string };
        responseParser: (response: string) => string;
    };
} = {
    RESEARCHER: {
        systemPrompt: fs.readFileSync(path.resolve(promptsDir, 'researcher.md'), 'utf-8'),
        model: {
            [ModelProvider.OPENAI]: 'gpt-4o',
            [ModelProvider.ANTHROPIC]: 'claude-sonnet-4-0',
            [ModelProvider.GEMINI]: 'gemini-2.5-flash-preview-05-20',
        },
        responseParser: (response: string) => response.trim(),
    },
    SCRIPT_WRITER: {
        systemPrompt: fs.readFileSync(path.resolve(promptsDir, 'writer.md'), 'utf-8'),
        model: {
            [ModelProvider.OPENAI]: 'o3',
            [ModelProvider.ANTHROPIC]: 'claude-sonnet-4-0',
            [ModelProvider.GEMINI]: 'gemini-2.5-flash-preview-05-20',
        },
        responseParser: (response: string) => {
            const match = response.match(/\{[\s\S]*\}/);
            return match ? match[0] : response.replace(/```\w*\n/g, '').replace(/```/g, '').trim();
        },
    },
    SCRIPT_REVIEWER: {
        systemPrompt: fs.readFileSync(path.resolve(promptsDir, 'reviewer.md'), 'utf-8'),
        model: {
            [ModelProvider.OPENAI]: 'gpt-4o',
            [ModelProvider.ANTHROPIC]: 'claude-sonnet-4-0',
            [ModelProvider.GEMINI]: 'gemini-2.5-flash-preview-05-20',
        },
        responseParser: (response: string) => {
            const match = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            return match ? match[0] : response.replace(/```\w*\n/g, '').replace(/```/g, '').trim();
        },
    },
    SEO_WRITER: {
        systemPrompt: fs.readFileSync(path.resolve(promptsDir, 'seo.md'), 'utf-8'),
        model: {
            [ModelProvider.OPENAI]: 'gpt-4o',
            [ModelProvider.ANTHROPIC]: 'claude-sonnet-4-0',
            [ModelProvider.GEMINI]: 'gemini-2.5-flash-preview-05-20',
        },
        responseParser: (response: string) => {
            const match = response.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            return match ? match[0] : response.replace(/```\w*\n/g, '').replace(/```/g, '').trim();
        },
    },
}

export interface LLMClient {
    complete(agent: Agent, prompt: string): Promise<{ text: string }>;
}