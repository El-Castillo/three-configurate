/// <reference path="../types/react-three-fiber/index.d.ts" />
import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useRef, useState } from "preact/hooks";
import * as THREE from "three";

export default function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const mount = async () => {
      try {
        const { createRoot, extend, useFrame, events } = await import(
          "@react-three/fiber"
        );
        if (disposed || !canvasRef.current) {
          return;
        }

        extend({
          Mesh: THREE.Mesh,
          BoxGeometry: THREE.BoxGeometry,
          MeshStandardMaterial: THREE.MeshStandardMaterial,
          AmbientLight: THREE.AmbientLight,
          SpotLight: THREE.SpotLight,
          PointLight: THREE.PointLight,
        });

        const Box = (props: ThreeElements["mesh"]) => {
          const ref = useRef<THREE.Mesh>(null!);
          const [hovered, setHovered] = useState(false);
          const [clicked, setClicked] = useState(false);

          useFrame((_, delta) => {
            ref.current.rotation.x += delta;
          });

          return (
            <mesh
              {...props}
              ref={ref}
              scale={clicked ? 1.5 : 1}
              onClick={() => setClicked((value) => !value)}
              onPointerOver={() => setHovered(true)}
              onPointerOut={() => setHovered(false)}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
            </mesh>
          );
        };

        const Scene = () => (
          <>
            <ambientLight intensity={Math.PI / 2} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              decay={0}
              intensity={Math.PI}
            />
            <pointLight
              position={[-10, -10, -10]}
              decay={0}
              intensity={Math.PI}
            />
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} />
          </>
        );

        const root = createRoot(canvasRef.current);
        type RootRenderArg = Parameters<typeof root.render>[0];

        await root.configure({
          events,
          camera: { position: [3, 3, 3], fov: 60 },
        });
        const content = <Scene /> as RootRenderArg;
        root.render(content);
        setReady(true);

        cleanup = () => {
          setReady(false);
          root.unmount();
        };
      } catch (error) {
        console.error("Failed to initialize @react-three/fiber root", error);
      }
    };

    mount();
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div class="relative w-full h-[400px]">
      <canvas ref={canvasRef} class="w-full h-full block" />
      {!ready && (
        <div class="absolute inset-0 flex items-center justify-center text-gray-500">
          Loading 3D scene...
        </div>
      )}
    </div>
  );
}
