import { Bounds, Center, OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { getTerm } from '../engine/glossary';
import { useT } from '../engine/i18n';
import { RichText } from '../engine/richText';
import { speakEnglish, speechSupported } from '../engine/speech';
import { useSettings } from '../engine/store';
import { useUi } from '../engine/ui';
import { termQueries } from '../engine/videos';
import { propRegistry } from '../three/props';
import { VideoLinks } from './hud/VideoLinks';

/** Frees the viewer's WebGL context as soon as it closes (phones have few contexts). */
function Release() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    return () => {
      setTimeout(() => {
        if (!canvas.isConnected) {
          gl.dispose();
          gl.forceContextLoss();
        }
      }, 0);
    };
  }, [gl]);
  return null;
}

/** Close-up of a single object: big, auto-rotating, drag to turn, pinch/scroll to zoom. */
export function ObjectViewer() {
  const target = useUi((s) => s.viewer);
  const open = useUi((s) => s.openViewer);
  const lang = useSettings((s) => s.lang);
  const t = useT();
  useEffect(() => {
    if (!target) return;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && open(null);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [target, open]);
  if (!target) return null;
  const Comp = propRegistry[target.kind];
  if (!Comp) return null;
  const term = target.termId ? getTerm(target.termId) : undefined;
  return (
    <div className="modal-backdrop viewer-backdrop" onClick={() => open(null)} data-testid="viewer">
      <div className="viewer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={term?.term ?? t(target.labelKey ?? '')}>
        <div className="viewer-stage">
          <Canvas dpr={[1, 2]} camera={{ fov: 35, near: 0.001, far: 50, position: [0.35, 0.28, 0.45] }}>
            <color attach="background" args={['#262c33']} />
            <hemisphereLight args={['#ffffff', '#3a3f46', 1.1]} />
            <directionalLight position={[1, 2, 1.5]} intensity={2.2} />
            <directionalLight position={[-1.5, 1, -1]} intensity={0.7} />
            <Bounds fit clip observe margin={1.3}>
              <Center>
                <Comp params={target.params ?? {}} />
              </Center>
            </Bounds>
            <OrbitControls makeDefault autoRotate autoRotateSpeed={2} enablePan={false} enableDamping />
            <Release />
          </Canvas>
          <button type="button" className="icon-btn viewer-close" onClick={() => open(null)} aria-label={t('ui.close')} data-testid="viewer-close">
            ✕
          </button>
          <div className="viewer-hint">{t('ui.viewer.hint')}</div>
        </div>
        <div className="viewer-info">
          {term ? (
            <>
              <div className="viewer-title">
                <h2>{term.term}</h2>
                {speechSupported() ? (
                  <button type="button" className="icon-btn" onClick={() => speakEnglish(term.say ?? term.term)} aria-label={t('ui.term.listen')}>
                    🔊
                  </button>
                ) : null}
              </div>
              <div className="viewer-es">{term.es}</div>
              <p>{lang === 'es' ? term.explanation_es : term.explanation_en}</p>
              <VideoLinks {...termQueries(term)} />
            </>
          ) : (
            <h2>
              <RichText text={t(target.labelKey ?? '')} interactive={false} />
            </h2>
          )}
        </div>
      </div>
    </div>
  );
}

/** Button that opens the viewer for a glossary term (renders nothing if it has no model). */
export function View3DButton({ termId, className = 'btn small' }: { termId: string; className?: string }) {
  const term = getTerm(termId);
  const open = useUi((s) => s.openViewer);
  const t = useT();
  if (!term?.model) return null;
  return (
    <button type="button" className={`${className} view3d-btn`} onClick={() => open({ kind: term.model!.kind, params: term.model!.params, termId })} data-view3d={termId}>
      🧊 {t('ui.viewer.open')}
    </button>
  );
}
