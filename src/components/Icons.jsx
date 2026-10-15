// 주문서 품목 앞에 붙는 단색 아이콘. 글자 색(currentColor)을 그대로 따라간다.
const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

// 층: 층이 쌓인 집
export function IconFloor() {
  return (
    <svg {...base}>
      <path d="M3 11 12 4l9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M5 15h14" />
    </svg>
  );
}

// 기둥: 위아래 받침이 있는 기둥
export function IconPillar() {
  return (
    <svg {...base}>
      <path d="M6 4h12" />
      <path d="M6 20h12" />
      <path d="M9 4v16" />
      <path d="M15 4v16" />
    </svg>
  );
}

// 칸: 방 안의 상자
export function IconRoom() {
  return (
    <svg {...base}>
      <rect x="4" y="7" width="16" height="12" rx="1" />
      <path d="M4 11h16" />
      <path d="M10 15h4" />
    </svg>
  );
}
