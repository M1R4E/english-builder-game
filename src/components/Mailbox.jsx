import { useEffect, useRef, useState } from 'react';
import { LEVELS } from '../data/levels/index.js';
import Stars from './Stars.jsx';

const OPEN_MS = 550; // 우편함 문이 열리는 시간
const PICK_MS = 650; // 주문서를 꺼내는 시간
const MAX_DIFFICULTY = 5;

const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// 레벨 선택 = 우편함.
//  닫힌 우편함을 누르면 문이 열리고, 안에 주문서(레벨)들이 보인다.
//  주문서를 누르면 우편함 밖으로 꺼내는 연출 뒤에 그 레벨의 주문서 화면으로 넘어간다.
export default function Mailbox({ startOpen, progress, onOpened, onSelect, onBack }) {
  const [state, setState] = useState(startOpen ? 'open' : 'closed'); // closed → opening → open
  const [picked, setPicked] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const open = () => {
    if (state !== 'closed') return;
    setState('opening');
    timer.current = setTimeout(() => {
      setState('open');
      onOpened();
    }, reduceMotion() ? 50 : OPEN_MS);
  };

  const pick = (id) => {
    if (picked !== null) return;
    setPicked(id);
    timer.current = setTimeout(() => onSelect(id), reduceMotion() ? 50 : PICK_MS);
  };

  return (
    <main className="mailbox-screen">
      <button type="button" className="btn btn-ghost btn-small back-to-title" onClick={onBack}>
        ◀ 처음 화면
      </button>

      {state !== 'open' ? (
        <div className="mailbox-closed-wrap">
          <button
            type="button"
            className={`mailbox${state === 'opening' ? ' is-opening' : ''}`}
            onClick={open}
            aria-label="우편함 열기"
          >
            <span className="mailbox-post" />
            <span className="mailbox-body">
              <span className="mailbox-inner" />
              <span className="mailbox-door">
                <span className="mailbox-slot" />
                <span className="mailbox-label">MAIL</span>
              </span>
            </span>
            <span className="mailbox-flag" />
          </button>
          <p className="tap-hint">우편함을 눌러 주문서를 확인하세요</p>
        </div>
      ) : (
        <section className={`mailbox-open${picked !== null ? ' has-picked' : ''}`} aria-label="우편함 안의 주문서">
          <header className="mailbox-open-head">
            <span className="mailbox-open-title">우편함</span>
            <span className="muted small">주문서 {LEVELS.length}통</span>
          </header>
          <ul className="ticket-list">
            {LEVELS.map(({ level, problems }) => {
              const p = progress[level.id];
              const broken = problems.length > 0;
              const status = broken ? '준비 중' : p?.completed ? '완공' : p ? '공사 중' : '새 주문';
              const tilt = ((level.id * 7) % 5) - 2; // 주문서마다 살짝 다르게 기울이기
              return (
                <li key={level.id}>
                  <button
                    type="button"
                    className={`order-ticket${picked === level.id ? ' is-picked' : ''}`}
                    style={{ '--tilt': `${tilt * 0.8}deg` }}
                    disabled={broken || picked !== null}
                    onClick={() => pick(level.id)}
                    aria-label={`주문서 ${level.id}번 ${level.title}, 난이도 ${level.difficulty}, ${status}`}
                  >
                    <span className="ticket-no">No. {String(level.id).padStart(4, '0')}</span>
                    <span className="ticket-title">{level.title}</span>
                    <span className="ticket-difficulty">
                      <span className="ticket-label">난이도</span>
                      <span className="bricks" aria-hidden="true">
                        {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
                          <span key={i} className={i < level.difficulty ? 'brick on' : 'brick'} />
                        ))}
                      </span>
                    </span>
                    <span className="ticket-status">
                      <span className={`state-tag ${p?.completed ? 'ok' : broken ? 'warn' : 'mute'}`}>{status}</span>
                      {p && <Stars count={p.stars} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}
