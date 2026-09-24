import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useMission, type WireLink } from '../engine/store';
import { useUi } from '../engine/ui';
import type { CameraShot, Mission } from '../engine/types';
import { Characters } from './Characters';
import { Environment } from './env/Environments';
import { PropNode, propWorldCenter, setControlsEnabled } from './PropNode';
import { Projector } from './Projector';
import { screenApi } from './screen';

declare global {
  interface Window {
    __sim?: Record<string, unknown>;
  }
}

/** Camera shot in effect for the current step (the last one defined at or before it). */
function useShot(): { shot: CameraShot | null; key: string } {
  const idx = useMission((s) => {
    if (!s.mission) return -2;
    for (let i = s.stepIndex; i >= 0; i--) if (s.mission.steps[i].camera) return i;
    return -1;
  });
  const mission = useMission((s) => s.mission);
  if (!mission) return { shot: null, key: 'none' };
  if (idx >= 0) return { shot: mission.steps[idx].camera!, key: `${mission.id}:${idx}` };
  return { shot: mission.camera ?? null, key: `${mission.id}:init` };
}

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function CameraRig() {
  const { shot, key } = useShot();
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as unknown as { target: THREE.Vector3; update: () => void } | null;
  const size = useThree((s) => s.size);
  const anim = useRef<{ fromP: THREE.Vector3; fromT: THREE.Vector3; toP: THREE.Vector3; toT: THREE.Vector3; t: number } | null>(null);
  const first = useRef(true);

  const inset = useUi((s) => s.panelInset);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!shot || !controls) return;
    // keep `w` meters visible inside the area not covered by the HUD panel
    const toT = new THREE.Vector3(...shot.target);
    const dist = new THREE.Vector3(...shot.pos).distanceTo(toT);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const want = shot.w ?? 2 * dist * tanHalf * 1.6 * 0.8;
    const freeAspect = (size.width - inset.right) / Math.max(1, size.height);
    const visible = 2 * dist * tanHalf * freeAspect;
    const f = THREE.MathUtils.clamp(want / visible, 1, 3);
    const toP = new THREE.Vector3(...shot.pos).sub(toT).multiplyScalar(f).add(toT);
    if (first.current) {
      first.current = false;
      camera.position.copy(toP);
      controls.target.copy(toT);
      controls.update();
      anim.current = null;
      window.__sim = { ...(window.__sim ?? {}), camSettled: true };
      return;
    }
    anim.current = { fromP: camera.position.clone(), fromT: controls.target.clone(), toP, toT, t: 0 };
    window.__sim = { ...(window.__sim ?? {}), camSettled: false };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, controls, size.width, size.height, inset.right]);

  useFrame((_, dt) => {
    // shift the projection so the scene is centered in the area not covered by the HUD panel
    const tx = inset.right / 2;
    const ty = inset.bottom / 2;
    const o = offset.current;
    if (Math.abs(o.x - tx) > 0.5 || Math.abs(o.y - ty) > 0.5 || !camera.view) {
      o.x += (tx - o.x) * Math.min(1, dt * 8);
      o.y += (ty - o.y) * Math.min(1, dt * 8);
      camera.setViewOffset(size.width, size.height, o.x, o.y, size.width, size.height);
    } else if (camera.view && (camera.view.fullWidth !== size.width || camera.view.fullHeight !== size.height)) {
      camera.setViewOffset(size.width, size.height, o.x, o.y, size.width, size.height);
    }
    const a = anim.current;
    const offsetMoving = Math.abs(o.x - tx) > 0.5 || Math.abs(o.y - ty) > 0.5;
    const settled = !a && !offsetMoving;
    if (window.__sim && window.__sim.camSettled !== settled) window.__sim.camSettled = settled;
    if (!a || !controls) return;
    a.t = Math.min(1, a.t + dt / 0.9);
    const k = ease(a.t);
    camera.position.lerpVectors(a.fromP, a.toP, k);
    controls.target.lerpVectors(a.fromT, a.toT, k);
    controls.update();
    if (a.t >= 1) anim.current = null;
  });
  return null;
}

const UP = new THREE.Vector3(0, 1, 0);

/** Cylinder segment between two points (visible thick "wire"). */
function orientSegment(mesh: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3) {
  const d = new THREE.Vector3().subVectors(b, a);
  const len = d.length();
  mesh.position.copy(a).addScaledVector(d, 0.5);
  mesh.scale.set(1, Math.max(0.0001, len), 1);
  if (len > 1e-6) mesh.quaternion.setFromUnitVectors(UP, d.normalize());
}

