import { useMemo } from 'react';
import * as THREE from 'three';
import { LabelPlane, METAL, num, str, usePropText, type PropProps } from './common';

export function FoldingTable({ params }: PropProps) {
  const w = num(params, 'w', 1.8);
  const d = num(params, 'd', 0.76);
  const h = num(params, 'h', 0.74);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h - 0.02, 0]}>
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial color={str(params, 'color', '#e9e6de')} roughness={0.8} />
      </mesh>
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} castShadow position={[(sx * (w - 0.1)) / 2, (h - 0.04) / 2, (sz * (d - 0.1)) / 2]}>
          <cylinderGeometry args={[0.015, 0.015, h - 0.04, 6]} />
          <meshStandardMaterial color="#555" metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function Workbench({ params }: PropProps) {
  const w = num(params, 'w', 2.2);
  const d = num(params, 'd', 0.8);
  const h = 0.9;
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h - 0.03, 0]}>
        <boxGeometry args={[w, 0.06, d]} />
        <meshStandardMaterial color="#b98b56" roughness={0.85} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <boxGeometry args={[w - 0.1, 0.03, d - 0.1]} />
        <meshStandardMaterial color="#a57a48" roughness={0.9} />
      </mesh>
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} castShadow position={[(sx * (w - 0.12)) / 2, (h - 0.06) / 2, (sz * (d - 0.12)) / 2]}>
          <boxGeometry args={[0.08, h - 0.06, 0.08]} />
          <meshStandardMaterial color="#8a6238" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export function Pegboard({ params }: PropProps) {
  const w = num(params, 'w', 2.2);
  const h = num(params, 'h', 1.0);
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const g = c.getContext('2d')!;
    g.fillStyle = '#c9a877';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#6b5236';
    for (let x = 8; x < 256; x += 16) for (let y = 8; y < 128; y += 16) g.fillRect(x - 1.5, y - 1.5, 3, 3);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(w * 2, h * 2);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [w, h]);
  return (
    <mesh receiveShadow position={[0, h / 2, 0]}>
      <boxGeometry args={[w, h, 0.02]} />
      <meshStandardMaterial map={tex} roughness={0.9} />
    </mesh>
  );
}

function Wheel({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.38, 0.38, 0.28, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[Math.sign(pos[0]) * 0.145, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.01, 12]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

/** Supply house box truck (delivery). */
export function BoxTruck({ params }: PropProps) {
  const color = str(params, 'color', '#f4f4f4');
  const text = usePropText(params);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 1.75, -0.6]}>
        <boxGeometry args={[2.3, 2.3, 4.6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {text ? <LabelPlane text={text} w={3.4} h={0.8} position={[1.156, 1.9, -0.6]} rotation={[0, Math.PI / 2, 0]} bg="#1d4fbf" fg="#ffffff" font={0.45} /> : null}
      <mesh castShadow position={[0, 1.15, 2.4]}>
        <boxGeometry args={[2.2, 1.5, 1.5]} />
        <meshStandardMaterial color="#c8102e" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.45, 3.16]}>
        <boxGeometry args={[1.9, 0.6, 0.02]} />
        <meshStandardMaterial color="#223" metalness={0.6} roughness={0.1} />
      </mesh>
      <mesh castShadow position={[0, 0.55, 0.9]}>
        <boxGeometry args={[2.0, 0.3, 7]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {[
        [-1, 2.3],
        [1, 2.3],
        [-1, -1.8],
        [1, -1.8],
      ].map(([sx, z]) => (
        <Wheel key={`${sx}${z}`} pos={[sx * 1.0, 0.38, z]} />
      ))}
    </group>
  );
}

export function Pickup({ params }: PropProps) {
  const color = str(params, 'color', '#e8e8e8');
  return (
    <group>
      <mesh castShadow position={[0, 0.85, 0.3]}>
        <boxGeometry args={[1.9, 0.7, 5.2]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 1.5, 0.7]}>
        <boxGeometry args={[1.8, 0.65, 1.8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.5, 1.61]}>
        <boxGeometry args={[1.6, 0.5, 0.02]} />
        <meshStandardMaterial color="#223" metalness={0.6} roughness={0.1} />
      </mesh>
      {/* ladder rack */}
      <mesh position={[0, 1.95, -1.1]}>
        <boxGeometry args={[1.9, 0.05, 0.05]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, 1.5, -1.1]}>
          <boxGeometry args={[0.05, 0.9, 0.05]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
      {[
        [-1, 2.0],
        [1, 2.0],
        [-1, -1.4],
        [1, -1.4],
      ].map(([sx, z]) => (
        <Wheel key={`${sx}${z}`} pos={[sx * 0.9, 0.38, z]} />
      ))}
    </group>
  );
}

