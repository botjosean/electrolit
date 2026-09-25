import type { Speaker } from '../../engine/types';
import { Ink } from './common';

interface Look {
  shirt: string;
  pants: string;
  skin: string;
  hat: string;
  hair: string;
  vest: boolean;
  mustache: boolean;
  ponytail: boolean;
  belt: boolean;
}

export const LOOKS: Record<Speaker, Look> = {
  foreman: { shirt: '#3a5a8c', pants: '#2c3e5c', skin: '#e0ac86', hat: '#f5f5f0', hair: '#6b4a2b', vest: true, mustache: true, ponytail: false, belt: false },
  instructor: { shirt: '#9b3b3b', pants: '#34495e', skin: '#b98262', hat: '#1d6fd8', hair: '#1e140c', vest: false, mustache: false, ponytail: true, belt: true },
};

/** Head + hard hat centered at (0,0), ~300 mm tall. */
function Head({ look }: { look: Look }) {
  return (
    <g>
      {look.ponytail ? <path d="M60,-10 C120,10 120,110 80,150 C70,100 60,60 40,30 Z" fill={look.hair} /> : null}
      <rect x={-34} y={80} width={68} height={60} rx={20} fill={look.skin} />
      <ellipse cx={0} cy={20} rx={98} ry={110} fill={look.skin} />
      <ellipse cx={-98} cy={30} rx={16} ry={24} fill={look.skin} />
      <ellipse cx={98} cy={30} rx={16} ry={24} fill={look.skin} />
      <ellipse cx={-36} cy={20} rx={11} ry={14} fill="#1a1a1a" stroke="none" />
      <ellipse cx={36} cy={20} rx={11} ry={14} fill="#1a1a1a" stroke="none" />
      <circle cx={-32} cy={15} r={4} fill="#fff" stroke="none" />
      <circle cx={40} cy={15} r={4} fill="#fff" stroke="none" />
      <path d="M-58,-14 Q-36,-26 -16,-14 M16,-14 Q36,-26 58,-14" fill="none" stroke={look.hair} strokeWidth={3} />
      {look.mustache ? <path d="M-44,66 Q0,44 44,66 Q24,78 0,66 Q-24,78 -44,66 Z" fill={look.hair} /> : null}
      <path d={look.mustache ? 'M-24,88 Q0,100 24,88' : 'M-30,70 Q0,96 30,70'} fill="none" strokeWidth={3} />
      {/* hard hat */}
      <path d="M-128,-34 L128,-34 Q140,-34 140,-22 L-140,-22 Q-140,-34 -128,-34 Z" fill={look.hat} />
      <path d="M-106,-30 C-106,-130 -50,-162 0,-162 C50,-162 106,-130 106,-30 Z" fill={look.hat} />
      <path d="M-22,-160 L22,-160 L20,-30 L-20,-30 Z" fill={look.hat} />
      <path d="M-86,-60 C-80,-110 -50,-136 -24,-144 C-50,-120 -66,-90 -70,-60 Z" fill="#ffffff" opacity={0.4} stroke="none" />
    </g>
  );
}

/** Standing figure, feet at y=0, ~1750 mm tall. */
export function Figure({ who }: { who: Speaker }) {
  const look = LOOKS[who];
  return (
    <Ink>
      {/* legs + boots */}
      <path d="M-120,-860 L-10,-860 L-20,-40 L-110,-40 Z M10,-860 L120,-860 L110,-40 L20,-40 Z" fill={look.pants} />
      <path d="M-130,-60 L-10,-60 L0,0 L-140,0 Z M10,-60 L130,-60 L140,0 L0,0 Z" fill="#4a2f1a" />
      {/* arms */}
      <path d="M-200,-1370 L-150,-1380 L-130,-900 L-190,-890 Z" fill={look.shirt} />
      <path d="M150,-1380 L200,-1370 L190,-890 L130,-900 Z" fill={look.shirt} />
      <circle cx={-160} cy={-870} r={34} fill={look.skin} />
      <circle cx={160} cy={-870} r={34} fill={look.skin} />
      {/* torso */}
      <path d="M-170,-1400 L170,-1400 L150,-850 L-150,-850 Z" fill={look.shirt} />
      {look.vest ? (
        <g>
          <path d="M-170,-1390 L-60,-1390 L0,-1200 L60,-1390 L170,-1390 L150,-860 L-150,-860 Z" fill="#c6f21b" />
          <path d="M-165,-1060 L165,-1060 L163,-1020 L-163,-1020 Z M-160,-960 L160,-960 L158,-920 L-158,-920 Z" fill="#dfe6ea" />
        </g>
      ) : null}
      {look.belt ? (
        <g>
          <rect x={-156} y={-900} width={312} height={50} fill="#3b2412" />
          <rect x={70} y={-910} width={90} height={150} rx={10} fill="#6b4a2b" />
          <rect x={86} y={-960} width={14} height={60} fill="#d42a2a" />
          <rect x={112} y={-950} width={14} height={50} fill="#1d4fbf" />
        </g>
      ) : null}
      <g transform="translate(0,-1560)">
        <Head look={look} />
      </g>
    </Ink>
  );
}

/** Round avatar portrait for the HUD. */
export function Portrait({ who, size = 44 }: { who: Speaker; size?: number }) {
  const look = LOOKS[who];
  return (
    <svg width={size} height={size} viewBox="-190 -200 380 380" aria-hidden>
      <clipPath id={`pc-${who}`}>
        <circle cx={0} cy={-10} r={185} />
      </clipPath>
      <g clipPath={`url(#pc-${who})`}>
        <rect x={-200} y={-200} width={400} height={400} fill={who === 'foreman' ? '#3a4350' : '#2c3a4d'} />
        <path d="M-180,180 L-150,130 Q0,90 150,130 L180,180 Z" fill={look.vest ? '#c6f21b' : look.shirt} stroke="#1d232a" strokeWidth={4} />
        <g transform="translate(0,-20) scale(0.95)">
          <Ink w={1.2}>
            <Head look={look} />
          </Ink>
        </g>
      </g>
    </svg>
  );
}
