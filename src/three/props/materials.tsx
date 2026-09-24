import { useMemo } from 'react';
import * as THREE from 'three';
import { useMission } from '../../engine/store';
import { COPPER, DARK_METAL, LabelPlane, METAL, bool, num, str, usePropText, useLabelTexture, type PropProps } from './common';

/** NM-B cable coil (Romex style). Jacket color tells the gauge. */
export function NmRoll({ params }: PropProps) {
  const color = str(params, 'color', '#f4f4f0');
  const text = str(params, 'text', '');
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.045, 10, 22]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {text ? (
        <group position={[0, 0.045, 0.176]}>
          <mesh>
            <boxGeometry args={[0.11, 0.07, 0.004]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
          <LabelPlane text={text} w={0.1} h={0.06} position={[0, 0, 0.0025]} bg="#ffffff" fg="#111" font={0.55} />
        </group>
      ) : null}
      {/* shrink wrap band */}
      <mesh position={[0, 0.045, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.36]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.25} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** THHN wire reel. */
export function ThhnSpool({ params }: PropProps) {
  const color = str(params, 'color', '#111');
  const text = str(params, 'text', '');
  const flange = str(params, 'flange', '#2b2b2b');
  return (
    <group rotation={[0, 0, 0]}>
      <group position={[0, 0.13, 0]} rotation={[0, 0, Math.PI / 2]}>
        {[-0.07, 0.07].map((y) => (
          <mesh key={y} castShadow position={[0, y, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.012, 20]} />
            <meshStandardMaterial color={flange} roughness={0.8} />
          </mesh>
        ))}
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.13, 20]} />
          {bool(params, 'bare') ? (
            <meshStandardMaterial color={COPPER} metalness={0.85} roughness={0.25} />
          ) : (
            <meshStandardMaterial color={color} roughness={0.35} />
          )}
        </mesh>
      </group>
      {text ? <LabelPlane text={text} w={0.12} h={0.07} position={[0.077, 0.13, 0]} rotation={[0, Math.PI / 2, 0]} font={0.5} /> : null}
    </group>
  );
}

