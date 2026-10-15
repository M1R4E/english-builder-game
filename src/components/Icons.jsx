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

// 계단: 층과 층을 잇는 계단
export function IconStairs() {
  return (
    <svg {...base}>
      <path d="M4 20h5v-5h5v-5h6V4" />
    </svg>
  );
}

// 장식: 화분
export function IconPlant() {
  return (
    <svg {...base}>
      <path d="M7 14h10l-1.5 6h-7z" />
      <path d="M12 14V8" />
      <path d="M12 9c0-3 2-5 5-5 0 3-2 5-5 5z" />
      <path d="M12 11c0-2-1.5-4-4-4 0 2 1.5 4 4 4z" />
    </svg>
  );
}

// 집: 메인 화면으로
export function IconHome() {
  return (
    <svg {...base}>
      <path d="M3 11 12 4l9 7" />
      <path d="M6 10v10h12V10" />
      <path d="M10 20v-5h4v5" />
    </svg>
  );
}

// 우편함: 우편함(레벨 선택)으로
export function IconMailbox() {
  return (
    <svg {...base}>
      <path d="M4 11a5 5 0 0 1 10 0v8H4z" />
      <path d="M9 6h7a5 5 0 0 1 5 5v8h-7" />
      <path d="M17 6V2h3" />
      <path d="M9 19v3" />
    </svg>
  );
}

// 전구: 힌트
export function IconBulb() {
  return (
    <svg {...base}>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" />
    </svg>
  );
}

// 뒤로 가는 화살표: 되돌리기
export function IconUndo() {
  return (
    <svg {...base}>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}

// 쓰레기통: 비우기
export function IconTrash() {
  return (
    <svg {...base}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

// 톱니바퀴: 설정
export function IconGear() {
  return (
    <svg {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </svg>
  );
}

// 자물쇠: 아직 차례가 오지 않은 공정
export function IconLock() {
  return (
    <svg {...base}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// 체크: 다 지은 공정
export function IconCheck() {
  return (
    <svg {...base}>
      <path d="m5 12 5 5 9-10" />
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
