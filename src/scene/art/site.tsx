import { BoxText, Ink, num, str, usePropText, type ArtProps, type P, type SpriteDef } from './common';

const m2mm = (p: P, k: string, d: number) => num(p, k, d) * 1000;

function FoldingTable({ params }: ArtProps) {
  const w = m2mm(params, 'w', 1.8);
  const d = m2mm(params, 'd', 0.76);
  const c = str(params, 'color', '#e9e6de');
  return (
    <g>
      <rect x={-w / 2 + 14} y={-d / 2 + 18} width={w} height={d} rx={14} fill="#00000030" />
      <Ink>
        <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={14} fill={c} />
      </Ink>
      <rect x={-w / 2 + 10} y={-d / 2 + 10} width={w - 20} height={d - 20} rx={10} fill="none" stroke="#00000014" strokeWidth={3} />
    </g>
  );
}

function Workbench({ params }: ArtProps) {
  const w = m2mm(params, 'w', 2.2);
  const d = m2mm(params, 'd', 0.8);
  return (
    <g>
      <rect x={-w / 2 + 14} y={-d / 2 + 18} width={w} height={d} rx={8} fill="#00000035" />
      <Ink>
        <rect x={-w / 2} y={-d / 2} width={w} height={d} rx={8} fill="#c89a62" />
      </Ink>
      {Array.from({ length: Math.floor(d / 100) }).map((_, i) => (
        <path key={i} d={`M${-w / 2 + 4},${-d / 2 + (i + 1) * 100} L${w / 2 - 4},${-d / 2 + (i + 1) * 100}`} stroke="#a57a48" strokeWidth={2} />
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <path key={`g${i}`} d={`M${-w / 2 + ((i * 137) % w)},${-d / 2 + ((i * 53) % d)} q40,6 90,0`} stroke="#b0844f" strokeWidth={1.5} fill="none" />
      ))}
    </g>
  );
}

function Pegboard({ params }: ArtProps) {
  const w = m2mm(params, 'w', 2.2);
  return (
    <g>
      <Ink>
        <rect x={-w / 2} y={-70} width={w} height={80} rx={4} fill="#d6b88a" />
      </Ink>
      {Array.from({ length: Math.floor(w / 40) }).map((_, i) =>
        [-50, -26, -2].map((y) => <circle key={`${i}${y}`} cx={-w / 2 + 20 + i * 40} cy={y} r={3} fill="#6b5236" />),
      )}
    </g>
  );
}

function BoxTruck({ params }: ArtProps) {
  const text = usePropText(params);
  return (
    <Ink>
      <rect x={-1150} y={-2900} width={2300} height={4600} rx={40} fill="#f4f4f4" />
      <rect x={-1100} y={1700} width={2200} height={1500} rx={120} fill="#c8102e" />
      <rect x={-950} y={2700} width={1900} height={380} rx={60} fill="#2b3848" />
      {text ? <BoxText text={text} x={-1000} y={-700} w={2000} h={600} color="#1d4fbf" /> : null}
    </Ink>
  );
}

function Pickup({ params }: ArtProps) {
  const c = str(params, 'color', '#e8e8e8');
  return (
    <Ink>
      <rect x={-950} y={-2300} width={1900} height={5200} rx={260} fill={c} />
      <rect x={-900} y={-200} width={1800} height={1800} rx={140} fill="#d6d6d6" />
      <rect x={-800} y={1500} width={1600} height={420} rx={80} fill="#2b3848" />
      <rect x={-850} y={-2150} width={1700} height={1800} rx={40} fill="#9aa3ab" />
    </Ink>
  );
}

function StudWall({ params }: ArtProps) {
  const len = m2mm(params, 'len', 4);
  const n = Math.floor(len / 406) + 1;
  return (
    <Ink w={1}>
      <rect x={-len / 2} y={-45} width={len} height={90} fill="#d9b77e" />
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={-len / 2 + i * ((len - 40) / (n - 1))} y={-45} width={40} height={90} fill="#c9a36a" />
      ))}
    </Ink>
  );
}