export function BoxSingleGang({ params }: PropProps) {
  const color = str(params, 'color', '#1f5fd1');
  const w = 0.058;
  const h = 0.09;
  const d = 0.075;
  const th = 0.003;
  return (
    <group position={[0, h / 2, 0]}>
      <mesh castShadow position={[0, 0, -d / 2]}>
        <boxGeometry args={[w, h, th]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={'x' + s} castShadow position={[(s * w) / 2, 0, 0]}>
          <boxGeometry args={[th, h, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={'y' + s} castShadow position={[0, (s * h) / 2, 0]}>
          <boxGeometry args={[w, th, d]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      {[-1, 1].map((s) => (
        <mesh key={'e' + s} position={[0, (s * h) / 2 - s * 0.008, d / 2 - 0.004]}>
          <boxGeometry args={[0.012, 0.006, 0.008]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>
      ))}
      {/* nails */}
      {[-1, 1].map((s) => (
        <mesh key={'n' + s} position={[w / 2 + 0.01, s * 0.03, -0.01]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.002, 0.002, 0.05, 5]} />
          <meshStandardMaterial color={METAL} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export function Box4Square() {
  const w = 0.105;
  const d = 0.055;
  return (
    <group position={[0, d / 2, 0]}>
      <mesh castShadow position={[0, -d / 2 + 0.002, 0]}>
        <boxGeometry args={[w, 0.004, w]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} castShadow position={[Math.sin((i * Math.PI) / 2) * (w / 2), 0, Math.cos((i * Math.PI) / 2) * (w / 2)]} rotation={[0, (i * Math.PI) / 2, 0]}>
          <boxGeometry args={[w, d, 0.003]} />
          <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

/** Cardboard carton with a printed label. */
export function Carton({ params }: PropProps) {
  const w = num(params, 'w', 0.4);
  const h = num(params, 'h', 0.25);
  const d = num(params, 'd', 0.3);
  const text = usePropText(params);
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#c49a6c" roughness={0.95} />
      </mesh>
      <mesh position={[0, h + 0.001, 0]}>
        <boxGeometry args={[0.05, 0.002, d]} />
        <meshStandardMaterial color="#b58a55" roughness={0.3} />
      </mesh>
      {text ? <LabelPlane text={text} w={w * 0.8} h={h * 0.55} position={[0, h / 2, d / 2 + 0.002]} font={0.5} /> : null}
    </group>
  );
}

/** Circuit breaker (standing, handle toward +Z). params: amps, poles */
export function Breaker({ params }: PropProps) {
  const amps = str(params, 'amps', '20');
  const poles = num(params, 'poles', 1);
  const w = 0.025 * poles;
  const tex = useLabelTexture(amps, 0.02, 0.012, { bg: '#1a1a1a', fg: '#ffffff', font: 0.9 });
  return (
    <group>
      <mesh castShadow position={[0, 0.0375, 0]}>
        <boxGeometry args={[w, 0.075, 0.06]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.0375, 0.035]}>
        <boxGeometry args={[w * 0.92, 0.035, 0.012]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, 0.045, 0.045]}>
        <boxGeometry args={[w * 0.6, 0.012, 0.014]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.045, 0.0525]}>
        <planeGeometry args={[Math.min(0.02, w * 0.6), 0.011]} />
        <meshStandardMaterial map={tex} />
      </mesh>
      {/* terminal screw */}
      <mesh position={[0, 0.07, 0.02]}>
        <cylinderGeometry args={[0.004, 0.004, 0.012, 8]} />
        <meshStandardMaterial color={METAL} metalness={0.9} />
      </mesh>
    </group>
  );
}

/** Clipboard with a document (delivery ticket etc). */
export function Clipboard({ params }: PropProps) {
  const text = usePropText(params);
  return (
    <group>
      <mesh castShadow position={[0, 0.004, 0]}>
        <boxGeometry args={[0.24, 0.008, 0.32]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <LabelPlane
        text={text}
        w={0.21}
        h={0.28}
        position={[0, 0.0095, 0.012]}
        rotation={[-Math.PI / 2, 0, 0]}
        align="left"
        bold={false}
        font={0.92}
        fg="#1a1a1a"
        bg="#fbfbf6"
        px={2400}
      />
      <mesh position={[0, 0.013, -0.15]}>
        <boxGeometry args={[0.09, 0.012, 0.03]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

/** Orange extension cord. params.damaged → cut jacket + missing ground pin. */
export function ExtensionCord({ params }: PropProps) {
  const damaged = bool(params, 'damaged');
  const color = '#f07a10';
  return (
    <group>
      <mesh castShadow position={[0, 0.013, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.012, 8, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0.12, 0.024, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.012, 8, 24]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* straight lead to plug */}
      <mesh castShadow position={[0.25, 0.012, 0.13]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {damaged ? (
        <group position={[0.25, 0.012, 0.13]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0125, 0.0125, 0.025, 8]} />
            <meshStandardMaterial color="#2a2a2a" />
          </mesh>
          {[-0.005, 0, 0.005].map((z, i) => (
            <mesh key={z} position={[0, 0.004, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.003, 0.003, 0.03, 6]} />
              <meshStandardMaterial color={['#111', '#eee', '#1a8f2a'][i]} />
            </mesh>
          ))}
          <mesh position={[0, 0.009, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0015, 0.0015, 0.02, 6]} />
            <meshStandardMaterial color={COPPER} metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      ) : null}
      {/* male plug */}
      <group position={[0.35, 0.018, 0.13]}>
        <mesh castShadow>
          <boxGeometry args={[0.045, 0.036, 0.036]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {[-0.008, 0.008].map((z) => (
          <mesh key={z} position={[0.035, 0.004, z]}>
            <boxGeometry args={[0.025, 0.008, 0.002]} />
            <meshStandardMaterial color="#d6c28a" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
        {damaged ? (
          <mesh position={[0.024, -0.009, 0]}>
            <cylinderGeometry args={[0.0035, 0.0035, 0.002, 8]} />
            <meshStandardMaterial color="#555" />
          </mesh>
        ) : (
          <mesh position={[0.035, -0.009, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.003, 0.003, 0.026, 8]} />
            <meshStandardMaterial color="#d6c28a" metalness={0.8} roughness={0.25} />
          </mesh>
        )}
      </group>
      {/* female end */}
      <mesh castShadow position={[-0.18, 0.012, 0.1]} rotation={[0, 0.4, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[-0.25, 0.022, 0.13]}>
        <boxGeometry args={[0.05, 0.044, 0.05]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** Staging area with a sign. params: color, w, d, textKey|text, flat (label printed on the mat,
 *  no post — use on benches so nothing blocks the view), post (sign height) */
export function ZonePad({ params }: PropProps) {
  const w = num(params, 'w', 1.2);
  const d = num(params, 'd', 0.9);
  const color = str(params, 'color', '#2f6fdb');
  const flat = bool(params, 'flat');
  const post = num(params, 'post', 0.8);
  const text = usePropText(params);
  return (
    <group>
      <mesh receiveShadow position={[0, 0.005, 0]}>
        <boxGeometry args={[w, 0.01, d]} />
        <meshStandardMaterial color={color} transparent opacity={flat ? 0.85 : 0.55} roughness={0.9} />
      </mesh>
      {flat ? (
        <LabelPlane text={text} w={w * 0.9} h={Math.min(d * 0.35, 0.09)} position={[0, 0.011, d / 2 - Math.min(d * 0.35, 0.09) / 2 - 0.01]} rotation={[-Math.PI / 2, 0, 0]} bg="#ffffff" fg="#111" font={0.62} px={1600} />
      ) : (
        <>
          <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[Math.min(w, d) * 0.35, Math.min(w, d) * 0.38, 32]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
          <group position={[0, 0, -d / 2]}>
            <mesh castShadow position={[0, post / 2, 0]}>
              <boxGeometry args={[0.03, post, 0.03]} />
              <meshStandardMaterial color="#555" />
            </mesh>
            <mesh castShadow position={[0, post + 0.05, 0]}>
              <boxGeometry args={[0.62, 0.26, 0.02]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <LabelPlane text={text} w={0.58} h={0.22} position={[0, post + 0.05, 0.011]} bg="#ffffff" fg="#111" font={0.45} />
          </group>
        </>
      )}
    </group>
  );
}

/** Freestanding / wall sign. params: textKey|text, w, h, bg, fg, post */
export function Sign({ params }: PropProps) {
  const text = usePropText(params);
  const w = num(params, 'w', 0.3);
  const h = num(params, 'h', 0.15);
  const post = num(params, 'post', 0);
  return (
    <group>
      {post > 0 ? (
        <mesh castShadow position={[0, post / 2, -0.012]}>
          <boxGeometry args={[0.02, post, 0.02]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      ) : null}
      <mesh castShadow position={[0, post + h / 2, -0.006]}>
        <boxGeometry args={[w + 0.01, h + 0.01, 0.01]} />
        <meshStandardMaterial color={str(params, 'frame', '#333')} />
      </mesh>
      <LabelPlane text={text} w={w} h={h} position={[0, post + h / 2, 0.0]} bg={str(params, 'bg', '#ffffff')} fg={str(params, 'fg', '#111')} font={num(params, 'font', 0.5)} />
    </group>
  );
}

/** A piece of insulated wire lying along X; stripped end at +X.
 *  params: color, gauge (14|12|10), stripped (inches, static), hold (animate by hold value),
 *  nick (copper nicked), jacket ('thhn'|'nm'), len */
export function WirePiece({ params }: PropProps) {
  const holdAnim = bool(params, 'hold');
  const holdValue = useMission((s) => s.step.holdValue);
  const color = str(params, 'color', '#111');
  const gauge = num(params, 'gauge', 12);
  const L = num(params, 'len', 0.36);
  const stripIn = holdAnim ? holdValue : num(params, 'stripped', 0);
  const VIS = 0.08; // meters per inch (visual scale)
  const exposed = Math.min(L * 0.8, stripIn * VIS);
  const rCu = { 14: 0.0045, 12: 0.0055, 10: 0.007 }[gauge] ?? 0.0055;
  const rIns = rCu * 1.9;
  const insLen = L - exposed;
  const ruler = bool(params, 'ruler');
  return (
    <group position={[0, rIns, 0]}>
      <mesh castShadow position={[-L / 2 + insLen / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[rIns, rIns, insLen, 12]} />
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      {exposed > 0.0005 ? (
        <mesh castShadow position={[L / 2 - exposed / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[rCu, rCu, exposed, 10]} />
          <meshStandardMaterial color={COPPER} metalness={0.85} roughness={0.28} />
        </mesh>
      ) : null}
      {bool(params, 'nick') && exposed > 0.01 ? (
        <mesh position={[L / 2 - exposed + 0.006, rCu * 0.7, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.004, 0.004, rCu * 2.2]} />
          <meshStandardMaterial color="#3a1e0a" />
        </mesh>
      ) : null}
      {ruler ? <Ruler L={L} vis={VIS} y={-rIns + 0.001} z={rIns + 0.03} /> : null}
    </group>
  );
}

function Ruler({ L, vis, y, z }: { L: number; vis: number; y: number; z: number }) {
  // strip ruler: 0 at the wire end (+X), 1/4" marks going toward -X, readable from the front
  const len = 1.25 * vis;
  const tex = useMemo(() => {
    const W = 512;
    const H = 96;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const g = c.getContext('2d')!;
    g.fillStyle = '#f7e37a';
    g.fillRect(0, 0, W, H);
    g.textAlign = 'center';
    g.textBaseline = 'bottom';
    g.font = '700 30px system-ui, Arial, sans-serif';
    ['0', '1/4', '1/2', '3/4', '1"'].forEach((lab, i) => {
      const x = W - (i * 0.25 * vis * W) / len - 2;
      g.fillStyle = i === 3 ? '#c21d1d' : '#222';
      g.fillRect(x - 2, 0, 4, i % 2 ? 26 : 38);
      g.fillText(lab, Math.min(W - 18, Math.max(24, x)), H - 6);
    });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [len, vis]);
  return (
    <mesh position={[L / 2 - len / 2, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[len, 0.03]} />
      <meshStandardMaterial map={tex} />
    </mesh>
  );
}

/** NM-B cable segment with printed jacket and conductors exiting at +X. */
export function NmCable({ params }: PropProps) {
  const color = str(params, 'color', '#f2d024');
  const text = str(params, 'text', '');
  const L = num(params, 'len', 0.6);
  const tex = useLabelTexture(text, L * 0.8, 0.02, { bg: color, fg: '#111', font: 0.8, bold: false });
  return (
    <group position={[0, 0.012, 0]}>
      <mesh castShadow scale={[1, 0.5, 1]}>
        <boxGeometry args={[L, 0.024, 0.026]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {text ? (
        <mesh position={[0, 0.0065, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[L * 0.8, 0.02]} />
          <meshStandardMaterial map={tex} />
        </mesh>
      ) : null}
      {[
        ['#111', -0.008],
        ['#eee', 0],
        [COPPER, 0.008],
      ].map(([c, z]) => (
        <mesh key={String(z)} castShadow position={[L / 2 + 0.05, 0, Number(z)]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[c === COPPER ? 0.0025 : 0.004, c === COPPER ? 0.0025 : 0.004, 0.1, 8]} />
          <meshStandardMaterial color={String(c)} metalness={c === COPPER ? 0.8 : 0} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

/** Probe point: a brass terminal screw / wire end the meter leads can touch. */
export function ProbePoint({ params }: PropProps) {
  const color = str(params, 'color', '#d6b25e');
  return (
    <group>
      <mesh castShadow position={[0, 0.008, 0]}>
        <cylinderGeometry args={[0.014, 0.014, 0.016, 12]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.0165, 0]}>
        <boxGeometry args={[0.022, 0.002, 0.004]} />
        <meshStandardMaterial color={DARK_METAL} />
      </mesh>
    </group>
  );
}
