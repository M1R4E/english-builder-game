import { useState } from 'react';
import Window from './Window.jsx';

// 사전·사후 설문 창 (5점 척도). 모든 문항에 답해야 "제출"이 눌린다. "건너뛰기"도 할 수 있다.
export default function SurveyWindow({ title, scale, questions, onSubmit, onSkip }) {
  const [answers, setAnswers] = useState({});
  const done = questions.every((q) => answers[q.id]);

  return (
    <Window title={title} className="survey-window">
      <p className="settings-help">정답은 없어요. 지금 내 마음과 가장 가까운 것을 골라 주세요. 이름은 저장하지 않아요.</p>
      <ol className="survey-list">
        {questions.map((q) => (
          <li key={q.id}>
            <p className="survey-q">{q.text}</p>
            <div className="survey-scale" role="radiogroup" aria-label={q.text}>
              {scale.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={answers[q.id] === i + 1}
                  className={answers[q.id] === i + 1 ? 'is-on' : ''}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i + 1 }))}
                >
                  <b>{i + 1}</b>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="window-actions">
        <button type="button" className="btn btn-ghost" onClick={onSkip}>
          건너뛰기
        </button>
        <button type="button" className="btn btn-primary" disabled={!done} onClick={() => onSubmit(answers)}>
          제출
        </button>
      </div>
    </Window>
  );
}
