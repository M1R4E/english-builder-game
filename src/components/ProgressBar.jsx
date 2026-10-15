import { useEffect, useRef } from 'react';
import { getSteps, getUnits, isChosen } from '../game/structure.js';
import { IconCheck, IconLock } from './Icons.jsx';

// 공정 진행 표시: 층수 → 방들 → 계단 → 위층 방들 … 순서대로 놓인 칸.
//  다 지은 칸 : 체크 표시 + 색. 누르면 그 방을 고쳐 지을 수 있다.
//  지금 칸    : 노란 테두리 + "공사 중" + 세부 단계(예: 2/4 개수)
//  아직 차례가 아닌 칸: 회색 + 자물쇠
//  제출 결과 고칠 점이 있는 칸: "!" 표시
export default function ProgressBar({ level, choices, current, errorRefs, onEdit }) {
  const steps = getSteps(level, choices);
  const units = getUnits(level, choices);
  const barRef = useRef(null);

  // 좁은 화면에서는 가로로 밀리므로, 지금 칸이 보이도록 옮겨 준다
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector('.progress-chip.is-current');
    if (!bar || !chip || bar.scrollWidth <= bar.clientWidth) return;
    const left = chip.getBoundingClientRect().left - bar.getBoundingClientRect().left + bar.scrollLeft;
    if (left < bar.scrollLeft || left + chip.offsetWidth > bar.scrollLeft + bar.clientWidth) {
      bar.scrollTo({ left: left - 12, behavior: 'smooth' });
    }
  }, [current?.key]);

  return (
    <ol className="progress-bar" ref={barRef} aria-label="공정 진행 상황">
      {units.map((u) => {
        const mine = steps.filter((s) => s.unit === u.unit);
        const done = mine.length > 0 && mine.every((s) => isChosen(s, choices)) && current?.unit !== u.unit;
        const isCurrent = current?.unit === u.unit;
        const state = isCurrent ? 'current' : done ? 'done' : 'locked';
        const warn = errorRefs.includes(u.unit);
        const index = isCurrent ? mine.findIndex((s) => s.key === current.key) + 1 : 0;
        return (
          <li key={u.unit}>
            <button
              type="button"
              className={`progress-chip is-${state}${u.role ? ` role-${u.role}` : ''}${warn ? ' has-error' : ''}`}
              disabled={state === 'locked'}
              onClick={() => onEdit(u.unit)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`${u.name}: ${state === 'done' ? '완료, 누르면 고쳐 짓기' : state === 'current' ? '공사 중' : '아직 차례가 아님'}${warn ? ', 고칠 점 있음' : ''}`}
            >
              <span className="progress-icon" aria-hidden="true">
                {warn ? '!' : state === 'done' ? <IconCheck /> : state === 'locked' ? <IconLock /> : '●'}
              </span>
              <span className="progress-name">{u.name}</span>
              {isCurrent && (
                <span className="progress-sub">
                  공사 중{mine.length > 1 ? ` ${index}/${mine.length}` : ''}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