/** Wood-framed house wall section: studs every 16" (0.406 m). */
export function StudWall({ params }: PropProps) {
  const len = num(params, 'len', 4);
  const h = num(params, 'h', 2.44);
  const sheath = num(params, 'sheath', 0);
  const n = Math.floor(len / 0.406) + 1;
  const wood = '#d9b77e';
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[len, 0.04, 0.09]} />
        <meshStandardMaterial color={wood} roughness={0.9} />
      </mesh>
      {[h - 0.06, h - 0.02].map((y) => (
        <mesh key={y} castShadow position={[0, y, 0]}>
          <boxGeometry args={[len, 0.04, 0.09]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {Array.from({ length: n }).map((_, i) => (
        <mesh key={i} castShadow receiveShadow position={[-len / 2 + 0.02 + i * ((len - 0.04) / (n - 1)), (h - 0.08) / 2 + 0.04, 0]}>
          <boxGeometry args={[0.04, h - 0.12, 0.09]} />
          <meshStandardMaterial color={wood} roughness={0.9} />
        </mesh>
      ))}
      {sheath > 0 ? (
        <mesh castShadow receiveShadow position={[-len / 2 + sheath / 2, h / 2, -0.055]}>
          <boxGeometry args={[sheath, h, 0.012]} />
          <meshStandardMaterial color="#c9a36a" roughness={1} />
        </mesh>
      ) : null}
    </group>
  );
}

export function Pallet() {
  return (
    <group>
      {[-0.45, 0, 0.45].map((z) => (
        <mesh key={z} castShadow position={[0, 0.045, z]}>
          <boxGeometry args={[1.2, 0.09, 0.09]} />
          <meshStandardMaterial color="#b08a5a" roughness={1} />
        </mesh>
      ))}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((x) => (
        <mesh key={x} castShadow receiveShadow position={[x, 0.1, 0]}>
          <boxGeometry args={[0.14, 0.02, 1.0]} />
          <meshStandardMaterial color="#c49a6c" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export function Cone() {
  return (
    <group>
      <mesh castShadow position={[0, 0.015, 0]}>
        <boxGeometry args={[0.36, 0.03, 0.36]} />
        <meshStandardMaterial color="#e2571e" />
      </mesh>
      <mesh castShadow position={[0, 0.36, 0]}>
        <coneGeometry args={[0.15, 0.68, 12]} />
        <meshStandardMaterial color="#f26a1b" />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.066, 0.083, 0.1, 12]} />
        <meshStandardMaterial color="#f4f4f4" />
      </mesh>
    </group>
  );
}

export function PortaJohn() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[1.1, 2.3, 1.1]} />
        <meshStandardMaterial color="#2f6fdb" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 2.35, 0]}>
        <boxGeometry args={[1.2, 0.1, 1.2]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <mesh position={[0, 1.1, 0.56]}>
        <boxGeometry args={[0.8, 1.9, 0.02]} />
        <meshStandardMaterial color="#285fc0" />
      </mesh>
    </group>
  );
}

export function Sawhorse() {
  return (
    <group>
      <mesh castShadow position={[0, 0.72, 0]}>
        <boxGeometry args={[1.0, 0.09, 0.04]} />
        <meshStandardMaterial color="#d9b77e" />
      </mesh>
      {[-0.4, 0.4].map((x) =>
        [-1, 1].map((s) => (
          <mesh key={`${x}${s}`} castShadow position={[x, 0.36, s * 0.12]} rotation={[s * 0.3, 0, 0]}>
            <boxGeometry args={[0.04, 0.75, 0.04]} />
            <meshStandardMaterial color="#d9b77e" />
          </mesh>
        )),
      )}
    </group>
  );
}

export function Shelf({ params }: PropProps) {
  const w = num(params, 'w', 1.5);
  return (
    <group>
      {[0.1, 0.6, 1.1, 1.6].map((y) => (
        <mesh key={y} castShadow receiveShadow position={[0, y, 0]}>
          <boxGeometry args={[w, 0.03, 0.5]} />
          <meshStandardMaterial color="#8d9399" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {[
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} castShadow position={[(sx * w) / 2, 0.85, sz * 0.24]}>
          <boxGeometry args={[0.03, 1.7, 0.03]} />
          <meshStandardMaterial color="#5a6066" metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

export function Dumpster() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[3.2, 1.4, 1.8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[3.0, 0.3, 1.6]} />
        <meshStandardMaterial color="#6b5236" roughness={1} />
      </mesh>
    </group>
  );
}

export function WoodStack() {
  return (
    <group>
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((i) => (
          <mesh key={`${row}${i}`} castShadow receiveShadow position={[0, 0.03 + row * 0.1, -0.24 + i * 0.12]}>
            <boxGeometry args={[2.44, 0.09, 0.1]} />
            <meshStandardMaterial color={row % 2 ? '#d9b77e' : '#cfa96f'} roughness={1} />
          </mesh>
        )),
      )}
    </group>
  );
}
