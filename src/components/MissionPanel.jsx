// 건축 의뢰: 레벨 제목, 의뢰 내용, 목표 의미, 특별 조건.
// 제출한 뒤에는 특별 조건 옆에 충족 여부를 아이콘 + 글자로 표시한다.
export default function MissionPanel({ level, result }) {
  return (
    <div className="card-box mission">
      <h2>📜 건축 의뢰 · 레벨 {level.id} 「{level.title}」</h2>
      <p>{level.request}</p>
      <p className="meaning">
        <span className="tag">뜻</span> {level.meaningKo}
      </p>
      {level.conditions?.length > 0 && (
        <ul className="conditions">
          {level.conditions.map((cond) => {
            const status = result?.checks.find((c) => c.id === cond.checkId)?.status;
            return (
              <li key={cond.id}>
                <span className="tag tag-cond">특별 조건</span> {cond.text}
                {status === 'pass' && <span className="cond-state ok"> ✅ 충족</span>}
                {status && status !== 'pass' && <span className="cond-state no"> ⚠️ 다시 확인</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
