import { useCallback, useState } from 'react';
import LevelSelect from './components/LevelSelect.jsx';
import PlayScreen from './components/PlayScreen.jsx';
import { findLevel } from './data/levels/index.js';

// 화면 전환: 레벨 선택 ↔ 레벨 플레이
// (주소(URL)를 바꾸는 라우터를 쓰지 않아 GitHub Pages에서도 문제없이 작동한다.)
export default function App() {
  const [levelId, setLevelId] = useState(null);
  // 레벨별 진행 상황 { [레벨 번호]: { completed, stars } }
  // 지금은 새로고침하면 사라진다. 4단계에서 브라우저 저장소에 저장하도록 바꾼다.
  const [progress, setProgress] = useState({});

  const level = levelId !== null ? findLevel(levelId) : null;

  const handleProgress = useCallback((id, p) => {
    setProgress((prev) => {
      const old = prev[id];
      // 별과 완공 여부는 더 좋은 기록만 남긴다.
      const merged = {
        completed: Boolean(old?.completed || p.completed),
        stars: Math.max(old?.stars ?? 0, p.stars),
      };
      return old && old.completed === merged.completed && old.stars === merged.stars ? prev : { ...prev, [id]: merged };
    });
  }, []);

  // key를 레벨 번호로 주면, 레벨을 다시 열 때마다 새 판으로 시작한다.
  return level ? (
    <PlayScreen key={level.id} level={level} onExit={() => setLevelId(null)} onProgress={handleProgress} />
  ) : (
    <LevelSelect progress={progress} onSelect={setLevelId} />
  );
}
