import { useMission } from '../../engine/store';
import { BoxText, COPPER, Ink, STEEL, Shine, bool, num, str, usePropText, type ArtProps, type P, type SpriteDef } from './common';

const m2mm = (p: P, k: string, d: number) => num(p, k, d) * 1000;

function NmRoll({ params }: ArtProps) {
  const c = str(params, 'color', '#f4f4f0');
  const text = str(params, 'text', '');
  return (
    <Ink>
      <circle cx={0} cy={0} r={175} fill={c} />
      <circle cx={0} cy={0} r={85} fill="#00000022" />
      <circle cx={0} cy={0} r={85} fill="none" />
      {[100, 118, 136, 154].map((r) => (
        <circle key={r} cx={0} cy={0} r={r} fill="none" stroke="#00000030" strokeWidth={1} />
      ))}
      <path d="M-24,-175 L24,-175 L24,175 L-24,175 Z" fill="#ffffff" fillOpacity={0.35} stroke="#ffffff88" strokeWidth={1} />
      {text ? (
        <g>
          <rect x={-62} y={96} width={124} height={62} rx={6} fill="#fff" />
          <BoxText text={text} x={-62} y={96} w={124} h={62} size={40} />
        </g>
      ) : null}
      <Shine d="M-150,-60 A160,160 0 0 1 -60,-150 L-50,-128 A138,138 0 0 0 -128,-50 Z" opacity={0.3} />
    </Ink>
  );
}

function ThhnSpool({ params }: ArtProps) {
  const bare = bool(params, 'bare');
  const c = str(params, 'color', '#111');
  const flange = str(params, 'flange', '#2b2b2b');
  const text = str(params, 'text', '');
  return (
    <Ink>
      <rect x={-66} y={-100} width={132} height={200} fill={bare ? COPPER : c} />
      {Array.from({ length: 11 }).map((_, i) => (
        <path key={i} d={`M-66,${-90 + i * 18} L66,${-86 + i * 18}`} stroke={bare ? '#8a4c1c' : '#ffffff40'} strokeWidth={1.2} />
      ))}
      {bare ? <Shine d="M-60,-96 L60,-96 L60,-70 L-60,-76 Z" opacity={0.45} /> : <Shine d="M-60,-96 L60,-96 L60,-80 L-60,-84 Z" opacity={0.25} />}
      <rect x={-80} y={-132} width={16} height={264} rx={5} fill={flange} />
      <rect x={64} y={-132} width={16} height={264} rx={5} fill={flange} />
      {text ? (
        <g>
          <rect x={-44} y={-18} width={88} height={36} rx={4} fill="#fff" />
          <BoxText text={text} x={-44} y={-18} w={88} h={36} size={20} />
        </g>
      ) : null}
    </Ink>
  );
}

function BoxSingleGang({ params }: ArtProps) {
  const c = str(params, 'color', '#1f5fd1');
  return (
    <Ink>
      <path d="M-40,-24 L-29,-24 M-40,24 L-29,24 M29,-24 L40,-24 M29,24 L40,24" stroke={STEEL} strokeWidth={3} />
      <rect x={-29} y={-45} width={58} height={90} rx={4} fill={c} />
      <rect x={-21} y={-36} width={42} height={72} rx={3} fill="#113a86" />
      <rect x={-7} y={-44} width={14} height={8} fill="#e8ecef" />
      <rect x={-7} y={36} width={14} height={8} fill="#e8ecef" />
      <circle cx={-10} cy={-18} r={4} fill="#1f5fd1" />
      <circle cx={10} cy={18} r={4} fill="#1f5fd1" />
    </Ink>
  );
}

function Box4Square() {
  return (
    <Ink>
      <rect x={-52} y={-52} width={104} height={104} rx={6} fill="#b8c0c7" />
      <rect x={-44} y={-44} width={88} height={88} rx={4} fill="#9aa3ab" />
      {[
        [-22, -22],
        [22, -22],
        [-22, 22],
        [22, 22],
        [0, 0],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={9} fill="#c9d0d6" />
      ))}
    </Ink>
  );
}