function Pallet() {
  return (
    <g>
      <rect x={-590} y={-480} width={1200} height={1000} fill="#00000030" rx={10} />
      <Ink w={1}>
        {[-450, 0, 450].map((y) => (
          <rect key={y} x={-600} y={y - 45} width={1200} height={90} fill="#a47b4b" />
        ))}
        {[-500, -250, 0, 250, 500].map((x) => (
          <rect key={x} x={x - 70} y={-500} width={140} height={1000} fill="#c49a6c" />
        ))}
      </Ink>
    </g>
  );
}

function Cone() {
  return (
    <Ink>
      <rect x={-180} y={-180} width={360} height={360} rx={30} fill="#e2571e" />
      <circle cx={0} cy={0} r={150} fill="#f26a1b" />
      <circle cx={0} cy={0} r={85} fill="#f4f4f4" />
      <circle cx={0} cy={0} r={55} fill="#f26a1b" />
    </Ink>
  );
}

function PortaJohn() {
  return (
    <Ink>
      <rect x={-600} y={-600} width={1200} height={1200} rx={60} fill="#e8e8e8" />
      <rect x={-520} y={-520} width={1040} height={1040} rx={40} fill="#2f6fdb" />
    </Ink>
  );
}

function Sawhorse() {
  return (
    <Ink>
      {[-400, 400].map((x) => (
        <path key={x} d={`M${x - 20},-150 L${x + 20},-150 L${x + 20},150 L${x - 20},150 Z`} fill="#c9a36a" />
      ))}
      <rect x={-500} y={-45} width={1000} height={90} fill="#d9b77e" />
    </Ink>
  );
}

function Shelf({ params }: ArtProps) {
  const w = m2mm(params, 'w', 1.5);
  return (
    <Ink>
      <rect x={-w / 2} y={-250} width={w} height={500} fill="#8d9399" />
      {[-w / 2, w / 2].map((x) => [-240, 240].map((y) => <rect key={`${x}${y}`} x={x - 15} y={y - 15} width={30} height={30} fill="#5a6066" />))}
    </Ink>
  );
}

function Dumpster() {
  return (
    <Ink>
      <rect x={-1600} y={-900} width={3200} height={1800} rx={60} fill="#2e7d32" />
      <rect x={-1500} y={-800} width={3000} height={1600} rx={40} fill="#6b5236" />
    </Ink>
  );
}

function WoodStack() {
  return (
    <Ink w={1}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-1220} y={-300 + i * 120} width={2440} height={100} fill={i % 2 ? '#d9b77e' : '#cfa96f'} />
      ))}
    </Ink>
  );
}

export const site: Record<string, SpriteDef> = {
  table: { draw: FoldingTable, bounds: (p) => [-m2mm(p, 'w', 1.8) / 2, -m2mm(p, 'd', 0.76) / 2, m2mm(p, 'w', 1.8) / 2, m2mm(p, 'd', 0.76) / 2] },
  workbench: { draw: Workbench, bounds: (p) => [-m2mm(p, 'w', 2.2) / 2, -m2mm(p, 'd', 0.8) / 2, m2mm(p, 'w', 2.2) / 2, m2mm(p, 'd', 0.8) / 2] },
  pegboard: { draw: Pegboard, bounds: (p) => [-m2mm(p, 'w', 2.2) / 2, -70, m2mm(p, 'w', 2.2) / 2, 10] },
  'box-truck': { draw: BoxTruck, bounds: () => [-1150, -2900, 1150, 3200] },
  pickup: { draw: Pickup, bounds: () => [-950, -2300, 950, 2900] },
  'stud-wall': { draw: StudWall, bounds: (p) => [-m2mm(p, 'len', 4) / 2, -45, m2mm(p, 'len', 4) / 2, 45] },
  pallet: { draw: Pallet, bounds: () => [-600, -500, 610, 520] },
  cone: { draw: Cone, bounds: () => [-180, -180, 180, 180] },
  'porta-john': { draw: PortaJohn, bounds: () => [-600, -600, 600, 600] },
  sawhorse: { draw: Sawhorse, bounds: () => [-500, -150, 500, 150] },
  shelf: { draw: Shelf, bounds: (p) => [-m2mm(p, 'w', 1.5) / 2, -250, m2mm(p, 'w', 1.5) / 2, 250] },
  dumpster: { draw: Dumpster, bounds: () => [-1600, -900, 1600, 900] },
  'wood-stack': { draw: WoodStack, bounds: () => [-1220, -300, 1220, 280] },
};
