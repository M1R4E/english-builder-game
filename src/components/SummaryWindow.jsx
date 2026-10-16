import Window from './Window.jsx';
import { formatWon, toWon } from '../game/money.js';

const dash = (v) => (v === null || v === undefined ? '-' : v);

const timeText = (sec) => {
  const m = Math.floor(sec / 60);
  return m > 0 ? `${m}분 ${sec % 60}초` : `${sec}초`;
};

// 결과 보고서: 학생이 이 화면 한 장을 캡처해서 설문지(구글 폼)에 첨부한다.
//  그래서 스크롤 없이 휴대폰 한 화면에 다 들어가게 작게 만들고, 움직이는 연출은 넣지 않는다.
//  점수는 0~100점 (게임 속 금액 ÷ 1,000)
export default function SummaryWindow({ summary, player, wallet, onClose }) {
  const s = summary;
  const now = new Date();
  const stamp = `${now.getMonth() + 1}/${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return (
    <Window title={s.allCompleted ? '최종 결과 보고서' : '중간 결과 보고서'} onClose={onClose} className="summary-window">
      <p className="summary-cta">이 화면을 캡처해서 설문지에 첨부해 주세요.</p>
      <dl className="summary-totals">
        <div><dt>완공</dt><dd>{s.completedCount} / {s.total}</dd></div>
        <div><dt>지갑</dt><dd>{formatWon(toWon(wallet))}</dd></div>
        <div><dt>평균 첫 점수</dt><dd>{dash(s.avgFirst)}</dd></div>
        <div><dt>평균 예상</dt><dd>{dash(s.avgPrediction)}</dd></div>
        <div><dt>평균 예상 오차</dt><dd>{dash(s.avgEstimateGap)}</dd></div>
        <div><dt>힌트 / 시간</dt><dd>{s.totalHints}단계 · {timeText(s.totalSec)}</dd></div>
      </dl>
      <table className="summary-table">
        <thead>
          <tr>
            <th>레벨</th>
            <th>예상</th>
            <th>첫 점수</th>
            <th>최고</th>
            <th>제출</th>
            <th>힌트</th>
            <th>완공</th>
          </tr>
        </thead>
        <tbody>
          {s.rows.map((r) => (
            <tr key={r.levelId} className={r.firstScore === null ? 'is-empty' : ''}>
              <td>{r.levelId}</td>
              <td>{dash(r.prediction)}</td>
              <td>{dash(r.firstScore)}</td>
              <td>{dash(r.bestScore)}</td>
              <td>{dash(r.attempts)}</td>
              <td>{dash(r.hints)}</td>
              <td>{r.completed ? `별${r.stars}` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="summary-foot">
        체험자 {player} · {stamp} · 점수는 100점 만점 (예상·첫 점수·제출·힌트는 처음 도전한 판 기준)
      </p>
      <div className="window-actions">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          닫기
        </button>
      </div>
    </Window>
  );
}
