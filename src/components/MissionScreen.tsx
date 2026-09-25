import { useCallback, useEffect, useState } from 'react';
import { getMission } from '../engine/content';
import { useT } from '../engine/i18n';
import { useMission } from '../engine/store';
import { Stage } from '../three/Stage';
import { DemoLayer } from './hud/Demo';
import { Overlay } from './hud/Overlay';
import { Results } from './hud/Results';
import { StepPanel } from './hud/StepPanel';
import { TopBar } from './hud/TopBar';
import { go } from './router';

export function MissionScreen({ id }: { id: string }) {
  const mission = getMission(id);
  const start = useMission((s) => s.start);
  const exit = useMission((s) => s.exit);
  const status = useMission((s) => s.status);
  const current = useMission((s) => s.mission);
  const [attempt, setAttempt] = useState(0);
  const [scene, setScene] = useState(0);
  const [lost, setLost] = useState(false);
  const onContextLost = useCallback(() => setLost(true), []);
  const t = useT();

  useEffect(() => {
    if (mission) start(mission);
    return () => exit();
  }, [mission, attempt, start, exit]);

  if (!mission) {
    return (
      <div className="screen center">
        <p>{t('ui.notFound')}</p>
        <button type="button" className="btn" onClick={() => go('/')}>
          {t('ui.back')}
        </button>
      </div>
    );
  }
  if (current?.id !== mission.id) return <div className="screen center loading">…</div>;
  return (
    <div className="mission-screen" data-testid="mission" data-mission={mission.id} data-status={status}>
      <div className="stage">
        <Stage key={`${mission.id}:${attempt}:${scene}`} mission={mission} onContextLost={onContextLost} />
        {lost ? (
          <button
            type="button"
            className="scene-lost"
            onClick={() => {
              setLost(false);
              setScene((n) => n + 1);
            }}
          >
            🔄 {t('ui.sceneLost')}
          </button>
        ) : null}
        <Overlay key={`o:${mission.id}:${attempt}`} />
      </div>
      <TopBar />
      {status === 'playing' ? <StepPanel /> : null}
      {status === 'failed' || status === 'done' ? <Results onRetry={() => setAttempt((a) => a + 1)} /> : null}
      <DemoLayer />
    </div>
  );
}
