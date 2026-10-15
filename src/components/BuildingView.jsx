import { useEffect, useRef, useState } from 'react';
import { BuildingRenderer } from '../building/BuildingRenderer.js';

// React와 Three.js를 이어 주는 다리 역할.
// 화면에 <div>를 하나 만들고, 그 안에 3D 렌더러를 붙인다.
// 부품 목록(parts)이 바뀔 때마다 렌더러에 전달하고,
// 화면에서 사라질 때는 렌더러를 정리(dispose)해서 메모리가 새지 않게 한다.
export default function BuildingView({ parts, bounds, insetTop = 0, insetBottom = 0, interactive = true, autoRotate = false }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let renderer;
    try {
      renderer = new BuildingRenderer(containerRef.current, { interactive, autoRotate });
    } catch (err) {
      console.error(err);
      setError(true);
      return undefined;
    }
    rendererRef.current = renderer;
    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
    // 렌더러는 처음 한 번만 만든다 (interactive, autoRotate는 처음 값만 사용)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    rendererRef.current?.updateParts(parts, bounds);
  }, [parts, bounds, error]);

  // 위·아래 판이 가리는 높이를 알려 주면, 건물이 가려지지 않은 공간 가운데에 보인다.
  useEffect(() => {
    rendererRef.current?.setInsets(insetTop, insetBottom);
  }, [insetTop, insetBottom, error]);

  return (
    <div className="building-view" ref={containerRef}>
      {error && (
        <p className="building-error">
          3D 화면을 불러오지 못했어요. 문장 만들기와 채점은 그대로 할 수 있어요.
        </p>
      )}
    </div>
  );
}
