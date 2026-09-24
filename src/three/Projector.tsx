import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// DOM overlay anchored to 3D points (labels, name tags, inspect hotspots) without drei <Html>,
// which creates one React root per label and crashes on unmount with React 19.
// Elements register with `trackAnchor` and carry one of:
//   data-prop="<propId>"  → top of that prop     data-char="<who>" → above that character
//   data-world="x,y,z"    → fixed world point
export const anchorEls = new Set<HTMLElement>();

export function trackAnchor(el: HTMLElement | null) {
  if (el) anchorEls.add(el);
}
export function untrackDetached() {
  for (const el of anchorEls) if (!el.isConnected) anchorEls.delete(el);
}

const v = new THREE.Vector3();
const box = new THREE.Box3();

function anchorPoint(scene: THREE.Scene, el: HTMLElement): THREE.Vector3 | null {
  const d = el.dataset;
  if (d.world) {
    const [x, y, z] = d.world.split(',').map(Number);
    return v.set(x, y, z);
  }
  if (d.char) {
    const o = scene.getObjectByName(`char:${d.char}`);
    if (!o) return null;
    o.getWorldPosition(v);
    v.y += 2.08;
    return v;
  }
  if (d.prop) {
    const o = scene.getObjectByName(`prop:${d.prop}`);
    if (!o) return null;
    box.setFromObject(o);
    if (box.isEmpty()) return null;
    box.getCenter(v);
    v.y = box.max.y + 0.05;
    return v;
  }
  return null;
}

export function Projector() {
  const scene = useThree((s) => s.scene);
  useFrame(({ camera, size }) => {
    untrackDetached();
    for (const el of anchorEls) {
      const p = anchorPoint(scene, el);
      if (!p) {
        el.style.visibility = 'hidden';
        continue;
      }
      p.project(camera);
      const behind = p.z > 1;
      const x = ((p.x + 1) / 2) * size.width;
      const y = ((1 - p.y) / 2) * size.height;
      el.style.visibility = behind ? 'hidden' : 'visible';
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  });
  return null;
}
