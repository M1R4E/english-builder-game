import { useEffect } from 'react';
import Fireworks from './Fireworks.jsx';

export const CELEBRATION_MS = 2600; // 완공 연출이 끝나고 점검 보고서가 뜨기까지의 시간

// 건물 완공 연출: 화면 가득 폭죽 + "건물 완공!" 글자.
// (건물이 한 바퀴 돌며 튀어 오르는 3D 연출은 BuildingRenderer.celebrate가 동시에 한다)
// 정해진 시간이 지나거나 화면을 누르면 끝난다(onDone).
export default function CompletionCelebration({ onDone }) {
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(onDone, reduce ? 1000 : CELEBRATION_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <button type="button" className="celebration" onClick={onDone} aria-label="건물 완공! 누르면 점검 보고서로 넘어가요">
      <Fireworks spread={2.6} className="fireworks-full" />
      <span className="celebration-banner" role="status">
        건물 완공!
      </span>
      <span className="celebration-sub">누르면 점검 보고서로 넘어가요</span>
    </button>
  );
}