function Carton({ params }: ArtProps) {
  const w = m2mm(params, 'w', 0.4);
  const d = m2mm(params, 'd', 0.3);
  const text = usePropText(params);
  return (
    <Ink>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={4} fill="#c49a6c" />
      <rect x={-w / 2} y={-8} width={w} height={16} fill="#b58a55" stroke="none" />
      <path d={`M${-w / 2},0 L${w / 2},0`} stroke="#8d6a3f" strokeWidth={1} />
      {text ? (
        <g>
          <rect x={-w * 0.4} y={-d * 0.32} width={w * 0.8} height={d * 0.64} rx={4} fill="#fff" />
          <BoxText text={text} x={-w * 0.4} y={-d * 0.32} w={w * 0.8} h={d * 0.64} />
        </g>
      ) : null}
    </Ink>
  );
}

function Breaker({ params }: ArtProps) {
  const amps = str(params, 'amps', '20');
  const poles = num(params, 'poles', 1);
  const w = 25 * poles;
  return (
    <Ink>
      <rect x={-w / 2} y={-38} width={w} height={76} rx={3} fill="#1f2226" />
      <rect x={-w / 2 + 3} y={-18} width={w - 6} height={36} rx={2} fill="#2c3036" />
      <rect x={-w / 2 + 5} y={-14} width={w - 10} height={16} rx={2} fill="#0e1012" />
      <BoxText text={amps} x={-w / 2 + 5} y={-14} w={w - 10} h={16} size={11} color="#fff" />
      <circle cx={0} cy={-29} r={4} fill={STEEL} />
      <text x={0} y={30} fontSize={6} fill="#c9d0d6" textAnchor="middle" stroke="none">
        ON
      </text>
    </Ink>
  );
}

function Clipboard({ params }: ArtProps) {
  const text = usePropText(params);
  return (
    <Ink>
      <rect x={-120} y={-160} width={240} height={320} rx={10} fill="#8b5a2b" />
      <rect x={-105} y={-128} width={210} height={280} rx={3} fill="#fbfbf6" />
      <BoxText text={text} x={-100} y={-124} w={200} h={272} anchor="start" weight={500} mono color="#1a1a1a" />
      <rect x={-45} y={-170} width={90} height={30} rx={6} fill="#aeb6be" />
    </Ink>
  );
}

function ExtensionCord({ params }: ArtProps) {
  const damaged = bool(params, 'damaged');
  const orange = '#f07a10';
  // female end → two coiled loops → lead → plug (matches the inspect hotspots of mission m0-1)
  const path =
    'M-236,130 C-190,130 -150,110 -120,70 C-100,40 -70,-100 0,-100 C80,-100 100,-60 100,0 C100,60 60,100 0,100 C-80,100 -90,40 -90,0 C-90,-80 -10,-112 60,-96 C130,-80 150,-30 138,30 C130,80 150,122 196,130 L' +
    (damaged ? '237' : '330') +
    ',130';
  return (
    <g>
      <path d={path} fill="none" stroke="#1d232a" strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke={orange} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#ffffff55" strokeWidth={5} strokeLinecap="round" transform="translate(-3,-5)" />
      {damaged ? (
        <g>
          <path d="M263,130 L330,130" stroke="#1d232a" strokeWidth={28} strokeLinecap="round" />
          <path d="M263,130 L330,130" stroke={orange} strokeWidth={22} strokeLinecap="round" />
          {/* exposed conductors in the cut */}
          <Ink w={1}>
            <rect x={236} y={119} width={28} height={7} rx={3} fill="#111" />
            <rect x={236} y={127} width={28} height={7} rx={3} fill="#eee" />
            <rect x={236} y={135} width={28} height={7} rx={3} fill="#1a8f2a" />
            <rect x={244} y={126} width={12} height={4} fill={COPPER} />
          </Ink>
          <path d="M232,112 L238,120 M268,112 L262,120 M232,148 L238,140 M268,148 L262,140" stroke="#b45309" strokeWidth={3} />
        </g>
      ) : null}
      <Ink>
        {/* plug with two blades (+ round ground pin if present) */}
        <rect x={380} y={116} width={24} height={7} fill="#d6c28a" />
        <rect x={380} y={137} width={24} height={7} fill="#d6c28a" />
        {damaged ? <circle cx={374} cy={130} r={4} fill="#3a2a1a" /> : <rect x={380} y={127} width={22} height={6} rx={3} fill="#d6c28a" />}
        <rect x={326} y={108} width={52} height={44} rx={6} fill={orange} />
        {/* female end */}
        <rect x={-292} y={104} width={56} height={52} rx={6} fill={orange} />
        <rect x={-282} y={116} width={4} height={12} fill="#222" />
        <rect x={-282} y={132} width={4} height={12} fill="#222" />
      </Ink>
    </g>
  );
}

