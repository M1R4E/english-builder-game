import { registerSW } from 'virtual:pwa-register';

// ── 오프라인 준비 상태 ──
// 서비스 워커를 등록하고, "인터넷이 끊겨도 게임을 열 수 있는지"를 알려 준다.
//  'ready'      : 게임 파일을 모두 저장해 둠 → 인터넷 없이도 실행 가능
//  'preparing'  : 저장하는 중 (처음 접속했을 때 잠깐)
//  'unsupported': 이 브라우저(또는 개발 서버)에서는 오프라인 기능을 쓰지 않음
// 학술제 전에 인터넷이 되는 곳에서 한 번 열어 'ready'가 되는지 설정 창(진행자용)에서 확인한다.

let status = 'unsupported';
const listeners = new Set();
const set = (next) => {
  status = next;
  listeners.forEach((fn) => fn(status));
};

export function setupOffline() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  // 이미 서비스 워커가 이 페이지를 맡고 있으면 저장이 끝난 상태다
  set(navigator.serviceWorker.controller ? 'ready' : 'preparing');
  registerSW({
    immediate: true,
    onOfflineReady: () => set('ready'),
    onRegisterError: () => set('unsupported'),
  });
  navigator.serviceWorker.ready.then(() => {
    if (navigator.serviceWorker.controller) set('ready');
  });
}

export const getOfflineStatus = () => status;
export function onOfflineStatus(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
