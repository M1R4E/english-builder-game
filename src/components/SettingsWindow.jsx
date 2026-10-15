import { useState } from 'react';
import { DIFFICULTIES } from '../game/storage.js';
import Window from './Window.jsx';

// 설정 창. 게임 중에도(상단 톱니바퀴) 우편함에서도 열 수 있다.
//  - 난이도: 문장은 그대로 두고 도움의 양만 바꾼다 (기획 결정 ④)
//  - 단어 뜻 보기: 단어를 고를 때 한국어 뜻을 함께 보여 준다
//  - (우편함에서만) 새 체험자 시작, 기록 내보내기 — 학술제 진행자용
const HELP_TEXT = {
  easy: '문법 설명과 방마다 "누가?", "무엇을?" 같은 안내가 보이고, 틀린 모양의 자재(예: sleeped)는 미리 빼 둬요. 단어 뜻도 처음부터 보여요.',
  normal: '레벨 1~3에서만 문법 설명이 보여요. 힌트는 언제든 쓸 수 있어요.',
  hard: '문법 설명과 안내를 숨겨요. 힌트는 언제든 쓸 수 있어요.',
};

export default function SettingsWindow({ settings, onChange, onClose, player, onNewPlayer, onExport, onPostSurvey }) {
  const [confirming, setConfirming] = useState(false);

  const setDifficulty = (difficulty) =>
    onChange({ ...settings, difficulty, showMeanings: DIFFICULTIES[difficulty].showMeanings });

  return (
    <Window title="설정" onClose={onClose} className="settings-window">
      <section className="settings-block">
        <h3>난이도</h3>
        <div className="segmented" role="radiogroup" aria-label="난이도">
          {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={settings.difficulty === key}
              className={settings.difficulty === key ? 'is-on' : ''}
              onClick={() => setDifficulty(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="settings-help">{HELP_TEXT[settings.difficulty]}</p>
      </section>

      <section className="settings-block">
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.showMeanings}
            onChange={(e) => onChange({ ...settings, showMeanings: e.target.checked })}
          />
          <span className="toggle-track" aria-hidden="true" />
          <span>
            <b>단어 뜻 보기</b>
            <span className="settings-help">단어를 고를 때 한국어 뜻을 함께 보여 줘요.</span>
          </span>
        </label>
      </section>

      {onNewPlayer && (
        <section className="settings-block settings-admin">
          <h3>진행자용</h3>
          <p className="settings-help">
            지금 체험자: <b>{player}</b> (이름 같은 개인 정보는 저장하지 않아요)
          </p>
          <div className="settings-actions">
            {confirming ? (
              <>
                <span className="settings-help">새 체험자로 처음부터 시작할까요? 지금까지의 기록은 그대로 남아요.</span>
                <button type="button" className="btn btn-small btn-primary" onClick={() => { setConfirming(false); onNewPlayer(); }}>
                  새로 시작
                </button>
                <button type="button" className="btn btn-small btn-ghost" onClick={() => setConfirming(false)}>
                  취소
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-small btn-ghost" onClick={() => setConfirming(true)}>
                  새 체험자 시작
                </button>
                <button type="button" className="btn btn-small btn-ghost" onClick={onExport}>
                  기록 내보내기 (CSV)
                </button>
                {onPostSurvey && (
                  <button type="button" className="btn btn-small btn-ghost" onClick={onPostSurvey}>
                    사후 설문
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      )}

      <div className="window-actions">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          확인
        </button>
      </div>
    </Window>
  );
}
