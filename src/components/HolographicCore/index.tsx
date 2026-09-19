import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import type { AssistantMode } from '../../types'

type CoreProps = { mode: AssistantMode; audioLevel: number }

const modeProfile: Record<AssistantMode, { speed: number; pulse: number; glow: number; drift: number }> = {
  IDLE: { speed: 0.22, pulse: 0.04, glow: 3.2, drift: 0.015 },
  LISTENING: { speed: 1.15, pulse: 0.12, glow: 6, drift: -0.11 },
  THINKING: { speed: 1.75, pulse: 0.08, glow: 5.2, drift: 0.05 },
  SPEAKING: { speed: 0.82, pulse: 0.26, glow: 8, drift: 0.02 },
  EXECUTING: { speed: 2.4, pulse: 0.18, glow: 11, drift: 0.08 },
  ERROR: { speed: 0.1, pulse: 0.02, glow: 1.2, drift: 0 },
}

function makeSphereParticles(count: number) {
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count * 4)
  for (let i = 0; i < count; i += 1) {
    const u = Math.random() * 2 - 1; const theta = Math.random() * Math.PI * 2
    const shell = 0.82 + Math.pow(Math.random(), 2.7) * 1.08
    const radial = Math.sqrt(1 - u * u)
    positions[i * 3] = Math.cos(theta) * radial * shell
    positions[i * 3 + 1] = u * shell
    positions[i * 3 + 2] = Math.sin(theta) * radial * shell
    seeds.set([theta, u, shell, Math.random() * Math.PI * 2], i * 4)
  }
  return { positions, seeds }
}

function ParticleShell({ mode, audioLevel }: CoreProps) {
  const points = useRef<THREE.Points>(null)
  const { positions, seeds } = useMemo(() => makeSphereParticles(4800), [])
  useFrame(({ clock }) => {
    const profile = modeProfile[mode]; const attribute = points.current?.geometry.getAttribute('position') as THREE.BufferAttribute | undefined
    if (!points.current || !attribute) return
    const target = 1 + profile.drift + audioLevel * (mode === 'SPEAKING' ? 0.44 : 0.18)
    for (let i = 0; i < 4800; i += 1) {
      const n = i * 3; const s = i * 4
      const wave = Math.sin(clock.elapsedTime * (1.3 + seeds[s + 3]) + seeds[s]) * .035
      const radius = seeds[s + 2] * (target + wave)
      const radial = Math.sqrt(1 - seeds[s + 1] * seeds[s + 1])
      attribute.array[n] = Math.cos(seeds[s] + clock.elapsedTime * .03) * radial * radius
      attribute.array[n + 1] = seeds[s + 1] * radius
      attribute.array[n + 2] = Math.sin(seeds[s] + clock.elapsedTime * .03) * radial * radius
    }
    attribute.needsUpdate = true
    points.current.rotation.y += .0011 * profile.speed
  })
  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#ffb13c" size={.017} transparent opacity={.9} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation /></points>
}

function DataFragments({ mode }: Pick<CoreProps, 'mode'>) {
  const group = useRef<THREE.Group>(null)
  const fragments = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    position: new THREE.Vector3().setFromSphericalCoords(2.15 + (i % 5) * .1, Math.acos(1 - 2 * ((i * 17 % 40) / 40)), i * 2.4), rotation: [i, i * .6, i * .21] as [number, number, number], scale: .018 + (i % 3) * .01,
  })), [])
  useFrame(({ clock }) => { if (group.current) { group.current.rotation.y = clock.elapsedTime * .12 * modeProfile[mode].speed; group.current.rotation.z = Math.sin(clock.elapsedTime * .3) * .1 } })
  return <group ref={group}>{fragments.map((f, i) => <mesh key={i} position={f.position} rotation={f.rotation} scale={f.scale}><boxGeometry args={[1, 3.2, .22]} /><meshBasicMaterial color={i % 4 === 0 ? '#fff1be' : '#cf6816'} transparent opacity={.7} /></mesh>)}</group>
}

function NeuralScene({ mode, audioLevel }: CoreProps) {
  const assembly = useRef<THREE.Group>(null); const rings = useRef<THREE.Group>(null); const core = useRef<THREE.Mesh>(null)
  const { pointer } = useThree()
  useFrame(({ clock }) => {
    const profile = modeProfile[mode]; const voicePulse = audioLevel * (mode === 'SPEAKING' ? .42 : .15); const breathing = Math.sin(clock.elapsedTime * 2.1) * profile.pulse
    if (assembly.current) { assembly.current.rotation.y = THREE.MathUtils.lerp(assembly.current.rotation.y, pointer.x * .26, .025); assembly.current.rotation.x = THREE.MathUtils.lerp(assembly.current.rotation.x, -pointer.y * .2, .025) }
    if (rings.current) { rings.current.rotation.z -= .007 * profile.speed; rings.current.rotation.y += .003 * profile.speed }
    if (core.current) { const scale = 1 + breathing + voicePulse; core.current.scale.setScalar(scale) }
  })
  const profile = modeProfile[mode]
  return <group ref={assembly}><ParticleShell mode={mode} audioLevel={audioLevel} /><DataFragments mode={mode} /><group ref={rings}>
    {[1.05, 1.42, 1.86, 2.24].map((radius, index) => <mesh key={radius} rotation={[Math.PI / 2 + index * .43, index * .2, index * .63]}><torusGeometry args={[radius, index === 3 ? .008 : .014, 8, 120]} /><meshBasicMaterial color={index === 1 ? '#ffe2a2' : '#e9821f'} transparent opacity={index === 3 ? .25 : .72} blending={THREE.AdditiveBlending} /></mesh>)}
  </group><mesh ref={core}><sphereGeometry args={[.62, 48, 48]} /><meshBasicMaterial color="#ffb13c" transparent opacity={.32} blending={THREE.AdditiveBlending} /></mesh><mesh scale={1.28}><sphereGeometry args={[.62, 32, 32]} /><meshBasicMaterial color="#f07f15" wireframe transparent opacity={.16} /></mesh><pointLight color="#ff9a25" intensity={profile.glow + audioLevel * 10} distance={8} /><ambientLight color="#a54b14" intensity={.35} /></group>
}

export default function HolographicCore({ mode, audioLevel }: CoreProps) {
  return <div className={`core mode-${mode.toLowerCase()}`}><div className="core-label">NEURAL CORE <b>{mode}</b><span>{Math.round(audioLevel * 100)} dB</span></div><Canvas camera={{ position: [0, 0, 5.8], fov: 44 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}><NeuralScene mode={mode} audioLevel={audioLevel} /></Canvas><div className="crosshair" /><div className="scan" /></div>
}
