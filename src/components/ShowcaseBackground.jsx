import { useEffect, useMemo, useState } from 'react';
import { buildParts } from '../building/buildParts.js';
import { SHOWCASE_BLUEPRINTS, SHOWCASE_BOUNDS } from '../building/showcase.js';
import BuildingView from './BuildingView.jsx';

const INTERVAL_MS = 1000; // 견본 건물을 바꾸는 간격 (1초)

// 메인 화면·우편함 화면 뒤의 3D 배경.
// cycling이 true면 견본 건물을 1초마다 다음 것으로 바꾼다.
// 바꿀 때마다 건물을 모두 지우고 1층부터 다시 지어 올린다 (깃발·울타리·나무는 마지막에 등장).
// 화면을 누를 수 있도록 마우스 조작은 끄고, 카메라는 천천히 돈다.
export default function ShowcaseBackground({ cycling, still = 0 }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!cycling) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % SHOWCASE_BLUEPRINTS.length), INTERVAL_MS);
    return () => clearInterval(id);
  }, [cycling]);

  const shown = cycling ? index : still;
  const { parts } = useMemo(() => buildParts(SHOWCASE_BLUEPRINTS[shown], { labels: false }), [shown]);

  return (
    <div className="showcase" aria-hidden="true">
      <BuildingView
        parts={parts}
        bounds={SHOWCASE_BOUNDS}
        interactive={false}
        autoRotate
        rebuildKey={shown}
        buildSeconds={0.45}
      />
    </div>
  );
}
