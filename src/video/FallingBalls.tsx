import { zColor } from "@remotion/zod-types";
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { createSimulation } from "./utils/falling-balls";

export const fallingBallsSchema = z.object({
  backgroundColor: zColor(),
  ballColor: zColor(),
  obstacleColor: zColor(),
  seed: z.union([z.string(), z.number()])
});

export const FallingBalls: React.FC<z.infer<typeof fallingBallsSchema>> = ({
  backgroundColor, 
  obstacleColor,
  ballColor,
  seed,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const simulation = useMemo(() => createSimulation({
    width,
    height,
    fps,
    duration: durationInFrames / fps,
    gravity: { x: 0, y: 9.8 * 10000 * 2},
    seed,
  }), [width, height, fps, durationInFrames, seed]);

  const simulationFrame = simulation.frames[frame];

  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {simulationFrame.bodies.map((body) => (
        <div
          key={body.id}
          style={{
            position: 'absolute',
            left: body.position.x,
            top: body.position.y,
            width: body.radius * 2,
            height: body.radius * 2,
            backgroundColor: body.label === 'ball' ? ballColor : obstacleColor,
            borderRadius: '50%',
            transform: `translate(-50%, -50%) rotate(${body.angle}rad)`,
          }}
        />
      ))}
    </AbsoluteFill>
  );
}