// 점검 보고서 아래쪽의 학습 활동
//  - 생각해 보기(자기 설명): 정답으로 지었을 때 짧은 질문 하나("왜 이렇게 지었나요?"). 고르기만 하면 되고,
//    답하지 않아도 된다. 점수와 관계없다. (질문이 정답을 전제로 하므로 정답일 때만 보여 준다)
//  - 비교해 보기(대조 학습): 완공했을 때, 비슷하지만 뜻이 다른 문장들을 나란히 보여 준다.
//  - 정답 예시 보기: 두 번 이상 제출했는데 아직 완공하지 못했을 때 열 수 있다. 감점은 없고 기록에만 남는다.
export default function LearningExtras({ level, completed, perfect, attemptCount, selfExplain, onSelfExplain, viewedAnswer, onViewAnswer }) {
  const q = level.selfExplain;
  const canSeeAnswer = !completed && attemptCount >= 2;

  return (
    <>
      {perfect && q && (
        <section className="report-section learn-block">
          <h3>생각해 보기</h3>
          <p className="learn-question">{q.question}</p>
          <div className="learn-options">
            {q.options.map((opt, i) => {
              const picked = selfExplain?.choice === i;
              return (
                <button
                  key={opt.text}
                  type="button"
                  className={`learn-option${picked ? (opt.correct ? ' is-right' : ' is-picked') : ''}`}
                  onClick={() => onSelfExplain({ choice: i, correct: Boolean(opt.correct) })}
                  aria-pressed={picked}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
          {selfExplain ? (
            <p className="learn-feedback">
              <span className={`state-tag ${selfExplain.correct ? 'ok' : 'info'}`}>{selfExplain.correct ? '좋은 설명' : '다시 생각해 보기'}</span>{' '}
              {q.explain}
            </p>
          ) : (
            <p className="muted small">답하지 않아도 괜찮아요. 점수와는 관계없어요.</p>
          )}
        </section>
      )}

      {completed && level.contrast?.length > 0 && (
        <section className="report-section learn-block">
          <h3>비교해 보기</h3>
          <ul className="contrast-list">
            {level.contrast.map((c) => (
              <li key={c.sentence} className={c.mine ? 'is-mine' : ''}>
                <span className="contrast-sentence">{c.sentence}</span>
                <span className="contrast-meaning">{c.meaning}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {canSeeAnswer && (
        <section className="report-section learn-block">
          <h3>정답 예시</h3>
          {viewedAnswer ? (
            <>
              <p className="model-answer">
                <span className="model-answer-label">정답 예시</span>
                {level.answers.main}
              </p>
              <p className="muted small">정답을 참고해도 감점은 없어요. 예시와 비교하며 건물을 다시 고쳐 지어 보세요.</p>
            </>
          ) : (
            <button type="button" className="btn btn-ghost btn-small" onClick={onViewAnswer}>
              정답 예시 보기
            </button>
          )}
        </section>
      )}
    </>
  );
}
