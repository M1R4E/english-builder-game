// 주문서 다시 보기 버튼: 화면 위쪽에서 삐져나온 종이 쪽지.
// 마우스를 올리면 쪽지가 조금 더 내려오고, 아래에 "주문서"라는 글자가 나타난다.
export default function OrderSlip({ onClick }) {
  return (
    <button type="button" className="order-slip" onClick={onClick} aria-label="주문서 다시 보기">
      <span className="order-slip-paper" aria-hidden="true">
        <span className="order-slip-line" />
        <span className="order-slip-line short" />
        <span className="order-slip-line" />
      </span>
      <span className="order-slip-label" aria-hidden="true">
        주문서
      </span>
    </button>
  );
}
