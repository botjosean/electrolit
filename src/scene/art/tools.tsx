import { Ink, STEEL, STEEL_DARK, Shine, handlePoly, str, type ArtProps, type SpriteDef } from './common';

// Hand tools lie flat, jaws/tip toward +x (right), origin as in the mission data.

function Handles({ len, spread, r, c1, c2 }: { len: number; spread: number; r: number; c1: string; c2: string }) {
  return (
    <>
      <polygon points={handlePoly(len, spread, r, 1)} fill={c1} />
      <polygon points={handlePoly(len, spread, r, -1)} fill={c2} />
      <circle cx={-len} cy={spread} r={r * 1.05} fill={c1} />
      <circle cx={-len} cy={-spread} r={r * 1.05} fill={c2} />
    </>
  );
}

const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');

function LinemanPliers() {
  return (
    <Ink>
      <Handles len={168} spread={27} r={10} c1="#1d4fbf" c2="#e0b400" />
      <polygon points={pts([[-14, 17], [30, 19], [58, 16], [68, 10], [68, -10], [58, -16], [30, -19], [-14, -17]])} fill={STEEL_DARK} />
      <path d="M8,0 L66,0" stroke="#15181c" strokeWidth={2} />
      <path d="M12,-12 L26,4" stroke="#e9ecef" strokeWidth={2} />
      <circle cx={0} cy={0} r={8} fill="#cfd4d9" />
      <Shine d="M24,-16 L56,-13 L56,-8 L24,-10 Z" />
    </Ink>
  );
}

function NeedleNose() {
  return (
    <Ink>
      <Handles len={132} spread={23} r={8.5} c1="#d42a2a" c2="#d42a2a" />
      <polygon points={pts([[-12, 15], [20, 13], [60, 7], [100, 2.5], [102, 0], [100, -2.5], [60, -7], [20, -13], [-12, -15]])} fill={STEEL_DARK} />
      <path d="M10,0 L98,0" stroke="#15181c" strokeWidth={1.5} />
      <circle cx={0} cy={0} r={7} fill="#cfd4d9" />
    </Ink>
  );
}

function Dikes() {
  return (
    <Ink>
      <Handles len={122} spread={27} r={10} c1="#e06a10" c2="#e06a10" />
      <polygon points={pts([[-12, 18], [22, 21], [40, 13], [48, 0], [40, -13], [22, -21], [-12, -18]])} fill={STEEL_DARK} />
      <path d="M12,16 L46,0 M12,-16 L46,0" stroke="#e9ecef" strokeWidth={2} />
      <circle cx={0} cy={0} r={8} fill="#cfd4d9" />
    </Ink>
  );
}

function Strippers() {
  return (
    <Ink>
      <Handles len={112} spread={25} r={9} c1="#e8c21a" c2="#c02020" />
      <polygon points={pts([[-12, 13], [100, 10], [114, 5], [114, -5], [100, -10], [-12, -13]])} fill={STEEL_DARK} />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={24 + i * 15} cy={0} r={4.2 - i * 0.55} fill="#0d0f12" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`m${i}`} x={20 + i * 15} y={6} width={8} height={3} fill="#f2f2f2" stroke="none" />
      ))}
      <circle cx={4} cy={0} r={7} fill="#cfd4d9" />
    </Ink>
  );
}

function Screwdriver({ params }: ArtProps) {
  const tip = str(params, 'tip', 'flat');
  const c = str(params, 'color', tip === 'flat' ? '#d42a2a' : '#1d4fbf');
  return (
    <Ink>
      <rect x={-12} y={-4} width={108} height={8} fill="#c9ced3" />
      {tip === 'flat' ? <polygon points="94,-4 110,-9 112,-9 112,9 110,9 94,4" fill="#c9ced3" /> : <polygon points="94,-4 112,0 94,4" fill="#c9ced3" />}
      {tip === 'phillips' ? <path d="M102,-3 L102,3" stroke="#555" /> : null}
      <path d="M-118,-15 Q-122,0 -118,15 L-20,17 Q-8,17 -8,8 L-8,-8 Q-8,-17 -20,-17 Z" fill={c} />
      {[-100, -84, -68, -52, -36].map((x) => (
        <path key={x} d={`M${x},-14 L${x},14`} stroke="#00000055" strokeWidth={1.5} />
      ))}
      <rect x={-124} y={-12} width={10} height={24} rx={4} fill="#111" />
      <Shine d="M-110,-12 L-24,-13 L-24,-7 L-110,-6 Z" />
    </Ink>
  );
}