function DragLine() {
  const dragging = useMission((s) => s.dragging);
  const scene = useThree((s) => s.scene);
  const controls = useThree((s) => s.controls);
  const seg = useRef<THREE.Mesh>(null);
  const tip = useRef<THREE.Mesh>(null);
  const plane = useMemo(() => new THREE.Plane(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const color = useMission((s) => {
    const p = s.mission?.props.find((x) => x.id === s.dragging);
    return String(p?.params?.color ?? '#38d9ff');
  });

  useEffect(() => {
    const up = () => {
      const st = useMission.getState();
      if (st.dragging) {
        st.setDragging(null);
        setControlsEnabled(controls, true);
      }
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [controls]);

  useFrame(({ raycaster, pointer, camera }) => {
    if (!dragging || !seg.current || !tip.current) return;
    const a = propWorldCenter(scene, dragging);
    if (!a) return;
    plane.set(UP, -a.y);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectPlane(plane, hit)) return;
    orientSegment(seg.current, a, hit);
    tip.current.position.copy(hit);
  });

  if (!dragging) return null;
  return (
    <group>
      <mesh ref={seg} raycast={() => null}>
        <cylinderGeometry args={[0.008, 0.008, 1, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
      <mesh ref={tip} raycast={() => null}>
        <sphereGeometry args={[0.022, 10, 8]} />
        <meshStandardMaterial color="#38d9ff" emissive="#38d9ff" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function WireTube({ w }: { w: WireLink }) {
  const scene = useThree((s) => s.scene);
  const geo = useMemo(() => {
    const a = propWorldCenter(scene, w.from);
    const b = propWorldCenter(scene, w.to);
    if (!a || !b) return null;
    const mid = a.clone().lerp(b, 0.5);
    mid.y -= Math.min(0.15, a.distanceTo(b) * 0.2);
    const curve = new THREE.CatmullRomCurve3([a, mid, b]);
    return new THREE.TubeGeometry(curve, 24, 0.007, 8, false);
  }, [scene, w.from, w.to]);
  if (!geo) return null;
  return (
    <mesh geometry={geo} castShadow raycast={() => null}>
      <meshStandardMaterial color={w.color} roughness={0.4} />
    </mesh>
  );
}

function Wires() {
  const wires = useMission((s) => s.wires);
  return (
    <>
      {wires.map((w) => (
        <WireTube key={`${w.from}>${w.to}`} w={w} />
      ))}
    </>
  );
}

function ProbeTip({ id, color }: { id: string; color: string }) {
  const scene = useThree((s) => s.scene);
  const pos = useMemo(() => propWorldCenter(scene, id), [scene, id]);
  if (!pos) return null;
  return (
    <group position={pos}>
      <mesh position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]} raycast={() => null}>
        <coneGeometry args={[0.012, 0.05, 10]} />
        <meshStandardMaterial color="#cfcfcf" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.13, 0]} raycast={() => null}>
        <cylinderGeometry args={[0.014, 0.014, 0.12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function Probes() {
  const isMeasure = useMission((s) => s.mission?.steps[s.stepIndex]?.type === 'measure');
  const red = useMission((s) => s.step.probes.red);
  const black = useMission((s) => s.step.probes.black);
  if (!isMeasure) return null;
  return (
    <>
      {red ? <ProbeTip id={red} color="#d42020" /> : null}
      {black ? <ProbeTip id={black} color="#161616" /> : null}
    </>
  );
}

/** Test/e2e hook: project prop centers to client pixels. */
function DebugBridge() {
  const { scene, camera, gl } = useThree();
  useEffect(() => {
    const project = (id: string) => {
      const c = propWorldCenter(scene, id);
      if (!c) return null;
      const v = c.clone().project(camera);
      const r = gl.domElement.getBoundingClientRect();
      return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height, visible: v.z < 1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1 };
    };
    // names of the props under a client pixel, nearest first (diagnostics for e2e)
    const hitTest = (x: number, y: number) => {
      const r = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
      const rc = new THREE.Raycaster();
      rc.setFromCamera(ndc, camera);
      const names: string[] = [];
      for (const h of rc.intersectObjects(scene.children, true)) {
        let o: THREE.Object3D | null = h.object;
        while (o && !o.name) o = o.parent;
        const n = o ? `${o.name}${h.object.name === 'hitbox' ? '[hit]' : ''}` : '?';
        if (names[names.length - 1] !== n) names.push(n);
        if (names.length > 6) break;
      }
      return names;
    };
    screenApi.project = project;
    window.__sim = { ...(window.__sim ?? {}), project, hitTest };
    return () => {
      if (screenApi.project === project) screenApi.project = null;
    };
  }, [scene, camera, gl]);
  return null;
}

function PropsLayer({ mission }: { mission: Mission }) {
  return (
    <>
      {mission.props.map((p) => (
        <PropNode key={p.id} def={p} />
      ))}
    </>
  );
}

export function Stage({ mission }: { mission: Mission }) {
  const selectSource = useMission((s) => s.selectSource);
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.6, 2.5], fov: 50, near: 0.05, far: 200 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      onPointerMissed={() => {
        if (useMission.getState().step.selectedSource) selectSource(null);
      }}
    >
      <Environment kind={mission.env} />
      <PropsLayer mission={mission} />
      <Characters />
      <DragLine />
      <Wires />
      <Probes />
      <Projector />
      <OrbitControls makeDefault enableDamping dampingFactor={0.12} minDistance={0.25} maxDistance={14} maxPolarAngle={Math.PI / 2 - 0.05} />
      <CameraRig />
      <DebugBridge />
    </Canvas>
  );
}

