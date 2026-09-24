import { DARK_METAL, METAL, str, type PropProps } from './common';

// All hand tools lie flat on a surface, long axis along +X, origin at bottom center.

function Handles({ len, c1, c2, spread = 0.02, x0 = 0 }: { len: number; c1: string; c2: string; spread?: number; x0?: number }) {
  const ang = Math.atan2(spread, len);
  return (
    <>
      {[
        [c1, 1],
        [c2, -1],
      ].map(([c, s]) => (
        <mesh
          key={String(s)}
          castShadow
          position={[x0 - len / 2, 0.012, (Number(s) * spread) / 2]}
          rotation={[0, Number(s) * ang, Math.PI / 2]}
        >
          <capsuleGeometry args={[0.011, len, 3, 8]} />
          <meshStandardMaterial color={String(c)} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
}

export function LinemanPliers() {
  return (
    <group>
      <Handles len={0.14} c1="#1d4fbf" c2="#e0b400" spread={0.035} x0={-0.01} />
      <mesh castShadow position={[0.045, 0.012, 0]}>
        <boxGeometry args={[0.07, 0.018, 0.038]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.09, 0.012, 0]}>
        <boxGeometry args={[0.03, 0.016, 0.034]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.02, 0.024, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.004, 10]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} />
      </mesh>
    </group>
  );
}

export function NeedleNose() {
  return (
    <group>
      <Handles len={0.12} c1="#d42a2a" c2="#d42a2a" spread={0.03} x0={-0.01} />
      <mesh castShadow position={[0.03, 0.012, 0]}>
        <boxGeometry args={[0.03, 0.016, 0.03]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.085, 0.012, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.012, 0.09, 6]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function Dikes() {
  return (
    <group>
      <Handles len={0.11} c1="#e06a10" c2="#e06a10" spread={0.035} x0={-0.005} />
      <mesh castShadow position={[0.04, 0.012, 0]} rotation={[0, 0.35, 0]}>
        <boxGeometry args={[0.05, 0.016, 0.034]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.065, 0.012, 0.012]} rotation={[0, 0.35, 0]}>
        <coneGeometry args={[0.018, 0.03, 4]} />
        <meshStandardMaterial color={METAL} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

export function Strippers() {
  return (
    <group>
      <Handles len={0.1} c1="#e8c21a" c2="#c02020" spread={0.03} x0={-0.02} />
      <mesh castShadow position={[0.05, 0.01, 0]}>
        <boxGeometry args={[0.1, 0.012, 0.03]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[0.015 + i * 0.012, 0.0165, 0]}>
          <boxGeometry args={[0.004, 0.002, 0.03]} />
          <meshStandardMaterial color={i % 2 ? '#ddd' : '#111'} />
        </mesh>
      ))}
      <mesh position={[0.11, 0.01, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.012, 0.025, 4]} />
        <meshStandardMaterial color={METAL} metalness={0.8} />
      </mesh>
    </group>
  );
}

export function Screwdriver({ params }: PropProps) {
  const tip = str(params, 'tip', 'flat');
  const color = str(params, 'color', tip === 'flat' ? '#d42a2a' : '#1d4fbf');
  return (
    <group position={[0, 0.017, 0]}>
      <mesh castShadow position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.017, 0.015, 0.1, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[-0.105, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <sphereGeometry args={[0.016, 8, 6]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh castShadow position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.004, 0.004, 0.11, 6]} />
        <meshStandardMaterial color={METAL} metalness={0.85} roughness={0.25} />
      </mesh>
      {tip === 'flat' ? (
        <mesh castShadow position={[0.1, 0, 0]}>
          <boxGeometry args={[0.018, 0.002, 0.009]} />
          <meshStandardMaterial color={METAL} metalness={0.85} />
        </mesh>
      ) : (
        <mesh castShadow position={[0.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.005, 0.016, 4]} />
          <meshStandardMaterial color={METAL} metalness={0.85} />
        </mesh>
      )}
    </group>
  );
}

export function NonContactTester() {
  return (
    <group position={[0, 0.013, 0]}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.013, 0.013, 0.12, 10]} />
        <meshStandardMaterial color="#f2c500" roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0.075, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.012, 0.035, 10]} />
        <meshStandardMaterial color="#e9e9e9" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.045, 0.012, 0]}>
        <boxGeometry args={[0.012, 0.004, 0.008]} />
        <meshStandardMaterial color="#e03030" emissive="#e03030" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.02, 0.016, 0]}>
        <boxGeometry args={[0.06, 0.004, 0.006]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.065, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.013, 0.013, 0.012, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

export function Multimeter({ params }: PropProps) {
  const upright = str(params, 'pose', 'flat') === 'upright';
  const body = (
    <group>
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.1, 0.04, 0.18]} />
        <meshStandardMaterial color="#f2c500" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.041, 0.005]}>
        <boxGeometry args={[0.08, 0.004, 0.155]} />
        <meshStandardMaterial color="#303338" />
      </mesh>
      <mesh position={[0, 0.044, -0.045]}>
        <boxGeometry args={[0.065, 0.003, 0.04]} />
        <meshStandardMaterial color="#9fb89a" emissive="#9fb89a" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.046, 0.02]}>
        <cylinderGeometry args={[0.025, 0.025, 0.008, 16]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[0, 0.051, 0.008]}>
        <boxGeometry args={[0.006, 0.004, 0.028]} />
        <meshStandardMaterial color="#eee" />
      </mesh>
      {[
        [-0.022, '#c21d1d'],
        [0, '#111'],
        [0.022, '#c21d1d'],
      ].map(([x, c]) => (
        <mesh key={String(x)} position={[Number(x), 0.044, 0.068]}>
          <cylinderGeometry args={[0.005, 0.005, 0.004, 8]} />
          <meshStandardMaterial color={String(c)} />
        </mesh>
      ))}
    </group>
  );
  return upright ? <group rotation={[-Math.PI / 2 + 0.3, 0, 0]} position={[0, 0.09, 0]}>{body}</group> : body;
}

