import { useCallback, useState } from 'react';
import Mailbox from './components/Mailbox.jsx';
import PlayScreen from './components/PlayScreen.jsx';
import ShowcaseBackground from './components/ShowcaseBackground.jsx';
import TitleScreen from './components/TitleScreen.jsx';
import { findLevel } from './data/levels/index.js';

// 화면 전환: 메인 화면 → 우편함(레벨 선택) → 레벨 플레이
// (주소(URL)를 바꾸는 라우터를 쓰지 않아 GitHub Pages에서도 문제없이 작동한다.)
export default function App() {
  const [screen, setScreen] = useState('title'); // 'title' | 'mailbox' | 'play'
  const [mailboxOpened, setMailboxOpened] = useState(false); // 한 번 연 우편함은 돌아와도 열려 있게
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

  if (screen === 'play' && level) {
    // key를 레벨 번호로 주면, 레벨을 다시 열 때마다 새 판으로 시작한다.
    return (
      <PlayScreen
        key={level.id}
        level={level}
        onExit={() => setScreen('mailbox')}
        onProgress={handleProgress}
      />
    );
  }

  return (
    <div className={`front front-${screen}`}>
      {/* 메인 화면에서는 견본 건물이 1초마다 바뀌고, 우편함 화면에서는 작은 집 한 채가 흐릿하게 천천히 돈다 */}
      <ShowcaseBackground cycling={screen === 'title'} still={1} />
      {screen === 'title' ? (
        <TitleScreen onStart={() => setScreen('mailbox')} />
      ) : (
        <Mailbox
          startOpen={mailboxOpened}
          progress={progress}
          onOpened={() => setMailboxOpened(true)}
          onBack={() => setScreen('title')}
          onSelect={(id) => {
            setLevelId(id);
            setScreen('play');
          }}
        />
      )}
    </div>
  );
}
