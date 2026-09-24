import { useMemo } from 'react';
import * as THREE from 'three';
import type { EnvKind } from '../../engine/types';
import { Carton } from '../props/materials';
import { Cone, Dumpster, PortaJohn, Shelf, StudWall, WoodStack } from '../props/site';

function noiseTexture(base: string, dots: string[], size = 256, repeat = 20, density = 0.08) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  g.fillStyle = base;
  g.fillRect(0, 0, size, size);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const n = size * size * density * 0.1;
  for (let i = 0; i < n; i++) {
    g.fillStyle = dots[Math.floor(rnd() * dots.length)];
    const r = rnd() * 2.2 + 0.4;
    g.fillRect(rnd() * size, rnd() * size, r, r);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Yard() {
  const dirt = useMemo(() => noiseTexture('#b89a72', ['#a3845d', '#c9ad86', '#8f7352', '#d8c1a0'], 256, 24, 0.5), []);
  const slab = useMemo(() => noiseTexture('#c8c6c0', ['#b9b7b0', '#d6d4ce', '#a9a7a0'], 256, 6, 0.3), []);
  return (
    <group>
      <color attach="background" args={['#a9cbe8']} />
      <fog attach="fog" args={['#c4dcef', 25, 70]} />
      <hemisphereLight args={['#dcecff', '#8a7456', 0.9]} />
      <directionalLight
        castShadow
        position={[6, 10, 5]}
        intensity={2.2}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[140, 140]} />
        <meshStandardMaterial map={dirt} roughness={1} />
      </mesh>
      {/* house slab + framing in the background */}
      <group position={[0, 0, -7]}>
        <mesh receiveShadow position={[0, 0.1, 0]}>
          <boxGeometry args={[10, 0.2, 7]} />
          <meshStandardMaterial map={slab} roughness={0.95} />
        </mesh>
        <group position={[0, 0.2, 3.3]}>
          <StudWall params={{ len: 4, sheath: 1.2 }} />
        </group>
        <group position={[-3.8, 0.2, 3.3]}>
          <StudWall params={{ len: 2.4, sheath: 2.4 }} />
        </group>
        <group position={[-4.95, 0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <StudWall params={{ len: 6.6, sheath: 3.6 }} />
        </group>
        <group position={[4.95, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <StudWall params={{ len: 6.6 }} />
        </group>
        <group position={[0, 0.2, -3.3]}>
          <StudWall params={{ len: 10, sheath: 10 }} />
        </group>
      </group>
      <group position={[9, 0, -3]} rotation={[0, -0.3, 0]}>
        <Dumpster />
      </group>
      <group position={[-9, 0, 1]}>
        <PortaJohn />
      </group>
      <group position={[7.5, 0, 3.5]} rotation={[0, 0.4, 0]}>
        <WoodStack />
      </group>
      {[
        [-3, 3.5],
        [3.4, 4],
        [-6, -2],
      ].map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <Cone />
        </group>
      ))}
    </group>
  );
}

function Garage() {
  const floor = useMemo(() => noiseTexture('#9c9a95', ['#8e8c86', '#a9a7a1', '#85837e'], 256, 8, 0.3), []);
  return (
    <group>
      <color attach="background" args={['#2a2d31']} />
      <hemisphereLight args={['#fff4e0', '#4a4640', 0.8]} />
      <directionalLight
        castShadow
        position={[2, 5, 4]}
        intensity={1.6}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
      />
      <pointLight position={[0, 2.6, 0.5]} intensity={6} distance={8} color="#fff6e8" />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial map={floor} roughness={0.9} />
      </mesh>
      {/* walls */}
      <mesh receiveShadow position={[0, 1.6, -2.2]}>
        <boxGeometry args={[12, 3.2, 0.1]} />
        <meshStandardMaterial color="#d8d3c8" roughness={1} />
      </mesh>
      <mesh receiveShadow position={[-5, 1.6, 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[9, 3.2, 0.1]} />
        <meshStandardMaterial color="#cfc9bd" roughness={1} />
      </mesh>
      <mesh receiveShadow position={[5, 1.6, 2]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[9, 3.2, 0.1]} />
        <meshStandardMaterial color="#cfc9bd" roughness={1} />
      </mesh>
      {/* shop lights */}
      {[-1.5, 1.5].map((x) => (
        <group key={x} position={[x, 2.9, 0]}>
          <mesh>
            <boxGeometry args={[1.2, 0.05, 0.15]} />
            <meshStandardMaterial color="#ffffff" emissive="#fffbe8" emissiveIntensity={1.5} />
          </mesh>
        </group>
      ))}
      <group position={[3.6, 0, -1.8]}>
        <Shelf params={{ w: 1.6 }} />
        <group position={[-0.4, 0.115, 0]}>
          <Carton params={{ w: 0.5, h: 0.35, d: 0.4 }} />
        </group>
        <group position={[0.35, 0.615, 0]}>
          <Carton params={{ w: 0.6, h: 0.3, d: 0.4 }} />
        </group>
        <group position={[-0.3, 1.115, 0]}>
          <Carton params={{ w: 0.5, h: 0.3, d: 0.4 }} />
        </group>
      </group>
    </group>
  );
}

export function Environment({ kind }: { kind: EnvKind }) {
  return kind === 'garage' ? <Garage /> : <Yard />;
}
