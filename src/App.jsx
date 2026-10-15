import { useCallback, useEffect, useMemo, useState } from 'react';
import Mailbox from './components/Mailbox.jsx';
import PlayScreen from './components/PlayScreen.jsx';
import SettingsWindow from './components/SettingsWindow.jsx';
import SurveyWindow from './components/SurveyWindow.jsx';
import ShowcaseBackground from './components/ShowcaseBackground.jsx';
import TitleScreen from './components/TitleScreen.jsx';
import { findLevel, LEVELS } from './data/levels/index.js';
import { SURVEY } from './data/survey.js';
import { pickNextLevel } from './game/progress.js';
import { recommend, recordsToCsv } from './game/records.js';
import { loadData, saveData, startNewPlayer, updatePlayer, upsertRecord, walletPoints } from './game/storage.js';

// 고장 나지 않은(데이터 검사를 통과한) 레벨만
const PLAYABLE = LEVELS.filter((e) => e.problems.length === 0).map((e) => e.level);

// 기록 파일 내려받기 (진행자가 버튼을 눌렀을 때만)
function downloadCsv(text) {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `문장건축가_기록_${stamp}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 화면 전환: 메인 화면 → 우편함(레벨 선택) → 레벨 플레이
// (주소(URL)를 바꾸는 라우터를 쓰지 않아 GitHub Pages에서도 문제없이 작동한다.)
// 진행 상황·설정·학습 기록은 브라우저 저장소에 저장한다 (game/storage.js).
export default function App() {
  const [data, setData] = useState(() => loadData());
  const [screen, setScreen] = useState('title'); // 'title' | 'mailbox' | 'play'
  const [mailboxOpened, setMailboxOpened] = useState(false); // 한 번 연 우편함은 돌아와도 열려 있게
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [postSurveyOpen, setPostSurveyOpen] = useState(false);
  const [levelId, setLevelId] = useState(null);
  const [playKey, setPlayKey] = useState(0); // 레벨을 열 때마다 새 판
  const [playId, setPlayId] = useState(null); // 학습 기록 하나를 구분하는 번호 (레벨을 열 때마다 새로)

  // 바뀔 때마다 저장
  useEffect(() => {
    saveData(data);
  }, [data]);

  const player = data.players[data.currentPlayer];
  const { progress, records } = player;
  const level = levelId !== null ? findLevel(levelId) : null;

  const openLevel = useCallback((id) => {
    setData((d) =>
      updatePlayer(d, (p) => ({
        ...p,
        progress: { ...p.progress, [id]: { completed: false, stars: 0, bestPay: 0, ...p.progress[id], opened: true } },
      })));
    setLevelId(id);
    setPlayId(`L${id}-${Date.now()}`);
    setPlayKey((k) => k + 1);
    setScreen('play');
  }, []);

  // 별·완공·최종 공사 대금은 더 좋은 기록만 남긴다
  const handleProgress = useCallback((id, p) => {
    setData((d) =>
      updatePlayer(d, (pl) => {
        const old = pl.progress[id] ?? {};
        const merged = {
          ...old,
          completed: Boolean(old.completed || p.completed),
          stars: Math.max(old.stars ?? 0, p.stars),
          bestPay: Math.max(old.bestPay ?? 0, p.finalPay ?? 0),
        };
        const same = ['completed', 'stars', 'bestPay'].every((k) => old[k] === merged[k]);
        return same ? pl : { ...pl, progress: { ...pl.progress, [id]: merged } };
      }));
  }, []);

  const handleRecord = useCallback((record) => {
    setData((d) => updatePlayer(d, (pl) => upsertRecord(pl, record)));
  }, []);

  const setSettings = useCallback((settings) => setData((d) => ({ ...d, settings })), []);

  // 설문 답 저장 (게임 점수와 따로)
  const saveSurvey = (kind, value) =>
    setData((d) => updatePlayer(d, (pl) => ({ ...pl, survey: { ...pl.survey, [kind]: { ...value, at: Date.now() } } })));
  const needPreSurvey = SURVEY.enabled && screen === 'mailbox' && !player.survey?.pre;

  // "다음 레벨로" 후보: 진행 상황이 바뀔 때(완공해서 다음 난이도가 열릴 때 등) 다시 고른다
  const nextLevel = useMemo(
    () => (level ? pickNextLevel(level, PLAYABLE, progress) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [level?.id, progress],
  );
  const recommendation = useMemo(() => recommend(PLAYABLE, progress, records), [progress, records]);

  const settingsWindow = settingsOpen && (
    <SettingsWindow
      settings={data.settings}
      onChange={setSettings}
      onClose={() => setSettingsOpen(false)}
      player={data.currentPlayer}
      onNewPlayer={() => {
        setData((d) => startNewPlayer(d));
        setMailboxOpened(false);
        setSettingsOpen(false);
        setScreen('title');
      }}
      onExport={() => downloadCsv(recordsToCsv(data.players))}
      onPostSurvey={
        SURVEY.enabled
          ? () => {
              setSettingsOpen(false);
              setPostSurveyOpen(true);
            }
          : null
      }
    />
  );

  if (screen === 'play' && level) {
    return (
      <PlayScreen
        key={`${level.id}-${playKey}`}
        playId={playId}
        level={level}
        settings={data.settings}
        onSettingsChange={setSettings}
        onExit={() => setScreen('mailbox')}
        onProgress={handleProgress}
        onRecord={handleRecord}
        nextLevel={nextLevel}
        onNext={() => nextLevel && openLevel(nextLevel.id)}
      />
    );
  }

  return (
    <div className={`front front-${screen}`}>
      {/* 메인 화면에서는 견본 건물이 1초마다 바뀌고, 우편함 화면에서는 작은 집 한 채가 흐릿하게 천천히 돈다 */}
      <ShowcaseBackground cycling={screen === 'title'} still={0} />
      {screen === 'title' ? (
        <TitleScreen onStart={() => setScreen('mailbox')} />
      ) : (
        <Mailbox
          levels={PLAYABLE}
          broken={LEVELS.filter((e) => e.problems.length > 0).map((e) => e.level)}
          startOpen={mailboxOpened}
          progress={progress}
          wallet={walletPoints(progress)}
          recommendation={recommendation}
          onOpened={() => setMailboxOpened(true)}
          onBack={() => setScreen('title')}
          onSelect={openLevel}
          onSettings={() => setSettingsOpen(true)}
        />
      )}
      {settingsWindow}
      {needPreSurvey && (
        <SurveyWindow
          title="시작 전 설문"
          scale={SURVEY.scale}
          questions={SURVEY.pre}
          onSubmit={(answers) => saveSurvey('pre', { answers })}
          onSkip={() => saveSurvey('pre', { skipped: true })}
        />
      )}
      {postSurveyOpen && (
        <SurveyWindow
          title="마친 뒤 설문"
          scale={SURVEY.scale}
          questions={SURVEY.post}
          onSubmit={(answers) => {
            saveSurvey('post', { answers });
            setPostSurveyOpen(false);
          }}
          onSkip={() => setPostSurveyOpen(false)}
        />
      )}
    </div>
  );
}
