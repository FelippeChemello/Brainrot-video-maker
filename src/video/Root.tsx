import "./index.css";

import { Composition, staticFile } from "remotion";
import { z } from "zod";

import { Landscape } from "./Landscape";
import { videoSchema } from "../config/types";

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
          backgroundColor: "#FFFFFF",
          backgroundVideoSrc: "assets/parkour.mp4",
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
      <Composition
        id="Portrait"
        component={Landscape}
        durationInFrames={1}
        fps={FPS}
        width={1080}
        height={1920}
        schema={videoSchema}
        defaultProps={{
          script: [],
          backgroundColor: "#FFFFFF",
        }}
      />
    </>
  );
};
