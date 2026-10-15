// 단계별 힌트. 힌트 버튼을 누를 때마다 한 단계씩 더 구체적인 힌트가 펼쳐진다.
// 힌트를 써도 점수는 깎이지 않는다.
export default function HintBox({ steps, hintStep }) {
  if (hintStep === 0) return null;
  const names = ['생각해 볼 방향', '문법 단서', '선택 도움'];
  return (
    <div className="card-box hint-box" aria-live="polite">
      <h2>💡 힌트</h2>
      <ol>
        {steps.slice(0, hintStep).map((text, i) => (
          <li key={text}>
            <b>{names[i] ?? `힌트 ${i + 1}`}:</b> {text}
          </li>
        ))}
      </ol>
    </div>
  );
}
