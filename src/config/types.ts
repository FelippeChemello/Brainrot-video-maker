import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export enum Speaker {
    Cody = 'Cody',
    Felippe = 'Felippe'
}

export enum ScriptStatus {
    NOT_READY = 'Not ready',
    READY = 'Ready',
    NOT_STARTED = 'Not started',
    IN_PROGRESS = 'In progress',
    DONE = 'Done',
    PUBLISHED = 'Published',
}

export type NotionMainDatabasePage = {
  id: string;
  created_time: string;
  properties: {
    Audio: {
      id: string;
      type: 'file';
      files: Array<{url: string, expiry_type: string}>;
    };
    Status: {
      id: string;
      type: 'status';
      status: { id: string, name: ScriptStatus, color: string };
    };
    Name: {
      id: string;
      type: 'title';
      title: Array<{ text: { content: string } }>;
    },
    Composition: {
      id: string;
      type: 'multi_select';
      multi_select: Array<{
        id: string;
        name: 'Portrait' | 'Landscape';
        color: string;
      }>;
    },
    Output: {
      id: string;
      type: 'files';
      files: Array<{ name: string, type: 'file' | 'file_upload' | 'external', file: { url: string, expiry_type: string }}>;
    };
  }
}

export type VideoBackground = {
    video?: {
      src: string;
      initTime?: number;
    };
    color?: string;
    mainColor?: string;
    secondaryColor?: string;
    seed?: string | number;
};

export type ScriptWithTitle = {
    title: string;
    segments: Script;
} & {
    id?: string;
    audioMimeType?: string;
    audioExtension?: string;
    audioSrc?: string;
    duration?: number;
    compositions?: Array<'Portrait' | 'Landscape'>;
    background?: VideoBackground;
    alignment?: Array<{
        start: number;
        end: number;
        text: string;
    }>;
}

export type Script = Array<{
    text: string;
    speaker: Speaker;
    image_description?: string;
} & {
    imageSrc?: string;
}>

export type AudioAlignerDTO = {
    audio: {
        filepath: string;
        mimeType: string;
    };
    text: string;
}

export type AudioAlignerResponse = {
    alignment: Array<{
        start: number;
        end: number;
        text: string;
    }>;
    duration: number;
}

export const videoSchema = z.object({
  background: z.object({
    video: z.object({
      src: z.string(),
      initTime: z.number().optional(),
    }).optional(),
    color: zColor(),
    mainColor: zColor(),
    secondaryColor: zColor(),
    seed: z.union([z.string(), z.number()]),
  }),
  segments: z.array(z.object({
    text: z.string(),
    speaker: z.nativeEnum(Speaker),
    imageSrc: z.string().optional(),
    duration: z.number(),
    alignment: z.array(z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
    })),
  })),
  alignment: z.array(z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
  })),
  duration: z.number(),
  audioSrc: z.string(),
});