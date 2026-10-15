// 단계별 힌트 창. 카드 판 바로 위에 작게 뜬다 (건물과 카드를 가리지 않도록).
// 힌트 버튼을 누를 때마다 한 단계씩 더 구체적인 힌트가 펼쳐진다. 힌트를 써도 점수는 깎이지 않는다.
const NAMES = ['생각해 볼 방향', '문법 단서', '선택 도움'];

export default function HintWindow({ steps, hintStep, bottom, onClose }) {
  return (
    <aside className="hint-window" style={{ bottom }} aria-live="polite" aria-label="힌트">
      <button type="button" className="window-close" onClick={onClose} aria-label="힌트 닫기">
        ×
      </button>
      <h2 className="window-title">힌트 {hintStep}/{steps.length}</h2>
      <ol>
        {steps.slice(0, hintStep).map((text, i) => (
          <li key={text}>
            <b>{NAMES[i] ?? `힌트 ${i + 1}`}</b>
            <span>{text}</span>
          </li>
        ))}
      </ol>
      {hintStep >= steps.length && <p className="muted small">준비된 힌트를 모두 열었어요.</p>}
    </aside>
  );
}
