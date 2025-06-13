import {
  AbsoluteFill,
  Audio,
  Img,
  staticFile,
  Sequence,
  useVideoConfig,
  OffthreadVideo,
} from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/TitanOne";

import { Speaker, videoSchema } from "../config/types";
import FelippeImg from "../../public/assets/felippe.png";
import CodyImg from "../../public/assets/cody.png";
import parseSentences from "./text-parser";
import Text from "./Text";

const { fontFamily } = loadFont();

export const Landscape: React.FC<z.infer<typeof videoSchema>> = ({ segments, background, audioSrc }) => {
  const { fps } = useVideoConfig()

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

        const sentences = parseSentences(alignment)

        return (
          <Sequence key={index} from={Math.floor(start * fps)} durationInFrames={Math.ceil(duration * fps)}>
            {speaker === Speaker.Felippe && (
              <AbsoluteFill>
                <Img src={FelippeImg} className="absolute bottom-0 right-0 max-w-[30%]" />

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
                    <Img
                      src={staticFile(segment.mediaSrc)}
                      className="w-full h-full object-contain"
                    />
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
                    <Img
                      src={staticFile(segment.mediaSrc)}
                      className="w-full h-full object-contain"
                    />
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
