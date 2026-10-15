// 아이콘 버튼. 평소에는 아이콘만 보이고, 마우스를 올리거나(키보드로 고르면) 옆으로 펼쳐지며 글자가 나타난다.
// 터치 화면에서도 누르면 바로 작동한다. 화면 읽기 프로그램을 위해 글자는 항상 aria-label로 알려 준다.
export default function IconButton({ icon: Icon, label, onClick, disabled = false, className = '', title }) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={title}
    >
      <Icon />
      <span className="icon-btn-label" aria-hidden="true">
        {label}
      </span>
    </button>
  );
}