function NonContactTester() {
  return (
    <Ink>
      <path d="M-72,-14 L54,-14 L92,-3 L92,3 L54,14 L-72,14 Q-80,14 -80,0 Q-80,-14 -72,-14 Z" fill="#f2c500" />
      <path d="M54,-14 L92,-3 L92,3 L54,14 Z" fill="#f4f4f4" />
      <rect x={-50} y={-19} width={70} height={8} rx={3} fill="#222" />
      <circle cx={38} cy={0} r={6} fill="#ff3b30" />
      <circle cx={38} cy={0} r={11} fill="none" stroke="#ff3b3055" strokeWidth={3} />
      <rect x={-80} y={-14} width={14} height={28} rx={5} fill="#222" />
      <Shine d="M-60,-10 L40,-10 L40,-5 L-60,-5 Z" />
    </Ink>
  );
}

function Multimeter() {
  return (
    <Ink>
      <rect x={-52} y={-92} width={104} height={184} rx={16} fill="#f2c500" />
      <rect x={-42} y={-82} width={84} height={164} rx={10} fill="#303338" />
      <rect x={-33} y={-72} width={66} height={42} rx={4} fill="#b9d3a9" />
      <text x={0} y={-50} fontSize={20} textAnchor="middle" dominantBaseline="middle" fontFamily="ui-monospace, Menlo, monospace" fill="#223" stroke="none" fontWeight={700}>
        0.00
      </text>
      <circle cx={0} cy={12} r={28} fill="#55595f" />
      <circle cx={0} cy={12} r={20} fill="#3b3f45" />
      <path d="M0,12 L0,-12" stroke="#fff" strokeWidth={3} />
      {['V~', 'Ω', '•))'].map((s, i) => (
        <text key={s} x={-30 + i * 30} y={-22 + 0} fontSize={8} fill="#fff" stroke="none" textAnchor="middle" dominantBaseline="middle">
          {s}
        </text>
      ))}
      {[-24, 0, 24].map((x, i) => (
        <circle key={x} cx={x} cy={64} r={6} fill={i === 1 ? '#111' : '#c21d1d'} stroke="#aaa" />
      ))}
    </Ink>
  );
}

function TapeMeasure() {
  return (
    <Ink>
      <path d="M40,24 L78,24 L78,32 L40,32 Z" fill="#f7e37a" />
      <rect x={76} y={20} width={6} height={16} fill={STEEL} />
      <rect x={-40} y={-38} width={82} height={76} rx={16} fill="#1b1b1b" />
      <circle cx={0} cy={0} r={30} fill="#f2c500" />
      <circle cx={0} cy={0} r={11} fill="#1b1b1b" />
      <rect x={-12} y={-44} width={24} height={10} rx={3} fill="#c21d1d" />
    </Ink>
  );
}

function TorpedoLevel() {
  return (
    <Ink>
      <rect x={-116} y={-15} width={232} height={30} rx={6} fill="#e8b400" />
      {[-72, 0, 72].map((x) => (
        <g key={x}>
          <rect x={x - 16} y={-8} width={32} height={16} rx={8} fill="#7bf07b" />
          <circle cx={x + 3} cy={0} r={4} fill="#ffffffcc" stroke="none" />
          <path d={`M${x - 6},-8 L${x - 6},8 M${x + 6},-8 L${x + 6},8`} stroke="#1d232a" strokeWidth={1} />
        </g>
      ))}
      <Shine d="M-110,-12 L110,-12 L110,-8 L-110,-8 Z" />
    </Ink>
  );
}

function FishTape() {
  return (
    <Ink>
      <path d="M130,-4 L220,-4 L222,0 L220,4 L130,4 Z" fill={STEEL} />
      <path d="M-130,-40 C-190,-40 -190,40 -130,40" fill="none" stroke={'#1d232a'} strokeWidth={3} />
      <path d="M-130,-30 C-176,-30 -176,30 -130,30" fill="none" stroke="#222" strokeWidth={10} />
      <circle cx={0} cy={0} r={130} fill="#1d4fbf" />
      <circle cx={0} cy={0} r={104} fill="#2a5fd6" />
      <circle cx={0} cy={0} r={50} fill="#eef1f4" />
      <circle cx={0} cy={0} r={14} fill="#aab2ba" />
      <Shine d="M-90,-80 A120,120 0 0 1 60,-110 L50,-92 A100,100 0 0 0 -76,-66 Z" opacity={0.3} />
    </Ink>
  );
}

function CableRipper() {
  return (
    <Ink>
      <rect x={-52} y={-15} width={104} height={30} rx={12} fill="#f07a10" />
      <circle cx={32} cy={0} r={9} fill="#1d232a" />
      <circle cx={32} cy={0} r={4} fill="#f07a10" />
      <rect x={-40} y={-6} width={42} height={12} rx={4} fill="#222" />
    </Ink>
  );
}

