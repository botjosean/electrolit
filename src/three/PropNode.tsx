import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useLayoutEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { dragSources, dragTargets, hintTargets, interactiveProps } from '../engine/logic';
import { useMission } from '../engine/store';
import type { PropDef } from '../engine/types';
import { propRegistry } from './props';

export type Role = 'none' | 'click' | 'source' | 'target' | 'probe';

function useRole(id: string): Role {
  return useMission((s) => {
    const step = s.mission?.steps[s.stepIndex];
    if (!step || s.status !== 'playing' || s.step.done) return 'none';
    if (step.type === 'drag-connect') {
      if (dragSources(step).includes(id)) return s.step.connections[id] === step.pairs[id] ? 'none' : 'source';
      if (dragTargets(step).includes(id)) return 'target';
      return 'none';
    }
    if (step.type === 'measure') return step.points.includes(id) ? 'probe' : 'none';
    if (step.type === 'click') return interactiveProps(step).includes(id) && !s.step.clicked.includes(id) ? 'click' : 'none';
    return 'none';
  });
}

const GLOW_HOVER = new THREE.Color('#ffd84a');
const GLOW_HINT = new THREE.Color('#ffb300');
const GLOW_SELECT = new THREE.Color('#38d9ff');
const GLOW_IDLE = new THREE.Color('#fff2b0');

interface MatRec {
  mat: THREE.MeshStandardMaterial;
  base: THREE.Color;
  baseI: number;
}

export function setControlsEnabled(controls: unknown, v: boolean) {
  if (controls && typeof controls === 'object' && 'enabled' in controls) (controls as { enabled: boolean }).enabled = v;
}

export function PropNode({ def }: { def: PropDef }) {
  const Comp = propRegistry[def.kind];
  const hidden = useMission((s) => !!s.hidden[def.id]);
  const moved = useMission((s) => s.moved[def.id]);
  const hinted = useMission((s) => {
    const step = s.mission?.steps[s.stepIndex];
    return !!step && s.hintActive && hintTargets(step, s.step).includes(def.id);
  });
  const selected = useMission((s) => s.step.selectedSource === def.id || s.dragging === def.id);
  const role = useRole(def.id);
  const dispatch = useMission((s) => s.dispatch);
  const controls = useThree((s) => s.controls);
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [box, setBox] = useState<{ size: THREE.Vector3; center: THREE.Vector3 } | null>(null);
  const mats = useRef<MatRec[]>([]);
  const lastLevel = useRef(-1);

  // collect materials for the glow + compute a generous hit box (touch friendly)
  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const recs: MatRec[] = [];
    i.traverse((obj) => {
      const m = (obj as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && 'emissive' in m && !recs.some((r) => r.mat === m)) recs.push({ mat: m, base: m.emissive.clone(), baseI: m.emissiveIntensity });
    });
    mats.current = recs;
    o.updateWorldMatrix(true, true);
    const wb = new THREE.Box3().setFromObject(i);
    const wp = new THREE.Vector3();
    o.getWorldPosition(wp);
    const size = wb.getSize(new THREE.Vector3());
    const center = wb.getCenter(new THREE.Vector3()).sub(wp);
    size.set(Math.max(size.x * 1.15, 0.09), Math.max(size.y * 1.15, 0.06), Math.max(size.z * 1.15, 0.09));
    setBox({ size, center });
  }, [def.kind, hidden]);

  useFrame(({ clock }, dt) => {
    const o = outer.current;
    if (o && moved) {
      const target = new THREE.Vector3(...moved);
      o.position.lerp(target, Math.min(1, dt * 6));
    }
    const time = clock.elapsedTime;
    let level = 0;
    let color = GLOW_IDLE;
    if (hinted) {
      level = 0.45 + 0.35 * Math.sin(time * 7);
      color = GLOW_HINT;
    } else if (selected) {
      level = 0.55;
      color = GLOW_SELECT;
    } else if (hovered && role !== 'none') {
      level = 0.4;
      color = GLOW_HOVER;
    } else if (role !== 'none') {
      level = 0.07 + 0.06 * Math.sin(time * 2.4);
    }
    if (Math.abs(level - lastLevel.current) < 0.005) return;
    lastLevel.current = level;
    for (const r of mats.current) {
      r.mat.emissive.copy(r.base).lerp(color, Math.min(1, level));
      r.mat.emissiveIntensity = level > 0 ? Math.max(1, r.baseI) : r.baseI;
    }
  });

  if (!Comp || hidden) return null;

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (role === 'none') return;
    e.stopPropagation();
    if (e.delta > 10) return;
    const st = useMission.getState();
    if (role === 'click') dispatch({ type: 'click', id: def.id });
    else if (role === 'probe') dispatch({ type: 'probe', id: def.id });
    else if (role === 'source') st.selectSource(def.id);
    else if (role === 'target') {
      if (st.step.selectedSource) dispatch({ type: 'connect', src: st.step.selectedSource, tgt: def.id });
    }
  };
  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (role !== 'source') return;
    e.stopPropagation();
    setControlsEnabled(controls, false);
    const st = useMission.getState();
    st.selectSource(def.id);
    st.setDragging(def.id);
  };
  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    const st = useMission.getState();
    if (role !== 'target' || !st.dragging) return;
    e.stopPropagation();
    const src = st.dragging;
    st.setDragging(null);
    setControlsEnabled(controls, true);
    dispatch({ type: 'connect', src, tgt: def.id });
  };

  const interactive = role !== 'none';
  return (
    <group ref={outer} name={`prop:${def.id}`} position={def.pos}>
      <group
        onClick={interactive ? onClick : undefined}
        onPointerDown={interactive ? onPointerDown : undefined}
        onPointerUp={interactive ? onPointerUp : undefined}
        onPointerOver={
          interactive
            ? (e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
              }
            : undefined
        }
        onPointerOut={
          interactive
            ? () => {
                setHovered(false);
                document.body.style.cursor = '';
              }
            : undefined
        }
      >
        <group ref={inner} rotation={def.rot ?? [0, 0, 0]} scale={def.scale ?? 1}>
          <Comp params={def.params ?? {}} />
        </group>
        {interactive && box ? (
          <mesh name="hitbox" position={box.center} renderOrder={-1}>
            <boxGeometry args={[box.size.x, box.size.y, box.size.z]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}

/** World-space center of a prop (its hit box if any). */
export function propWorldCenter(scene: THREE.Object3D, id: string): THREE.Vector3 | null {
  const o = scene.getObjectByName(`prop:${id}`);
  if (!o) return null;
  o.updateWorldMatrix(true, true);
  const hb = o.getObjectByName('hitbox');
  const box = new THREE.Box3().setFromObject(hb ?? o);
  if (box.isEmpty()) return o.getWorldPosition(new THREE.Vector3());
  return box.getCenter(new THREE.Vector3());
}
