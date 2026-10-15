// 폭죽 연출. 작은 점들이 한 점에서 사방으로 퍼지며 사라진다 (CSS 애니메이션만 사용).
const COLORS = ['#e58f65', '#f2c14e', '#5b8fd9', '#3f9a6b', '#d9584a', '#b98fd9'];
const BURSTS = [
  { x: 18, y: 18, delay: 0 },
  { x: 80, y: 12, delay: 0.35 },
  { x: 50, y: 30, delay: 0.7 },
  { x: 28, y: 42, delay: 1.05 },
  { x: 72, y: 38, delay: 1.3 },
];
const PARTICLES = 16;

// spread: 퍼지는 거리 배율 (화면 전체에 터뜨릴 때는 크게), className: 위치·크기를 바꿀 때
export default function Fireworks({ spread = 1, className = '' }) {
  return (
    <div className={`fireworks ${className}`} aria-hidden="true">
      {BURSTS.map((b, i) => (
        <div key={i} className="burst" style={{ left: `${b.x}%`, top: `${b.y}%` }}>
          {Array.from({ length: PARTICLES }, (_, k) => {
            const angle = (k / PARTICLES) * Math.PI * 2;
            const dist = (55 + (k % 3) * 12) * spread;
            return (
              <span
                key={k}
                style={{
                  '--dx': `${Math.cos(angle) * dist}px`,
                  '--dy': `${Math.sin(angle) * dist}px`,
                  '--delay': `${b.delay}s`,
                  background: COLORS[(k + i) % COLORS.length],
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
