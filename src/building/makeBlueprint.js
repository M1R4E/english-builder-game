import { COMPLETE_THRESHOLD } from '../config.js';
import { compParts, compRef, firstOpenStep, getSteps, isRequired, resolveAll, roomName } from '../game/structure.js';

// ── 공정 선택 → 건물 설계도 ──
// 3D 코드와 분리된 순수 계산이다. "어떤 부품이 어떤 상태인지"만 정한다.
//
// 문법 ↔ 건축 대응 (자세한 설명은 game/structure.js)
//  층 = 절, 방 = 문장 성분(문장 순서대로 왼쪽→오른쪽), 계단 = 접속사
//  방 안: 가구 = 중심 단어(복수면 가구 2개), 문패 = 관사, 카펫 = 꾸미는 형용사, 출입문 = 전치사, 받침대 = be동사
//  동사 가구의 재질 = 시제 (현재: 밝은 나무 "지금 자재" / 과거: 회색 돌 "옛날 자재" / -ing: 하늘색)
//  층의 방이 모두 지어지면 그 층의 지붕, 완공(70점 이상)이면 깃발·울타리·나무
//
// 방 상태: 'ghost' 아직 시작 전(반투명) / 'building' 짓는 중 / 'done' 다 지음

export const ROOM_WIDTH = { core: 2.6, mod: 1.9 };

export function makeBlueprint(level, choices, result = null, { activeUnit = null } = {}) {
  const floorsChosen = choices.floors === level.floors.length;
  const errorRefs = new Set(result?.errorRefs ?? []);
  const completed = Boolean(result && result.total >= COMPLETE_THRESHOLD);
  if (!floorsChosen) {
    return { floors: [], stairs: [], completed, success: false, activeUnit, maxWidth: ROOM_WIDTH.core * 2 };
  }

  const all = resolveAll(level, choices);
  const steps = getSteps(level, choices);
  const open = firstOpenStep(level, choices);
  const started = (unit) => steps.some((s) => s.unit === unit && choices[s.key] !== undefined) || open?.unit === unit;

  const floors = level.floors.map((floor, f) => {
    const rooms = floor.comps.map((comp, i) => {
      const r = all.floors[f].comps[i];
      const ref = compRef(f, comp);
      const parts = compParts(comp, r.word);
      const state = r.done ? 'done' : started(ref) ? 'building' : 'ghost';
      return {
        ref,
        role: comp.role,
        kind: isRequired(comp) ? 'core' : 'mod',
        name: roomName(level, f, comp),
        state,
        active: activeUnit === ref,
        warn: errorRefs.has(ref),
        word: r.word ? (r.form?.text ?? r.word.text) : null,
        wordPos: r.word?.pos ?? null,
        plural: r.form?.number === 'pl',
        tense: comp.type === 'verb' ? (r.finite?.tense ?? null) : null,
        det: parts.includes('det') && r.det ? r.det.text || '' : null,
        adj: parts.includes('adj') && r.adj ? r.adj.text : null,
        prep: parts.includes('prep') && r.prep ? r.prep.text || '' : null,
        aux: parts.includes('aux') && r.aux ? r.aux.text || '' : null,
        text: r.text,
      };
    });
    return {
      index: f,
      rooms,
      width: rooms.reduce((s, room) => s + ROOM_WIDTH[room.kind], 0),
      roofed: rooms.every((room) => room.state === 'done'),
      isTop: f === level.floors.length - 1,
    };
  });

  const stairs = level.floors.slice(1).map((_, i) => {
    const f = i + 1;
    const ref = `L${f}`;
    const word = all.links[ref];
    return {
      ref,
      from: f - 1,
      state: word ? 'done' : started(ref) ? 'building' : 'ghost',
      word: word?.text ?? null,
      active: activeUnit === ref,
      warn: errorRefs.has(ref),
    };
  });

  return {
    floors,
    stairs,
    completed,
    success: Boolean(result?.perfect),
    activeUnit,
    maxWidth: Math.max(...floors.map((fl) => fl.width)),
  };
}
