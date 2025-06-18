import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  Sequence,
  useVideoConfig,
  OffthreadVideo,
  useCurrentFrame,
  random,
} from "remotion";
import { useMemo } from "react";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/TitanOne";

import { Speaker, videoSchema, Viseme } from "../config/types";
import CodyImg from "../../public/assets/cody.png";
import parseSentences from "./text-parser";
import Text from "./Text";
import { Felippe } from "./Felippe";
import { getMimetypeFromFilename } from "../utils/get-mimetype-from-filename";
import { LoopableOffthreadVideo } from "./LoopableOffthreadVideo";

const { fontFamily } = loadFont();

export const Landscape: React.FC<z.infer<typeof videoSchema>> = ({ segments, background, audioSrc, visemes }) => {
  const { fps, durationInFrames } = useVideoConfig()
  const frame = useCurrentFrame();

  const blink = useMemo(() => {
    const starts: number[] = [];
    let f = Math.floor(2 * fps);
    let i = 0;

    while (f < durationInFrames) {
      const interval = 2 * random(`blink-${background.seed}-${i}`) * 3;
      starts.push(f);
      f += Math.floor(interval * fps);
      i++;
    }

    return starts;
  }, [background.seed, durationInFrames, fps]);

  const isBlinking = blink.some(s => frame >= s && frame < s + 3)

  return (
    <AbsoluteFill style={{ fontFamily }}>
      {background.video && (
        <OffthreadVideo
          src={staticFile(background.video.src)} 
          muted 
          startFrom={(background.video.initTime || 0) * fps}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      )}

      <Audio src={staticFile(audioSrc)} />

      {segments.map((segment, index) => {
        const { speaker, alignment, duration } = segment;
        const start = segments.slice(0, index).reduce((acc, currentItem) => {
          return acc + (currentItem.duration || 0);
        }, 0);
        const mediaType = segment.mediaSrc && getMimetypeFromFilename(segment.mediaSrc).type;

        const { viseme }  = visemes?.find(v => v.start * fps <= frame && v.end * fps > frame) || { viseme: undefined };

        const sentences = parseSentences(alignment)

        return (
          <Sequence key={index} from={Math.floor(start * fps)} durationInFrames={Math.ceil(duration * fps)}>
            {speaker === Speaker.Felippe && (
              <AbsoluteFill>
                <Felippe 
                  className="h-full absolute max-w-[50%] bottom-0 right-0"
                  eyesOpen={!isBlinking}
                  mouth={viseme as Viseme}
                />

                {sentences.map((sentence, i) => {
                  return (
                    <Sequence
                      key={`${index}-${i}`}
                      from={Math.ceil(sentence.start * fps)}
                      durationInFrames={Math.ceil((sentence.end - sentence.start) * fps)}
                    >
                      <AbsoluteFill className="absolute max-w-[60%] max-h-1/2 !bottom-0 !left-0 top-[unset] right-[unset] p-16">
                        <Text alignedWords={sentence.words} highlightColor="oklch(68.5% 0.169 237.323)" />
                      </AbsoluteFill>
                    </Sequence>
                  );
                })}

                {segment.mediaSrc && (
                  <AbsoluteFill className="absolute max-w-[60%] max-h-1/2 !top-0 !left-[0] p-8">
                    {mediaType === 'image' ? (
                      <Img
                        src={staticFile(segment.mediaSrc)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <LoopableOffthreadVideo
                        src={staticFile(segment.mediaSrc)}
                        muted
                        loop
                        className="w-full h-full object-contain"
                      />
                    )}
                  </AbsoluteFill>
                )}
              </AbsoluteFill>
            )}

            {speaker === Speaker.Cody && (
              <AbsoluteFill>
                <Img src={CodyImg} className="absolute top-0 left-0 max-w-[40%]" /> 

                {sentences.map((sentence, i) => {
                  return (
                    <Sequence
                      key={`${index}-${i}`}
                      from={Math.ceil(sentence.start * fps)}
                      durationInFrames={Math.ceil((sentence.end - sentence.start) * fps)}
                    >
                      <AbsoluteFill className="absolute max-w-[60%] max-h-1/2 !bottom-0 !right-0 top-[unset] left-[unset] p-16">
                        <Text alignedWords={sentence.words} highlightColor="oklch(76.9% 0.188 70.08)"/>
                      </AbsoluteFill>
                    </Sequence>
                  )
                })}

                {segment.mediaSrc && (
                  <AbsoluteFill className="absolute max-w-[60%] max-h-1/2 !top-0 !right-0 !left-[unset] p-4">
                    {mediaType === 'image' ? (
                      <Img
                        src={staticFile(segment.mediaSrc)}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <LoopableOffthreadVideo
                        src={staticFile(segment.mediaSrc)}
                        muted
                        loop
                        className="w-full h-full object-contain"
                      />
                    )}
                  </AbsoluteFill>
                )}
              </AbsoluteFill>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
