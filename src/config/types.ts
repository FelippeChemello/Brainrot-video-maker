import { zColor } from "@remotion/zod-types";
import { z } from "zod";

export enum Speaker {
    Cody = 'Cody',
    Felippe = 'Felippe'
}

export type Script = Array<{
    text: string;
    speaker: Speaker;
    image_description?: string;
} & {
    audioFileName?: string;
    duration?: number;
    alignment?: Array<{
        start: number;
        end: number;
        text: string;
    }>
} & {
    imageSrc?: string;
}>;

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
  script: z.array(z.object({
    text: z.string(),
    speaker: z.nativeEnum(Speaker),
    audioFileName: z.string(),
    duration: z.number(),
    alignment: z.array(z.object({
      start: z.number(),
      end: z.number(),
      text: z.string(),
    })),
    imageSrc: z.string().optional(),
  }))
});