function ZonePad({ params }: ArtProps) {
  const w = m2mm(params, 'w', 1.2);
  const d = m2mm(params, 'd', 0.9);
  const color = str(params, 'color', '#2f6fdb');
  const text = usePropText(params);
  const lh = Math.max(m2mm(params, 'labelH', Math.min(num(params, 'd', 0.9) * 0.35, 0.09)), d * 0.22);
  return (
    <g>
      <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={Math.min(w, d) * 0.06} fill={color} fillOpacity={0.8} stroke="#ffffffaa" strokeWidth={2} strokeDasharray="10 8" />
      <rect x={-w * 0.44} y={d / 2 - lh - d * 0.05} width={w * 0.88} height={lh} rx={6} fill="#fff" stroke="#1d232a" strokeWidth={1.5} />
      <BoxText text={text} x={-w * 0.44} y={d / 2 - lh - d * 0.05} w={w * 0.88} h={lh} />
    </g>
  );
}

function Sign({ params }: ArtProps) {
  const w = m2mm(params, 'w', 0.3);
  const h = m2mm(params, 'h', 0.15);
  const text = usePropText(params);
  return (
    <Ink>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill={str(params, 'bg', '#ffffff')} />
      <BoxText text={text} x={-w / 2} y={-h / 2} w={w} h={h} color={str(params, 'fg', '#111')} />
    </Ink>
  );
}

const R_CU: Record<number, number> = { 14: 4.5, 12: 5.5, 10: 7 };
const VIS = 80; // mm drawn per inch stripped (visual scale)

function WirePiece({ params }: ArtProps) {
  const holdAnim = bool(params, 'hold');
  const holdValue = useMission((s) => s.step.holdValue);
  const color = str(params, 'color', '#111');
  const L = m2mm(params, 'len', 0.36);
  const stripIn = holdAnim ? holdValue : num(params, 'stripped', 0);
  const exposed = Math.min(L * 0.8, stripIn * VIS);
  const rCu = (R_CU[num(params, 'gauge', 12)] ?? 5.5) * 1.3;
  const rIns = rCu * 1.9;
  const insEnd = L / 2 - exposed;
  return (
    <g>
      <Ink>
        {exposed > 0.5 ? <rect x={insEnd - 2} y={-rCu} width={exposed + 2} height={rCu * 2} rx={rCu} fill={COPPER} /> : null}
        <rect x={-L / 2} y={-rIns} width={insEnd + L / 2} height={rIns * 2} rx={rIns * 0.6} fill={color} />
      </Ink>
      <Shine d={`M${-L / 2 + 6},${-rIns * 0.6} L${insEnd - 4},${-rIns * 0.6} L${insEnd - 4},${-rIns * 0.25} L${-L / 2 + 6},${-rIns * 0.25} Z`} opacity={color === '#eeeeee' || color === '#f4f4f0' ? 0.6 : 0.25} />
      {exposed > 0.5 ? <Shine d={`M${insEnd},${-rCu * 0.6} L${L / 2 - 3},${-rCu * 0.6} L${L / 2 - 3},${-rCu * 0.2} L${insEnd},${-rCu * 0.2} Z`} opacity={0.5} /> : null}
      {bool(params, 'nick') && exposed > 10 ? (
        <path d={`M${insEnd + 8},${-rCu} L${insEnd + 12},${-rCu * 0.1} L${insEnd + 16},${-rCu}`} fill="#3a1e0a" stroke="#3a1e0a" strokeWidth={1.5} />
      ) : null}
      {bool(params, 'ruler') ? <Ruler L={L} y={rIns + 14} /> : null}
    </g>
  );
}

