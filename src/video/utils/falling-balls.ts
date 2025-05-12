import Matter from 'matter-js'
import { random } from 'remotion';

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsBody {
  id: string | number;
  position: Vector2D;
  angle: number;
  radius: number;
  isStatic: boolean;
  label: string;
}

export interface SimulationFrame {
  bodies: PhysicsBody[];
}

export interface SimulationConfig {
  width: number;
  height: number;
  duration: number;
  fps: number;
  gravity: Vector2D;
  seed: number | string;
}

export interface SimulationState {
  frames: SimulationFrame[];
}

export const createSimulation = ({
  duration,
  fps, 
  gravity,
  width,
  height,
  seed
}: SimulationConfig): SimulationState => {
  const engine = Matter.Engine.create({
    gravity,
  });

  const wallThickness = 20;
  const ballRadius = 20;
  const isLandscape = width >= height;

  // const ground = Matter.Bodies.rectangle(width / 2, height - (wallThickness / 2), width, wallThickness, {
  //   isStatic: true,
  //   label: 'ground'
  // });
  
  const leftWall = Matter.Bodies.rectangle(wallThickness / 2, height / 2, wallThickness, height, {
    isStatic: true,
    label: 'wall'
  });
  
  const rightWall = Matter.Bodies.rectangle(width - (wallThickness / 2), height / 2, wallThickness, height, { 
    isStatic: true,
    label: 'wall',
  });

  
  let mainCircles: Matter.Body[];

  if (isLandscape) {
    mainCircles = [
      Matter.Bodies.circle(0, height * 5/6, width / 8 - ballRadius, {
        isStatic: true,
        restitution: 1.2,
        friction: 0.1,
        label: 'mainCircle'
      }),
      Matter.Bodies.circle(width * 1 / 4, height * 5/6, width / 8 - ballRadius, {
        isStatic: true,
        restitution: 1.2,
        friction: 0.1,
        label: 'mainCircle'
      }),
      Matter.Bodies.circle(width * 2 / 4, height * 5/6, width / 8 - ballRadius, {
        isStatic: true,
        restitution: 1.2,
        friction: 0.1,
        label: 'mainCircle'
      }),
      Matter.Bodies.circle(width * 3 / 4, height * 5/6, width / 8 - ballRadius, {
        isStatic: true,
        restitution: 1.2,
        friction: 0.1,
        label: 'mainCircle'
      }),
      Matter.Bodies.circle(width, height * 5/6, width / 8 - ballRadius, {
        isStatic: true,
        restitution: 1.2,
        friction: 0.1,
        label: 'mainCircle'
      }),
    ];
  } else {
    mainCircles = [
      Matter.Bodies.circle(width, height * 5/6, width / 2 - ballRadius * 1, {
        isStatic: true,
        restitution: 1.2,
        friction: 0.1,
        label: 'mainCircle'
      }),
      Matter.Bodies.circle(0, height * 5/6, width / 2 - ballRadius * 1, {
        isStatic: true,
        restitution: 1.2,
        friction: 0.1,
        label: 'mainCircle'
      }),
    ];
  }


  const smallCirclesBodies: Matter.Body[] = [];
  const numberOfSmallCircles = 8;
  const maxPlacementAttempts = 100; // Max attempts to find a non-overlapping position

  for (let i = 0; i < numberOfSmallCircles; i++) {
    const radius = ballRadius;
    let x: number;
    let y: number;

    for (let attempt = 0; attempt < maxPlacementAttempts; attempt++) {
      console.log(`Attempting to place small circle ${i}, attempt ${attempt}`);

      // Use a unique seed for each attempt to get different random numbers
      x = random(`${seed}-small-${i}-x-${attempt}`) * width;
      y = random(`${seed}-small-${i}-y-${attempt}`) * (height / 4) + (height * 1 / 4) // Place in the 2nd quarter of the screen

      let overlapping = false;
      for (const existingCircle of smallCirclesBodies) {
        const dx = existingCircle.position.x - x;
        const dy = existingCircle.position.y - y;
        const distanceSquared = dx * dx + dy * dy;
        // Compare squared distance with squared sum of radii (2*radius)^2
        if (distanceSquared < (2 * radius) * (2 * radius)) {
          overlapping = true;
          break;
        }
      }

      if (!overlapping) {
        break;
      }
    }
    
    const newCircle = Matter.Bodies.circle(x!, y!, radius, {
      isStatic: true,
      label: 'decorative'
    });
    smallCirclesBodies.push(newCircle);
  }

  const staticBodies = [
    ...mainCircles, 
    ...smallCirclesBodies, 
    // ground, 
    leftWall, 
    rightWall
  ];
  Matter.World.add(engine.world, staticBodies);

  const balls = Array.from({ length: 30 }, (_, i) => {
    const x = random(`${seed}-ball-${i}-x`) * width;
    const startY = -ballRadius * i
    
    const ball = Matter.Bodies.circle(x, startY, ballRadius, {
      restitution: 1.02,
      friction: 0.01,   
      density: 0.01,    
      label: 'ball',
      frictionAir: 0.001
    });

    return ball;
  });

  Matter.World.add(engine.world, balls);

  const frames: SimulationFrame[] = [];
  const totalFrames = duration * fps;
  
  const timeStep = 1 / fps; // Time step in seconds
  const subSteps = 4; // Number of physics sub-steps per frame
  const subTimeStep = timeStep / subSteps; // Time step for each sub-step

  for (let i = 0; i < totalFrames; i++) {
    // Perform multiple physics updates per frame for better accuracy
    for (let j = 0; j < subSteps; j++) {
      Matter.Engine.update(engine, subTimeStep);
    }

    const bodies: PhysicsBody[] = [...staticBodies, ...balls].map(body => ({
      id: body.id,
      position: { x: body.position.x, y: body.position.y },
      angle: body.angle,
      // @ts-expect-error Circle type is incorrect
      radius: (body as Matter.Bodies.Circle).circleRadius || 0,
      isStatic: body.isStatic,
      label: body.label
    }));

    frames.push({ bodies });
  }

  return { frames };
};
