import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import { loadFont } from "@remotion/google-fonts/TitanOne";

import { Speaker, videoSchema } from "../config/types";
import FelippeImg from "../../public/assets/felippe.png";
import CodyImg from "../../public/assets/cody.png";
import parseSentences from "./text-parser";
import Text from "./Text";
import { getMimetypeFromFilename } from "../utils/get-mimetype-from-filename";
import { LoopableOffthreadVideo } from "./LoopableOffthreadVideo";

const { fontFamily } = loadFont();

export const Portrait: React.FC<z.infer<typeof videoSchema>> = ({ segments, background, audioSrc }) => {
  const { fps } = useVideoConfig()

  return (
    <AbsoluteFill style={{ backgroundColor: background.color, fontFamily }}>
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
        const { duration, alignment, speaker } = segment;
        const start = segments.slice(0, index).reduce((acc, currentItem) => {
          return acc + (currentItem.duration || 0);
        }, 0);
        const mediaType = segment.mediaSrc && getMimetypeFromFilename(segment.mediaSrc).type;

        console.log(`Is media an image for segment ${index}:`, mediaType, segment.mediaSrc);

        const sentences = parseSentences(alignment)

        return (
          <Sequence key={index} from={Math.floor(start * fps)} durationInFrames={Math.ceil(duration * fps)}>
            {speaker === Speaker.Felippe && (
              <AbsoluteFill>
                <Img src={FelippeImg} className="absolute bottom-0 right-0 max-w-[50%]" />

                {sentences.map((sentence, i) => {
                  return (
                    <Sequence
                      key={`${index}-${i}`}
                      from={Math.floor(sentence.start * fps)}
                      durationInFrames={Math.floor((sentence.end - sentence.start) * fps)}
                    >
                      <AbsoluteFill className="absolute max-w-full max-h-1/3 bottom-[unset] right-[unset] top-1/3 left-[unset] p-16">
                        <Text alignedWords={sentence.words} highlightColor="oklch(68.5% 0.169 237.323)" />
                      </AbsoluteFill>
                    </Sequence>
                  );
                })}
              </AbsoluteFill>
            )}

            {speaker === Speaker.Cody && (
              <AbsoluteFill>
                <Img src={CodyImg} className="absolute bottom-0 left-0 max-w-[50%]" /> 

                {sentences.map((sentence, i) => {
                  return (
                    <Sequence
                      key={`${index}-${i}`}
                      from={Math.floor(sentence.start * fps)}
                      durationInFrames={Math.floor((sentence.end - sentence.start) * fps)}
                    >
                      <AbsoluteFill className="absolute max-w-full max-h-1/3 bottom-[unset] right-[unset] top-1/3 left-[unset] p-16">
                        <Text alignedWords={sentence.words} highlightColor="oklch(76.9% 0.188 70.08)"/>
                      </AbsoluteFill>
                    </Sequence>
                  )
                })}
              </AbsoluteFill>
            )}

            {segment.mediaSrc && (
              <AbsoluteFill className="absolute max-w-full max-h-1/3 !top-0 !right-[unset] !left-[unset] p-4">
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
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