function Ruler({ L, y }: { L: number; y: number }) {
  const len = 1.25 * VIS;
  const x0 = L / 2 - len;
  return (
    <Ink w={1}>
      <rect x={x0} y={y} width={len} height={30} rx={3} fill="#f7e37a" />
      {['0', '1/4', '1/2', '3/4', '1"'].map((lab, i) => {
        const x = L / 2 - i * 0.25 * VIS;
        return (
          <g key={lab}>
            <path d={`M${x},${y} L${x},${y + (i % 2 ? 9 : 14)}`} stroke={i === 3 ? '#c21d1d' : '#222'} strokeWidth={i === 3 ? 2.5 : 1.5} />
            <text x={Math.min(L / 2 - 6, Math.max(x0 + 8, x))} y={y + 23} fontSize={9} textAnchor="middle" fill={i === 3 ? '#c21d1d' : '#222'} stroke="none" fontWeight={700}>
              {lab}
            </text>
          </g>
        );
      })}
    </Ink>
  );
}

function NmCable({ params }: ArtProps) {
  const color = str(params, 'color', '#f2d024');
  const text = str(params, 'text', '');
  const L = m2mm(params, 'len', 0.6);
  return (
    <g>
      <Ink>
        <rect x={L / 2 - 4} y={-12} width={104} height={7} rx={3.5} fill="#111" />
        <rect x={L / 2 - 4} y={-3.5} width={104} height={7} rx={3.5} fill="#eee" />
        <rect x={L / 2 - 4} y={6} width={104} height={4.5} rx={2} fill={COPPER} />
        <rect x={-L / 2} y={-15} width={L} height={30} rx={12} fill={color} />
      </Ink>
      {text ? <BoxText text={text} x={-L * 0.42} y={-10} w={L * 0.84} h={20} size={11} weight={600} color="#1a1a1a" /> : null}
    </g>
  );
}

function ProbePoint({ params }: ArtProps) {
  return (
    <Ink>
      <circle cx={0} cy={0} r={14} fill={str(params, 'color', '#d6b25e')} />
      <path d="M-9,0 L9,0" stroke="#3d3528" strokeWidth={3} />
    </Ink>
  );
}

export const materials: Record<string, SpriteDef> = {
  'nm-roll': { draw: NmRoll, bounds: () => [-177, -177, 177, 177] },
  'thhn-spool': { draw: ThhnSpool, bounds: () => [-81, -133, 81, 133] },
  'box-single-gang': { draw: BoxSingleGang, bounds: () => [-41, -46, 41, 46] },
  'box-4sq': { draw: Box4Square, bounds: () => [-53, -53, 53, 53] },
  carton: { draw: Carton, bounds: (p) => [-m2mm(p, 'w', 0.4) / 2, -m2mm(p, 'd', 0.3) / 2, m2mm(p, 'w', 0.4) / 2, m2mm(p, 'd', 0.3) / 2] },
  breaker: { draw: Breaker, bounds: (p) => [-12.5 * num(p, 'poles', 1) - 1, -39, 12.5 * num(p, 'poles', 1) + 1, 39] },
  clipboard: { draw: Clipboard, bounds: () => [-121, -171, 121, 161] },
  'extension-cord': { draw: ExtensionCord, bounds: () => [-293, -114, 405, 153] },
  'zone-pad': { draw: ZonePad, bounds: (p) => [-m2mm(p, 'w', 1.2) / 2, -m2mm(p, 'd', 0.9) / 2, m2mm(p, 'w', 1.2) / 2, m2mm(p, 'd', 0.9) / 2] },
  sign: { draw: Sign, bounds: (p) => [-m2mm(p, 'w', 0.3) / 2, -m2mm(p, 'h', 0.15) / 2, m2mm(p, 'w', 0.3) / 2, m2mm(p, 'h', 0.15) / 2] },
  'wire-piece': {
    draw: WirePiece,
    bounds: (p) => {
      const L = m2mm(p, 'len', 0.36);
      const rIns = (R_CU[num(p, 'gauge', 12)] ?? 5.5) * 1.3 * 1.9;
      return [-L / 2, -rIns, L / 2, bool(p, 'ruler') ? rIns + 44 : rIns];
    },
  },
  'nm-cable': { draw: NmCable, bounds: (p) => [-m2mm(p, 'len', 0.6) / 2, -16, m2mm(p, 'len', 0.6) / 2 + 100, 16] },
  'probe-point': { draw: ProbePoint, bounds: () => [-15, -15, 15, 15] },
};
