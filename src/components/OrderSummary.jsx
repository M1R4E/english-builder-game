// 플레이 중 화면 왼쪽 위에 붙어 있는 작은 주문 요약 메모.
// 주문서를 열지 않아도 "완성할 문장의 뜻"과 "특별 요청 사항"을 한눈에 볼 수 있다.
// 제출한 뒤에는 요청마다 충족/다시 확인 표시가 붙는다. 머리를 누르면 접고 펼 수 있다(작은 화면에서는 처음에 접힘).
function conditionStatus(cond, result) {
  if (!result) return null;
  const ids = cond.checkIds ?? [cond.checkId];
  return ids.every((id) => result.checks.find((c) => c.id === id)?.status === 'pass') ? 'pass' : 'fail';
}

export default function OrderSummary({ level, result, open, onToggle }) {
  return (
    <aside className={`order-summary${open ? ' is-open' : ''}`} aria-label="주문 요약">
      <button type="button" className="order-summary-head" onClick={onToggle} aria-expanded={open}>
        <span>주문 요약</span>
        <span aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="order-summary-body">
          <p className="order-summary-label">완성할 문장의 뜻</p>
          <p className="order-summary-meaning">{level.meaning.text}</p>
          {level.conditions?.length > 0 && (
            <>
              <p className="order-summary-label">특별 요청</p>
              <ul className="order-summary-conds">
                {level.conditions.map((cond) => {
                  const status = conditionStatus(cond, result);
                  return (
                    <li key={cond.id}>
                      {cond.short}
                      {status === 'pass' && <span className="state-tag ok">충족</span>}
                      {status === 'fail' && <span className="state-tag warn">다시 확인</span>}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
