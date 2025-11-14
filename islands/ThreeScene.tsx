import "@/shims/preact-reconciler.ts";
import "@/shims/custom-elements.ts";
import "@/shims/dom.ts";
import type { ThreeElements } from "@react-three/fiber";
import { createRoot, extend, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "preact/compat";
import * as THREE from "three";
import { IS_BROWSER } from "fresh/runtime";

extend({
  Mesh: THREE.Mesh,
  BoxGeometry: THREE.BoxGeometry,
  MeshStandardMaterial: THREE.MeshStandardMaterial,
  AmbientLight: THREE.AmbientLight,
  SpotLight: THREE.SpotLight,
  PointLight: THREE.PointLight,
});

function Box(props: ThreeElements["mesh"]) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((_, delta) => {
    ref.current?.rotateX(delta);
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
}

function Scene() {
  return (
    <>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Box position={[-1.2, 0, 0]} />
      <Box position={[1.2, 0, 0]} />
    </>
  );
}

type FiberRenderElement = Parameters<
  ReturnType<typeof createRoot>["render"]
>[0];

export default function ThreeScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rootRef = useRef<ReturnType<typeof createRoot>>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const root = createRoot(canvas);
    rootRef.current = root;

    (async () => {
      await root.configure({
        camera: { position: [3, 3, 3], fov: 60 },
      });
      const content = <Scene /> as FiberRenderElement;
      root.render(content);
    })();

    return () => {
      root.unmount();
      rootRef.current = undefined;
    };
  }, []);

  if (!IS_BROWSER) return <div></div>;

  return <canvas ref={canvasRef} class="w-full h-[400px]" />;
}
