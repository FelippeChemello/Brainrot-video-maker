import {z} from 'zod';

const envSchema = z.object({
    NODE_ENV: z.string().default('development'),
    
    GEMINI_API_KEY: z.string(),
    
    AENEAS_BASE_URL: z.string(),
    AENEAS_API_KEY: z.string(),
    
    OPENAI_API_KEY: z.string(),

    ANTHROPIC_API_KEY: z.string(),
    
    NOTION_TOKEN: z.string(),
    NOTION_DATABASE_ID: z.string(),

    ELEVENLABS_API_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const ENV = envSchema.parse(process.env);