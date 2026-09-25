import { Ink, Shine, str, type ArtProps, type SpriteDef } from './common';

function HardHat({ params }: ArtProps) {
  const c = str(params, 'color', '#f5f5f0');
  return (
    <Ink>
      {/* brim */}
      <path d="M-150,48 Q-150,70 -110,70 L140,70 Q160,70 160,56 L150,44 Z" fill={c} />
      {/* dome */}
      <path d="M-128,52 C-128,-60 -60,-110 10,-110 C80,-110 128,-50 128,52 Z" fill={c} />
      {/* center ridge */}
      <path d="M-40,-104 C-10,-114 30,-114 56,-104 L50,52 L-34,52 Z" fill={c} />
      <Shine d="M-100,20 C-96,-50 -50,-88 -10,-96 C-50,-70 -80,-30 -84,20 Z" />
      {/* suspension band peeking below */}
      <path d="M-116,56 L116,56" stroke="#333" strokeWidth={2} />
      <circle cx={-60} cy={-10} r={10} fill="#e0a800" />
    </Ink>
  );
}

function Cap({ params }: ArtProps) {
  const c = str(params, 'color', '#b22234');
  return (
    <Ink>
      <path d="M40,30 C90,34 150,40 160,52 C150,62 90,60 30,50 Z" fill={c} />
      <path d="M-120,40 C-120,-40 -60,-78 0,-78 C60,-78 104,-40 104,40 Z" fill={c} />
      <circle cx={-8} cy={-80} r={9} fill={c} />
      <path d="M-6,-76 C-40,-40 -48,0 -44,40" fill="none" />
      <Shine d="M-96,20 C-94,-30 -60,-60 -30,-66 C-56,-40 -72,-10 -76,20 Z" />
    </Ink>
  );
}

function SafetyGlasses() {
  return (
    <Ink>
      {/* temples (arms) folded behind */}
      <path d="M-88,-14 L-92,26 M88,-14 L92,26" stroke="#222" strokeWidth={2.5} fill="none" />
      <path d="M-84,-22 Q-84,26 -44,26 Q-8,26 -6,-6 Q0,-12 6,-6 Q8,26 44,26 Q84,26 84,-22 Z" fill="#9fd3ff" fillOpacity={0.7} />
      <path d="M-86,-26 L86,-26 L84,-16 L-84,-16 Z" fill="#222" />
      <Shine d="M-70,-10 L-52,-10 L-66,18 L-76,12 Z" opacity={0.55} />
      <Shine d="M18,-10 L36,-10 L22,18 L12,12 Z" opacity={0.55} />
    </Ink>
  );
}

function Vest() {
  return (
    <Ink>
      <path
        d="M-150,-240 L-70,-240 L0,-60 L70,-240 L150,-240 L160,-150 C190,-120 210,-60 210,0 L210,230 Q210,240 200,240 L-200,240 Q-210,240 -210,230 L-210,0 C-210,-60 -190,-120 -160,-150 Z"
        fill="#c6f21b"
      />
      <path d="M0,-60 L0,240" fill="none" strokeDasharray="10 8" />
      {/* reflective stripes */}
      <path d="M-210,40 L210,40 L210,70 L-210,70 Z M-210,140 L210,140 L210,170 L-210,170 Z" fill="#dfe6ea" />
      <path d="M-130,-236 L-100,-236 L-100,40 L-130,40 Z M100,-236 L130,-236 L130,40 L100,40 Z" fill="#dfe6ea" />
      <Shine d="M-190,-60 C-186,-110 -170,-140 -154,-150 L-154,20 L-190,20 Z" opacity={0.25} />
    </Ink>
  );
}

function Glove({ flip }: { flip?: boolean }) {
  return (
    <g transform={flip ? 'scale(-1,1)' : undefined}>
      {/* fingers */}
      {[-30, -10, 10, 30].map((x, i) => (
        <rect key={x} x={x - 9} y={-118 + (i === 0 || i === 3 ? 14 : 0)} width={18} height={70} rx={9} />
      ))}
      <path d="M-44,-60 L44,-60 L48,40 L-48,40 Z" />
      {/* thumb */}
      <rect x={-78} y={-40} width={20} height={62} rx={10} transform="rotate(-35 -68 -10)" />
      {/* cuff */}
      <path d="M-50,40 L50,40 L54,110 L-54,110 Z" className="cuff" />
    </g>
  );
}

function Gloves({ params }: ArtProps) {
  const c = str(params, 'color', '#d9b06a');
  return (
    <Ink>
      <g transform="translate(-62,0) rotate(-12)" fill={c}>
        <Glove />
      </g>
      <g transform="translate(66,0) rotate(12)" fill={c}>
        <Glove flip />
      </g>
      <path d="M-116,46 L-12,24 L-4,92 L-108,112 Z M116,46 L12,24 L4,92 L108,112 Z" fill="#555" opacity={0.85} />
    </Ink>
  );
}

function Boot({ x }: { x: number }) {
  return (
    <g transform={`translate(${x},0)`}>
      <path d="M-70,-120 L10,-120 L14,20 C60,24 100,40 110,70 L110,96 L-78,96 L-78,20 Z" fill="#8a5426" />
      <path d="M-82,96 L114,96 L114,118 L-82,118 Z" fill="#241d18" />
      <path d="M40,40 C70,44 96,56 106,72" fill="none" stroke="#5c3515" strokeWidth={2} />
      <path d="M-70,-120 L10,-120 L10,-104 L-70,-104 Z" fill="#5c3515" />
      {[-80, -56, -32, -8].map((y) => (
        <path key={y} d={`M-4,${y} L14,${y + 10}`} stroke="#f2d024" strokeWidth={2} />
      ))}
      <Shine d="M-60,-100 L-44,-100 L-44,80 L-60,80 Z" opacity={0.2} />
    </g>
  );
}

function Boots() {
  return (
    <Ink>
      <Boot x={-40} />
      <Boot x={30} />
    </Ink>
  );
}

function Sneakers({ params }: ArtProps) {
  const c = str(params, 'color', '#3b6fd8');
  return (
    <Ink>
      {[-18, 18].map((dy, i) => (
        <g key={i} transform={`translate(${i ? 8 : -8},${dy})`}>
          <path d="M-140,10 C-140,-30 -110,-40 -60,-40 C-20,-40 20,-10 80,-6 C120,-4 140,10 140,26 L-140,26 Z" fill={c} />
          <path d="M-144,26 L144,26 L144,40 L-144,40 Z" fill="#f4f4f4" />
          <path d="M-40,-30 L40,-8" stroke="#fff" strokeWidth={2} fill="none" />
        </g>
      ))}
    </Ink>
  );
}

export const ppe: Record<string, SpriteDef> = {
  hardhat: { draw: HardHat, bounds: () => [-150, -114, 160, 72] },
  cap: { draw: Cap, bounds: () => [-122, -90, 162, 62] },
  'safety-glasses': { draw: SafetyGlasses, bounds: () => [-94, -28, 94, 28] },
  vest: { draw: Vest, bounds: () => [-212, -242, 212, 242] },
  gloves: { draw: Gloves, bounds: () => [-140, -126, 140, 118] },
  boots: { draw: Boots, bounds: () => [-124, -122, 146, 120] },
  sneakers: { draw: Sneakers, bounds: () => [-152, -60, 152, 60] },
};
