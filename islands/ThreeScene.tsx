/// <reference path="../types/react-three-fiber/index.d.ts" />
import type { ThreeElements } from "@react-three/fiber";
import { useSignal, useSignalEffect } from "@preact/signals";
import { useSignalRef } from "@preact/signals/utils";
import { IS_BROWSER } from "fresh/runtime";
import * as THREE from "three";

export default function ThreeScene() {
  const canvasRef = useSignalRef<HTMLCanvasElement | null>(null);
  const ready = useSignal(false);

  useSignalEffect(() => {
    if (!IS_BROWSER) {
      return;
    }

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const [{ createRoot, extend, useFrame, events }, compat] = await Promise
          .all([
            import("@react-three/fiber"),
            import("preact/compat"),
          ]);
        if (disposed || !canvasRef.current) {
          return;
        }

        const { useRef: useCompatRef, useState: useCompatState } = compat;

        extend({
          Mesh: THREE.Mesh,
          BoxGeometry: THREE.BoxGeometry,
          MeshStandardMaterial: THREE.MeshStandardMaterial,
          AmbientLight: THREE.AmbientLight,
          SpotLight: THREE.SpotLight,
          PointLight: THREE.PointLight,
        });

        const Box = (props: ThreeElements["mesh"]) => {
          const ref = useCompatRef<THREE.Mesh>(null!);
          const [hovered, setHovered] = useCompatState(false);
          const [clicked, setClicked] = useCompatState(false);

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
        ready.value = true;

        cleanup = () => {
          ready.value = false;
          root.unmount();
        };
      } catch (error) {
        console.error("Failed to initialize @react-three/fiber root", error);
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  });

  if (!IS_BROWSER) {
    return (
      <div class="relative w-full h-[400px]">
        <canvas class="w-full h-full block" />
      </div>
    );
  }

  return (
    <div class="relative w-full h-[400px]">
      <canvas ref={canvasRef} class="w-full h-full block" />
      {!ready.value && (
        <div class="absolute inset-0 flex items-center justify-center text-gray-500">
          Loading 3D scene...
        </div>
      )}
    </div>
  );
}