function UtilityKnife() {
  return (
    <Ink>
      <polygon points="70,-6 96,-12 96,-2 70,6" fill="#e8ecef" />
      <path d="M-70,-16 L74,-14 L74,14 L-70,16 Q-78,16 -78,0 Q-78,-16 -70,-16 Z" fill={STEEL} />
      <rect x={-56} y={-9} width={90} height={18} rx={6} fill="#f2c500" />
      <rect x={-12} y={-15} width={18} height={6} rx={2} fill="#333" />
    </Ink>
  );
}

function Hammer() {
  return (
    <Ink>
      <path d="M-160,-10 L96,-8 L96,8 L-160,10 Q-168,0 -160,-10 Z" fill="#b5713b" />
      <rect x={-160} y={-12} width={70} height={24} rx={8} fill="#2b2b2b" />
      <path d="M90,-60 L120,-60 L122,60 Q110,90 92,96 L96,60 L90,60 Z" fill={STEEL_DARK} />
      <rect x={86} y={-66} width={38} height={22} rx={4} fill={STEEL_DARK} />
    </Ink>
  );
}

function ToolBag({ params }: ArtProps) {
  const c = str(params, 'color', '#2d2d2d');
  const accent = str(params, 'accent', '#e06a10');
  return (
    <Ink>
      <path d="M-120,-120 C-120,-200 120,-200 120,-120" fill="none" stroke="#111" strokeWidth={4} />
      {[
        [-150, '#d42a2a'],
        [-110, '#1d4fbf'],
        [-60, '#e8c21a'],
        [120, '#e06a10'],
        [160, '#2b2b2b'],
      ].map(([x, col]) => (
        <rect key={String(x)} x={Number(x) - 10} y={-170} width={20} height={70} rx={8} fill={String(col)} />
      ))}
      <path d="M-240,-110 L240,-110 L226,140 L-226,140 Z" fill={c} />
      <path d="M-236,-10 L236,-10 L228,90 L-228,90 Z" fill={accent} />
      {[-120, 0, 120].map((x) => (
        <path key={x} d={`M${x},-10 L${x},90`} stroke="#00000066" strokeWidth={2} />
      ))}
      <rect x={-240} y={-122} width={480} height={18} rx={6} fill="#111" />
    </Ink>
  );
}

function Drill() {
  return (
    <Ink>
      <rect x={150} y={-6} width={60} height={12} fill={STEEL} />
      <rect x={120} y={-18} width={34} height={36} rx={6} fill="#333" />
      <path d="M-90,-40 L120,-40 L120,34 L20,34 L20,40 L-90,40 Z" fill="#c8102e" />
      <path d="M-40,40 L10,40 L20,170 L-50,170 Z" fill="#222" />
      <rect x={-80} y={170} width={120} height={50} rx={8} fill="#c8102e" />
      <rect x={-8} y={46} width={16} height={24} rx={4} fill="#444" />
    </Ink>
  );
}

export const tools: Record<string, SpriteDef> = {
  'lineman-pliers': { draw: LinemanPliers, bounds: () => [-180, -40, 70, 40] },
  'needle-nose': { draw: NeedleNose, bounds: () => [-142, -33, 104, 33] },
  dikes: { draw: Dikes, bounds: () => [-134, -38, 50, 38] },
  strippers: { draw: Strippers, bounds: () => [-122, -35, 116, 35] },
  screwdriver: { draw: Screwdriver, bounds: () => [-126, -18, 114, 18] },
  ncvt: { draw: NonContactTester, bounds: () => [-82, -20, 94, 20] },
  multimeter: { draw: Multimeter, bounds: () => [-54, -94, 54, 94] },
  'tape-measure': { draw: TapeMeasure, bounds: () => [-42, -46, 84, 40] },
  'torpedo-level': { draw: TorpedoLevel, bounds: () => [-118, -17, 118, 17] },
  'fish-tape': { draw: FishTape, bounds: () => [-180, -132, 224, 132] },
  'cable-ripper': { draw: CableRipper, bounds: () => [-54, -17, 54, 17] },
  'utility-knife': { draw: UtilityKnife, bounds: () => [-80, -18, 98, 18] },
  hammer: { draw: Hammer, bounds: () => [-168, -68, 126, 98] },
  'tool-bag': { draw: ToolBag, bounds: () => [-242, -200, 242, 142] },
  drill: { draw: Drill, bounds: () => [-92, -42, 212, 222] },
};
