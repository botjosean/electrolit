import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useMission } from '../engine/store';
import type { Placement, Speaker } from '../engine/types';

interface Look {
  shirt: string;
  pants: string;
  skin: string;
  hat: string;
  vest: boolean;
  hair: string;
  ponytail: boolean;
  mustache: boolean;
  belt: boolean;
}

const LOOKS: Record<Speaker, Look> = {
  foreman: { shirt: '#3a5a8c', pants: '#2c3e5c', skin: '#e0ac86', hat: '#f5f5f0', vest: true, hair: '#6b4a2b', ponytail: false, mustache: true, belt: false },
  instructor: { shirt: '#8c3a3a', pants: '#34495e', skin: '#b98262', hat: '#1d6fd8', vest: false, hair: '#1e140c', ponytail: true, mustache: false, belt: true },
};

function Person({ who, place }: { who: Speaker; place: Placement }) {
  const look = LOOKS[who];
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const speaking = useMission((s) => s.status === 'playing' && s.mission?.steps[s.stepIndex]?.speaker === who);
  const tmp = new THREE.Vector3();

  useFrame(({ camera, clock }, dt) => {
    const g = root.current;
    if (!g) return;
    const time = clock.elapsedTime;
    // turn (yaw only) toward the camera
    g.getWorldPosition(tmp);
    const target = Math.atan2(camera.position.x - tmp.x, camera.position.z - tmp.z);
    let d = target - g.rotation.y;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    g.rotation.y += d * Math.min(1, dt * 2.5);
    g.position.y = place.pos[1] + Math.sin(time * 1.6) * 0.004;
    if (head.current) {
      head.current.rotation.x = speaking ? Math.sin(time * 7) * 0.06 : Math.sin(time * 0.7) * 0.02;
      head.current.rotation.y = speaking ? Math.sin(time * 2.1) * 0.12 : 0;
    }
    if (armR.current) {
      const aim = speaking ? -0.9 + Math.sin(time * 3.2) * 0.35 : -0.05;
      armR.current.rotation.x += (aim - armR.current.rotation.x) * Math.min(1, dt * 5);
    }
  });

  const cloth = (c: string) => <meshStandardMaterial color={c} roughness={0.9} />;
  return (
    <group ref={root} position={place.pos} rotation={[0, place.rot ?? 0, 0]} name={`char:${who}`}>
      {/* legs */}
      {[-0.1, 0.1].map((x) => (
        <group key={x}>
          <mesh castShadow position={[x, 0.45, 0]}>
            <boxGeometry args={[0.15, 0.8, 0.17]} />
            {cloth(look.pants)}
          </mesh>
          <mesh castShadow position={[x, 0.05, 0.03]}>
            <boxGeometry args={[0.16, 0.1, 0.26]} />
            {cloth('#4a2f1a')}
          </mesh>
        </group>
      ))}
      {/* torso */}
      <mesh castShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[0.46, 0.62, 0.26]} />
        {cloth(look.shirt)}
      </mesh>
      {look.vest ? (
        <group>
          <mesh castShadow position={[0, 1.13, 0]}>
            <boxGeometry args={[0.48, 0.5, 0.28]} />
            {cloth('#c6f21b')}
          </mesh>
          {[1.0, 1.2].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <boxGeometry args={[0.485, 0.04, 0.285]} />
              <meshStandardMaterial color="#e6e6e6" metalness={0.6} roughness={0.25} />
            </mesh>
          ))}
        </group>
      ) : null}
      {look.belt ? (
        <group>
          <mesh castShadow position={[0, 0.86, 0]}>
            <boxGeometry args={[0.48, 0.07, 0.28]} />
            {cloth('#3b2412')}
          </mesh>
          <mesh castShadow position={[0.2, 0.78, 0.08]}>
            <boxGeometry args={[0.1, 0.18, 0.14]} />
            {cloth('#6b4a2b')}
          </mesh>
        </group>
      ) : null}
      {/* arms */}
      <group position={[-0.29, 1.4, 0]} rotation={[0, 0, 0.08]}>
        <mesh castShadow position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.06, 0.45, 3, 8]} />
          {cloth(look.shirt)}
        </mesh>
        <mesh castShadow position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          {cloth(look.skin)}
        </mesh>
      </group>
      <group ref={armR} position={[0.29, 1.4, 0]} rotation={[0, 0, -0.08]}>
        <mesh castShadow position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.06, 0.45, 3, 8]} />
          {cloth(look.shirt)}
        </mesh>
        <mesh castShadow position={[0, -0.6, 0]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          {cloth(look.skin)}
        </mesh>
      </group>
      {/* head */}
      <group ref={head} position={[0, 1.6, 0]}>
        <mesh castShadow position={[0, -0.08, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.1, 8]} />
          {cloth(look.skin)}
        </mesh>
        <mesh castShadow position={[0, 0.07, 0]}>
          <icosahedronGeometry args={[0.13, 1]} />
          <meshStandardMaterial color={look.skin} roughness={0.8} flatShading />
        </mesh>
        {[-0.045, 0.045].map((x) => (
          <mesh key={x} position={[x, 0.09, 0.118]}>
            <sphereGeometry args={[0.014, 6, 6]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        ))}
        {look.mustache ? (
          <mesh position={[0, 0.03, 0.122]}>
            <boxGeometry args={[0.09, 0.02, 0.02]} />
            <meshStandardMaterial color={look.hair} />
          </mesh>
        ) : null}
        {look.ponytail ? (
          <mesh castShadow position={[0, 0.02, -0.14]} rotation={[0.4, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.14, 3, 6]} />
            <meshStandardMaterial color={look.hair} />
          </mesh>
        ) : null}
        {/* hard hat */}
        <mesh castShadow position={[0, 0.13, 0]} scale={[1, 0.85, 1.1]}>
          <sphereGeometry args={[0.145, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={look.hat} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.13, 0.03]} scale={[1, 1, 1.25]}>
          <cylinderGeometry args={[0.155, 0.16, 0.012, 14]} />
          <meshStandardMaterial color={look.hat} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export function Characters() {
  const chars = useMission((s) => s.mission?.characters);
  if (!chars) return null;
  return (
    <>
      {(Object.keys(chars) as Speaker[]).map((who) => {
        const p = chars[who];
        return p ? <Person key={who} who={who} place={p} /> : null;
      })}
    </>
  );
}
