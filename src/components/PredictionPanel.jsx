// 레벨 시작 전에 "내가 받을 점수"를 예상해 보는 단계 (메타인지).
export default function PredictionPanel({ value, onChange, onStart }) {
  return (
    <div className="card-box prediction">
      <h2>🔮 시작하기 전에 예상해 보세요</h2>
      <p>이 의뢰에서 몇 점을 받을 것 같나요?</p>
      <div className="prediction-value" aria-live="polite">
        {value}점
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="예상 점수"
        className="slider"
      />
      <div className="slider-ends">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
      <p className="muted small">
        정답을 맞히는 활동이 아니에요. 내 예상과 실제 결과를 비교해 보기 위한 것이고, 문장 점수에는 영향을 주지 않아요.
      </p>
      <button type="button" className="btn btn-submit btn-wide" onClick={onStart}>
        🏗️ 이 점수로 예상하고 시작하기
      </button>
    </div>
  );
}
