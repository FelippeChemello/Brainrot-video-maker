import { Gif } from "@remotion/gif";
import React from "react";
import {AbsoluteFill, staticFile, useVideoConfig} from "remotion";

export const WrinkledPaper: React.FC = () => {
  const {width, height} = useVideoConfig();

  return (
    <AbsoluteFill>
      <Gif
        src={staticFile("assets/wrinkled-paper.gif")}
        fit="cover"
        width={width}
        height={height}
        loopBehavior="loop"
        playbackRate={0.25}
        style={{
          filter: "hue-rotate(160deg) saturate(2) contrast(1.1)",
        }}
      />
      <AbsoluteFill
        className="pointer-events-none bg-stone-950/50"
        style={{
          mixBlendMode: "multiply",
        }}
      />
    </AbsoluteFill>
  )
};
