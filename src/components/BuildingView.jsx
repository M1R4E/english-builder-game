import { useEffect, useRef } from 'react';
import { BuildingRenderer } from '../building/BuildingRenderer.js';

// React와 Three.js를 이어 주는 다리 역할.
// 화면에 <div>를 하나 만들고, 그 안에 3D 렌더러를 붙인다.
// 화면에서 사라질 때는 렌더러를 정리(dispose)해서 메모리가 새지 않게 한다.
export default function BuildingView({ buildFn }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    let renderer;
    try {
      renderer = new BuildingRenderer(containerRef.current);
    } catch (err) {
      console.error(err);
      containerRef.current.textContent = '3D 화면을 불러오지 못했어요. 브라우저가 WebGL을 지원하는지 확인해 주세요.';
      return undefined;
    }
    rendererRef.current = renderer;
    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (rendererRef.current && buildFn) {
      rendererRef.current.setBuilding(buildFn());
    }
  }, [buildFn]);

  return <div className="building-view" ref={containerRef} />;
}
