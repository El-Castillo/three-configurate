import * as THREE from 'three'
import { useEffect, useRef, useState } from 'react'
import type { ComponentProps, JSX, ReactNode } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import type { ReactThreeFiber } from '@react-three/fiber'
import { useCursor, MeshPortalMaterial, CameraControls, Gltf, Text, Preload } from '@react-three/drei'
import { useRoute, useLocation } from 'wouter'
import { easing } from 'maath'
import { RoundedPlaneGeometry } from 'maath/geometry'
import type CameraControlsImpl from 'camera-controls'

extend({ RoundedPlaneGeometry })

declare module '@react-three/fiber' {
  interface ThreeElements {
    roundedPlaneGeometry: ReactThreeFiber.ThreeElement<typeof RoundedPlaneGeometry>
  }
}

type FrameProps = Omit<JSX.IntrinsicElements['group'], 'children'> & {
  itemId: string
  title: string
  author: string
  bg?: string
  width?: number
  height?: number
  children: ReactNode
}

type PortalDefinition = {
  id: string
  title: string
  author: string
  bg?: string
  framePosition?: JSX.IntrinsicElements['group']['position']
  frameRotation?: JSX.IntrinsicElements['group']['rotation']
  model: ComponentProps<typeof Gltf>
}

const getEventSource = (): HTMLElement | undefined => (typeof document !== 'undefined' ? document.getElementById('root') ?? undefined : undefined)

export default function App() {
  return (
    <Canvas flat camera={{ fov: 75, position: [0, 0, 20] }} eventSource={getEventSource()} eventPrefix="client">
      <color attach="background" args={['#f0f0f0']} />
      {portals.map(({ id, title, author, bg, framePosition, frameRotation, model }) => (
        <Frame key={id} itemId={id} title={title} author={author} bg={bg} position={framePosition} rotation={frameRotation}>
          <Gltf {...model} />
        </Frame>
      ))}
      <Rig />
      <Preload all />
    </Canvas>
  )
}

function Frame({ itemId, title, author, bg = '#f0f0f0', width = 1.61803398875, height = 1, children, ...props }: FrameProps) {
  const portal = useRef<any>(null)
  const [, setLocation] = useLocation()
  const [, params] = useRoute('/item/:id')
  const [hovered, hover] = useState(false)

  useCursor(hovered)
  useFrame((_, dt) => {
    if (!portal.current) return
    easing.damp(portal.current, 'blend', params?.id === itemId ? 1 : 0, 0.2, dt)
  })

  return (
    <group {...props}>
      <Text fontSize={0.3} anchorY="top" anchorX="left" lineHeight={0.8} position={[-0.375, 0.715, 0.01]} material-toneMapped={false}>
        {title}
      </Text>
      <Text fontSize={0.1} anchorX="right" position={[0.4, -0.659, 0.01]} material-toneMapped={false}>
        /{itemId}
      </Text>
      <Text fontSize={0.04} anchorX="right" position={[0.0, -0.677, 0.01]} material-toneMapped={false}>
        {author}
      </Text>
      <mesh name={itemId} onDoubleClick={(e) => (e.stopPropagation(), setLocation('/item/' + e.object.name))} onPointerOver={() => hover(true)} onPointerOut={() => hover(false)}>
        <roundedPlaneGeometry args={[width, height, 0.1]} />
        <MeshPortalMaterial ref={portal} events={params?.id === itemId} side={THREE.DoubleSide} blur={0} resolution={512}>
          <color attach="background" args={[bg]} />
          {children}
        </MeshPortalMaterial>
      </mesh>
    </group>
  )
}

type RigProps = {
  position?: THREE.Vector3
  focus?: THREE.Vector3
}

function Rig({ position = new THREE.Vector3(0, 0, 2), focus = new THREE.Vector3(0, 0, 0) }: RigProps) {
  const scene = useThree((state) => state.scene)
  const controls = useThree((state) => state.controls) as CameraControlsImpl | null
  const [, params] = useRoute('/item/:id')

  useEffect(() => {
    const active = params?.id ? scene.getObjectByName(params.id) : undefined
    if (active?.parent) {
      const parent = active.parent
      parent.localToWorld(position.set(0, 0.5, 0.25))
      parent.localToWorld(focus.set(0, 0, -2))
    }
    controls?.setLookAt(...position.toArray(), ...focus.toArray(), true)
  }, [controls, focus, params?.id, position, scene])

  return <CameraControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
}
const portals: PortalDefinition[] = [
  {
    id: '01',
    title: `pick\nles`,
    author: 'Omar Faruq Tawsif',
    bg: '#e4cdac',
    framePosition: [0, 1.25, 0],
    model: { src: 'pickles_3d_version_of_hyuna_lees_illustration-transformed.glb', scale: 8, position: [0, -0.7, -2] },
  },
  {
    id: '02',
    title: 'tea',
    author: 'Omar Faruq Tawsif',
    framePosition: [0, 0, 0],
    model: { src: 'fiesta_tea-transformed.glb', position: [0, -2, -3] },
  },
  {
    id: '03',
    title: 'still',
    author: 'Omar Faruq Tawsif',
    bg: '#d1d1ca',
    framePosition: [0, -1.25, 0],
    model: { src: 'still_life_based_on_heathers_artwork-transformed.glb', scale: 2, position: [0, -0.8, -4] },
  },
]
