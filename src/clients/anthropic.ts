 
import { Anthropic } from '@anthropic-ai/sdk';

import { ENV } from '../config/env';
import { Agents, LLMClient, Agent } from './interfaces/LLM';

const anthropic = new Anthropic({
    apiKey: ENV.ANTHROPIC_API_KEY,
});

export class AnthropicClient implements LLMClient {
    async complete(agent: Agent, prompt: string): Promise<{ text: string }> {
        console.log(`[ANTHROPIC] Running agent: ${agent}`);
        
        const response = await anthropic.messages.create({
            model: Agents[agent].model.anthropic,
            max_tokens: 4096,
            system: Agents[agent].systemPrompt,
            messages: [
                { role: 'user', content: prompt }
            ],
        })

        const text = response.content.find(c => c.type === 'text')?.text || '';
        const parsedResponse = Agents[agent].responseParser(text);

        return { text: parsedResponse };
    }
}