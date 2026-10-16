import { useEffect, useRef } from 'react';

// 3D 화면 위에 떠 있는 창. 뒤의 건물이 비쳐 보이도록 배경을 살짝만 어둡게 한다.
// 닫기: 오른쪽 위 X 버튼, Esc 키 (onClose가 있을 때만)
// variant: 'panel'(일반 창) / 'paper'(종이 모양, 주문서 등)
export default function Window({ title, onClose, children, variant = 'panel', labelledBy, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    if (!onClose) return undefined;
    const onKey = (e) => {
      // 창이 겹쳐 떠 있으면 맨 위 창만 닫는다
      const backdrops = document.querySelectorAll('.window-backdrop');
      if (e.key === 'Escape' && backdrops[backdrops.length - 1] === ref.current?.parentElement) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="window-backdrop">
      <div
        ref={ref}
        className={`window window-${variant} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {onClose && (
          <button type="button" className="window-close" onClick={onClose} aria-label="창 닫기">
            ×
          </button>
        )}
        {title && <h2 className="window-title">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
