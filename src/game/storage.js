// ── 브라우저 저장소 (localStorage) ──
// 진행 상황, 설정, 학습 기록을 브라우저에 저장한다. 새로고침해도 남는다.
// 주의: 저장소는 이 브라우저(기기)에만 있다. 다른 기기와는 공유되지 않고, 브라우저 데이터를 지우면 사라진다.
//
// 개인 정보(이름 등)는 저장하지 않는다. 체험자는 익명 번호(P001, P002 …)로만 구분한다.
//
// 저장 모양 (key: STORAGE_KEY)
// {
//   version: 1,
//   settings: { difficulty: 'normal', showMeanings: false },
//   currentPlayer: 'P001',
//   players: {
//     P001: { createdAt, progress: { [레벨 번호]: { completed, stars, opened, bestPay } }, records: [기록…], survey: { pre, post } }
//   }
// }

export const STORAGE_KEY = 'sentence-builder:v1';

export const DIFFICULTIES = {
  easy: { label: '쉬움', showMeanings: true },
  normal: { label: '보통', showMeanings: false },
  hard: { label: '어려움', showMeanings: false },
};

export const DEFAULT_SETTINGS = { difficulty: 'normal', showMeanings: false };

const playerId = (n) => `P${String(n).padStart(3, '0')}`;

export function newPlayer(now = Date.now()) {
  return { createdAt: now, progress: {}, records: [], survey: {} };
}

export function emptyData(now = Date.now()) {
  return { version: 1, settings: { ...DEFAULT_SETTINGS }, currentPlayer: playerId(1), players: { [playerId(1)]: newPlayer(now) } };
}

// 저장된 값을 읽는다. 없거나 망가졌으면 새로 시작한다 (게임이 멈추지 않도록).
export function loadData(storage = globalThis.localStorage, now = Date.now()) {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyData(now);
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !data.players || !data.players[data.currentPlayer]) return emptyData(now);
    data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
    return data;
  } catch {
    return emptyData(now);
  }
}

// 저장한다. 저장할 수 없는 환경(사생활 보호 모드 등)이어도 게임은 계속된다.
export function saveData(data, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// 새 체험자: 다음 번호로 새 기록을 시작한다. 이전 체험자의 기록은 그대로 남는다.
export function startNewPlayer(data, now = Date.now()) {
  const numbers = Object.keys(data.players).map((id) => Number(id.slice(1)) || 0);
  const id = playerId(Math.max(0, ...numbers) + 1);
  return { ...data, currentPlayer: id, players: { ...data.players, [id]: newPlayer(now) } };
}

// 지금 체험자의 정보를 바꾼다
export function updatePlayer(data, fn) {
  const id = data.currentPlayer;
  return { ...data, players: { ...data.players, [id]: fn(data.players[id]) } };
}

// 레벨 기록 추가 또는 바꾸기 (같은 playId면 바꾼다)
export function upsertRecord(player, record) {
  const others = player.records.filter((r) => r.playId !== record.playId);
  return { ...player, records: [...others, record] };
}

// 지갑: 레벨마다 가장 많이 받은 최종 공사 대금(점수 기준)을 더한다 → 같은 레벨을 반복해도 계속 쌓이지는 않는다
export function walletPoints(progress) {
  return Object.values(progress).reduce((s, p) => s + (p.bestPay ?? 0), 0);
}
