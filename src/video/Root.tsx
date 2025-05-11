import "./index.css";

import { Composition, random, staticFile } from "remotion";
import { z } from "zod";

import { Landscape } from "./Landscape";
import { videoSchema } from "../config/types";
import { Portrait } from "./Portrait";

const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Landscape"
        component={Landscape}
        durationInFrames={1}
        fps={FPS}
        width={1920}
        height={1080}
        schema={videoSchema}
        defaultProps={{
          script: [],
          background: {
            color: "oklch(70.8% 0 0)",
            video: {
              src: "assets/parkour.mp4",
            }
          }
        }}
        calculateMetadata={async ({ props }) => {
          const script = await fetch(staticFile("script.json")).then((res) => res.json()) as z.infer<typeof videoSchema>["script"];

          const duration = script.reduce((acc, item) => {
            return acc + item.duration!
          }, 0);

          if (props.background.video && !props.background.video.initTime) {
            const video = await fetch(staticFile(props.background.video.src)).then((res) => res.blob());
            const videoDuration = await new Promise<number>((resolve) => {
              const videoElement = document.createElement("video");
              videoElement.src = URL.createObjectURL(video);
              videoElement.onloadedmetadata = () => {
                resolve(videoElement.duration);
              };
            });

            const videoNeedsToBeginAtMax = Math.max(0, videoDuration - duration);
            const randomOffset = random(script[0].text) * videoNeedsToBeginAtMax;
            props.background.video.initTime = randomOffset;
          }

          return {
            durationInFrames: Math.ceil(duration * FPS),
            props: {
              ...props,
              script: script,
            }
          };
        }}
      />
      <Composition
        id="Portrait"
        component={Portrait}
        durationInFrames={1}
        fps={FPS}
        width={1080}
        height={1920}
        schema={videoSchema}
        defaultProps={{
          script: [],
          background: {
            color: "oklch(70.8% 0 0)",
            video: {
              src: "assets/parkour.mp4",
            }
          }
        }}
        calculateMetadata={async ({ props }) => {
          const script = await fetch(staticFile("script.json")).then((res) => res.json()) as z.infer<typeof videoSchema>["script"];

          const duration = script.reduce((acc, item) => {
            return acc + item.duration!
          }, 0);

          return {
            durationInFrames: Math.ceil(duration * FPS),
            props: {
              ...props,
              script: script,
            }
          };
        }}
      />
    </>
  );
};
