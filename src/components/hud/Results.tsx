import { useState } from 'react';
import { nextMissionId } from '../../engine/content';
import { useT } from '../../engine/i18n';
import { RichText } from '../../engine/richText';
import { useMission } from '../../engine/store';
import type { BossMood } from '../../engine/types';
import { go } from '../router';
import { Avatar, OrderBox } from './StepPanel';

const VARIANTS: Record<BossMood, number> = { great: 3, ok: 3, slow: 2, sloppy: 2, fail: 3 };

/** Deterministic boss line per mission + mood. */
export function bossPhraseId(missionId: string, mood: BossMood) {
  let h = 0;
  for (const c of missionId) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `boss_${mood}_${(h % VARIANTS[mood]) + 1}`;
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-row">
      <span className="score-label">{label}</span>
      <span className="score-bar">
        <span style={{ width: `${value}%` }} className={value >= 80 ? 'hi' : value >= 50 ? 'mid' : 'lo'} />
      </span>
      <span className="score-val">{value}</span>
    </div>
  );
}

export function Results({ onRetry }: { onRetry: () => void }) {
  const result = useMission((s) => s.result);
  const mission = useMission((s) => s.mission);
  const t = useT();
  const [copied, setCopied] = useState(false);
  if (!result || !mission) return null;
  const share = async () => {
    const url = `${location.origin}${location.pathname}#/mission/${mission.id}`;
    const text = t('ui.results.shareText', { title: t(mission.title), score: result.scores.total, stars: '★'.repeat(result.scores.stars) });
    try {
      if (navigator.share) await navigator.share({ title: 'Electrician Sim US', text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
      }
    } catch {
      /* user cancelled */
    }
  };
  const next = nextMissionId(mission.id);
  const { scores } = result;
  return (
    <div className="overlay" data-testid="results" data-failed={result.failed}>
      <div className={`results ${result.failed ? 'failed' : 'passed'}`}>
        {result.failed ? (
          <>
            <div className="results-kicker danger">⚠️ {t('ui.results.safetyFail')}</div>
            <h2>{t('ui.results.failTitle')}</h2>
            <div className="fail-explain" data-testid="fail-explain">
              <RichText text={t(result.failKey ?? 'safety.generic')} />
            </div>
            <p className="fail-rule">{t('ui.results.failRule')}</p>
          </>
        ) : (
          <>
            <div className="results-kicker">{t('ui.results.complete')}</div>
            <h2>{t(mission.title)}</h2>
            <div className="stars" aria-label={`${scores.stars}/3`}>
              {[1, 2, 3].map((i) => (
                <span key={i} className={i <= scores.stars ? 'on' : ''}>
                  ★
                </span>
              ))}
            </div>
            <div className="scores">
              <Bar label={`🦺 ${t('ui.results.safety')}`} value={scores.safety} />
              <Bar label={`🎯 ${t('ui.results.correctness')}`} value={scores.correctness} />
              <Bar label={`⏱ ${t('ui.results.speed')}`} value={scores.speed} />
            </div>
            <div className="total">
              {t('ui.results.total')}: <strong>{scores.total}</strong> · {Math.floor(scores.elapsed / 60)}:{String(scores.elapsed % 60).padStart(2, '0')} ·{' '}
              {t('ui.results.mistakes', { n: result.mistakes })}
            </div>
          </>
        )}
        <div className="boss">
          <div className="boss-title">{t('ui.results.boss')}</div>
          <div className="boss-line">
            <Avatar who="foreman" small />
            <OrderBox id={bossPhraseId(mission.id, result.mood)} />
          </div>
        </div>
        <div className="results-actions">
          <button type="button" className="btn" onClick={onRetry} data-testid="retry">
            ↻ {t('ui.results.retry')}
          </button>
          {!result.failed && next ? (
            <button type="button" className="btn primary" onClick={() => go(`/mission/${next}`)} data-testid="next-mission">
              {t('ui.results.next')} →
            </button>
          ) : null}
          {!result.failed ? (
            <button type="button" className="btn" onClick={share} data-testid="share">
              📣 {copied ? t('ui.results.copied') : t('ui.results.share')}
            </button>
          ) : null}
          <button type="button" className="btn" onClick={() => go(`/module/${mission.module}`)} data-testid="to-module">
            {t('ui.results.toModule')}
          </button>
        </div>
      </div>
    </div>
  );
}
