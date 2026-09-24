import { str, type PropProps } from './common';

export function HardHat({ params }: PropProps) {
  const color = str(params, 'color', '#f5f5f0');
  return (
    <group>
      <mesh castShadow position={[0, 0.012, 0]} scale={[1, 0.85, 1.12]}>
        <sphereGeometry args={[0.12, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.012, 0.02]} scale={[1, 1, 1.25]}>
        <cylinderGeometry args={[0.135, 0.14, 0.012, 16]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <mesh castShadow position={[0, 0.1, 0]}>
        <boxGeometry args={[0.03, 0.03, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      {/* suspension band visible underneath */}
      <mesh position={[0, 0.02, 0]}>
        <torusGeometry args={[0.1, 0.006, 6, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

export function BaseballCap({ params }: PropProps) {
  const color = str(params, 'color', '#b22234');
  return (
    <group>
      <mesh castShadow scale={[1, 0.7, 1]}>
        <sphereGeometry args={[0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.005, 0.12]} scale={[1, 1, 0.8]}>
        <cylinderGeometry args={[0.08, 0.08, 0.008, 12, 1, false, -Math.PI / 2, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.072, 0]}>
        <sphereGeometry args={[0.012, 8, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function SafetyGlasses() {
  return (
    <group position={[0, 0.03, 0]}>
      {[-0.045, 0.045].map((x) => (
        <mesh key={x} position={[x, 0, 0]} castShadow>
          <boxGeometry args={[0.075, 0.045, 0.006]} />
          <meshStandardMaterial color="#9fd3ff" transparent opacity={0.55} roughness={0.1} metalness={0.2} />
        </mesh>
      ))}
      <mesh position={[0, 0.024, 0]}>
        <boxGeometry args={[0.17, 0.008, 0.01]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {[-0.083, 0.083].map((x) => (
        <mesh key={x} position={[x, 0.018, -0.07]}>
          <boxGeometry args={[0.006, 0.01, 0.14]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
}

export function Vest() {
  return (
    <group>
      <mesh castShadow position={[0, 0.012, 0]}>
        <boxGeometry args={[0.42, 0.024, 0.48]} />
        <meshStandardMaterial color="#c6f21b" roughness={0.8} />
      </mesh>
      {/* neck V */}
      <mesh position={[0, 0.026, -0.19]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 3, Math.PI / 2 + Math.PI / 6]} />
        <meshStandardMaterial color="#6a7d12" />
      </mesh>
      {[-0.05, 0.1].map((z) => (
        <mesh key={z} position={[0, 0.026, z]}>
          <boxGeometry args={[0.42, 0.004, 0.035]} />
          <meshStandardMaterial color="#e8e8e8" metalness={0.6} roughness={0.25} />
        </mesh>
      ))}
      {[-0.1, 0.1].map((x) => (
        <mesh key={x} position={[x, 0.026, -0.1]}>
          <boxGeometry args={[0.035, 0.004, 0.2]} />
          <meshStandardMaterial color="#e8e8e8" metalness={0.6} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function Glove({ x, color, flip }: { x: number; color: string; flip?: boolean }) {
  return (
    <group position={[x, 0.012, 0]} rotation={[0, flip ? 0.25 : -0.25, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.085, 0.024, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 0, 0.075]}>
        <boxGeometry args={[0.09, 0.022, 0.06]} />
        <meshStandardMaterial color="#444" roughness={0.95} />
      </mesh>
      {[-0.03, -0.01, 0.01, 0.03].map((fx) => (
        <mesh key={fx} castShadow position={[fx, 0, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.009, 0.05, 3, 6]} />
          <meshStandardMaterial color={color} roughness={0.95} />
        </mesh>
      ))}
      <mesh castShadow position={[flip ? -0.055 : 0.055, 0, -0.02]} rotation={[Math.PI / 2, 0, flip ? -0.8 : 0.8]}>
        <capsuleGeometry args={[0.01, 0.04, 3, 6]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  );
}

export function Gloves({ params }: PropProps) {
  const color = str(params, 'color', '#d9b06a');
  return (
    <group>
      <Glove x={-0.06} color={color} />
      <Glove x={0.07} color={color} flip />
    </group>
  );
}

function Boot({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow position={[0, 0.012, 0]}>
        <boxGeometry args={[0.1, 0.024, 0.29]} />
        <meshStandardMaterial color="#1f1a17" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 0.06, -0.03]}>
        <boxGeometry args={[0.095, 0.075, 0.2]} />
        <meshStandardMaterial color="#7a4a22" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.03, 0.09]} scale={[1, 0.8, 1.1]}>
        <sphereGeometry args={[0.05, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#6b3f1c" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.15, -0.07]}>
        <cylinderGeometry args={[0.052, 0.055, 0.14, 10]} />
        <meshStandardMaterial color="#7a4a22" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.215, -0.07]}>
        <torusGeometry args={[0.052, 0.008, 6, 12]} />
        <meshStandardMaterial color="#3b2412" />
      </mesh>
    </group>
  );
}

export function Boots() {
  return (
    <group>
      <Boot x={-0.065} />
      <Boot x={0.065} />
    </group>
  );
}

function Sneaker({ x, color }: { x: number; color: string }) {
  return (
    <group position={[x, 0, 0]}>
      <mesh castShadow position={[0, 0.01, 0]}>
        <boxGeometry args={[0.09, 0.02, 0.27]} />
        <meshStandardMaterial color="#f4f4f4" />
      </mesh>
      <mesh castShadow position={[0, 0.045, -0.02]} scale={[1, 0.8, 2.4]}>
        <sphereGeometry args={[0.05, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

export function Sneakers({ params }: PropProps) {
  const color = str(params, 'color', '#3b6fd8');
  return (
    <group>
      <Sneaker x={-0.06} color={color} />
      <Sneaker x={0.06} color={color} />
    </group>
  );
}
