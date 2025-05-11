import {z} from 'zod';

const envSchema = z.object({
    NODE_ENV: z.string().default('development'),
    
    GEMINI_API_KEY: z.string(),
    
    IMAGE_GENERATOR_URL: z.string(),
    IMAGE_GENERATOR_API_KEY: z.string(),
    
    AZURE_TTS_KEY: z.string(),
    AZURE_TTS_REGION: z.string(),
    
    AENEAS_BASE_URL: z.string(),
    AENEAS_API_KEY: z.string(),
    
    OPENAI_API_KEY: z.string(),
    
    GOOGLE_SPREADSHEET_ID: z.string(),
    GOOGLE_PRIVATE_KEY: z.string(),
    GOOGLE_CLIENT_EMAIL: z.string(),
    
    NOTION_TOKEN: z.string(),
    NOTION_DATABASE_ID: z.string(),

    ELEVENLABS_API_KEY: z.string(),

    GROK_API_KEY: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const ENV = envSchema.parse(process.env);