export function TapeMeasure() {
  return (
    <group>
      <mesh castShadow position={[0, 0.035, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.04, 14]} />
        <meshStandardMaterial color="#f2c500" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.035, 0]}>
        <boxGeometry args={[0.07, 0.07, 0.042]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.035, 0.022]}>
        <boxGeometry args={[0.055, 0.055, 0.004]} />
        <meshStandardMaterial color="#f2c500" />
      </mesh>
      <mesh position={[0.045, 0.004, 0]}>
        <boxGeometry args={[0.03, 0.004, 0.022]} />
        <meshStandardMaterial color="#f7e37a" metalness={0.3} />
      </mesh>
    </group>
  );
}

export function TorpedoLevel() {
  return (
    <group>
      <mesh castShadow position={[0, 0.013, 0]}>
        <boxGeometry args={[0.23, 0.026, 0.03]} />
        <meshStandardMaterial color="#e8b400" roughness={0.5} />
      </mesh>
      {[-0.07, 0, 0.07].map((x) => (
        <mesh key={x} position={[x, 0.027, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.006, 0.006, 0.03, 8]} />
          <meshStandardMaterial color="#7bf07b" transparent opacity={0.85} emissive="#3a3" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function FishTape() {
  return (
    <group>
      <mesh castShadow position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.06, 20]} />
        <meshStandardMaterial color="#1d4fbf" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.061, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.004, 14]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <mesh castShadow position={[-0.13, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.012, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0.17, 0.03, 0]}>
        <boxGeometry args={[0.1, 0.003, 0.006]} />
        <meshStandardMaterial color={METAL} metalness={0.9} />
      </mesh>
    </group>
  );
}

export function CableRipper() {
  return (
    <group>
      <mesh castShadow position={[0, 0.012, 0]}>
        <boxGeometry args={[0.1, 0.024, 0.03]} />
        <meshStandardMaterial color="#f07a10" roughness={0.6} />
      </mesh>
      <mesh position={[0.035, 0.026, 0]}>
        <torusGeometry args={[0.009, 0.003, 6, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[-0.02, 0.025, 0]}>
        <boxGeometry args={[0.04, 0.002, 0.02]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

export function UtilityKnife() {
  return (
    <group>
      <mesh castShadow position={[0, 0.013, 0]} scale={[1, 1, 0.7]}>
        <boxGeometry args={[0.14, 0.026, 0.035]} />
        <meshStandardMaterial color="#9aa3ab" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[-0.02, 0.027, 0]}>
        <boxGeometry args={[0.08, 0.003, 0.02]} />
        <meshStandardMaterial color="#f2c500" />
      </mesh>
      <mesh castShadow position={[0.08, 0.012, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.025, 0.012, 0.002]} />
        <meshStandardMaterial color="#e8e8e8" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

export function Hammer() {
  return (
    <group>
      <mesh castShadow position={[-0.03, 0.014, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.013, 0.015, 0.26, 8]} />
        <meshStandardMaterial color="#a0522d" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0.105, 0.014, 0]}>
        <boxGeometry args={[0.03, 0.028, 0.12]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.105, 0.014, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.017, 0.017, 0.03, 10]} />
        <meshStandardMaterial color={DARK_METAL} metalness={0.7} />
      </mesh>
    </group>
  );
}

export function ToolBag({ params }: PropProps) {
  const color = str(params, 'color', '#2d2d2d');
  const accent = str(params, 'accent', '#e06a10');
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.14, 0]}>
        <boxGeometry args={[0.48, 0.28, 0.26]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.281, 0]}>
        <boxGeometry args={[0.44, 0.004, 0.22]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[0, 0.1, s * 0.135]}>
          <boxGeometry args={[0.42, 0.14, 0.03]} />
          <meshStandardMaterial color={accent} roughness={0.9} />
        </mesh>
      ))}
      <mesh castShadow position={[0, 0.3, 0]}>
        <torusGeometry args={[0.14, 0.012, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* tool handles sticking out */}
      {[
        [-0.16, '#d42a2a'],
        [-0.1, '#1d4fbf'],
        [0.14, '#e8c21a'],
      ].map(([x, c]) => (
        <mesh key={String(x)} position={[Number(x), 0.32, 0.08]}>
          <cylinderGeometry args={[0.013, 0.013, 0.1, 8]} />
          <meshStandardMaterial color={String(c)} />
        </mesh>
      ))}
    </group>
  );
}

export function Drill() {
  return (
    <group>
      <mesh castShadow position={[0, 0.03, 0]}>
        <boxGeometry args={[0.18, 0.06, 0.06]} />
        <meshStandardMaterial color="#c8102e" />
      </mesh>
      <mesh castShadow position={[-0.03, 0.03, 0.1]}>
        <boxGeometry args={[0.045, 0.05, 0.14]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh castShadow position={[-0.03, 0.035, 0.18]}>
        <boxGeometry args={[0.08, 0.07, 0.06]} />
        <meshStandardMaterial color="#c8102e" />
      </mesh>
      <mesh position={[0.12, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.022, 0.05, 10]} />
        <meshStandardMaterial color="#333" metalness={0.5} />
      </mesh>
    </group>
  );
}
