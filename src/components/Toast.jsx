import { useEffect, useState } from 'react';

const EXIT_MS = 380; // 옆으로 들어가며 사라지는 시간

// 화면 위쪽에 잠깐 뜨는 안내 상자.
// 옆에서 통통 튀며 나와서, 아래 막대가 끝까지 차면 다시 옆으로 들어가며 사라진다.
// toast: { id, text } — id가 바뀌면 새 안내로 처음부터 다시 보여 준다.
export default function Toast({ toast, duration = 2600, onDone }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!toast) return undefined;
    setLeaving(false);
    const t1 = setTimeout(() => setLeaving(true), duration);
    const t2 = setTimeout(onDone, duration + EXIT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [toast, duration, onDone]);

  if (!toast) return null;
  return (
    <div className={`toast${leaving ? ' is-leaving' : ''}`} role="status" aria-live="assertive" key={toast.id}>
      <p className="toast-text">{toast.text}</p>
      <span className="toast-timer" aria-hidden="true">
        <span style={{ animationDuration: `${duration}ms` }} />
      </span>
    </div>
  );
}
