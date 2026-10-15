# 🏗️ 문장 건축가

For School Academic Festival

영어 문장 카드를 조립하면 3D 건물이 지어지는 학습 게임입니다. 인지심리학의 학습 원리(메타인지, 비계 설정, 인출 연습 등)를 적용해 보기 위한 교육용 게임입니다. 학습 효과가 검증된 프로그램은 아닙니다.

## 실행 방법

처음 한 번만 필요한 준비:

1. [Node.js LTS](https://nodejs.org)를 설치합니다.
2. 이 폴더에서 터미널을 열고 `npm install`을 실행합니다. 필요한 라이브러리가 `node_modules` 폴더에 설치됩니다.

개발할 때:

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 실행 → 브라우저에서 http://localhost:5173 열기 |
| `npm test` | 자동 테스트 실행 |
| `npm run build` | 배포용 파일을 `dist` 폴더에 만들기 |
| `npm run preview` | 빌드된 결과를 미리보기 |

## 폴더 구조

```
src/
  App.jsx           화면 전환 (레벨 선택 ↔ 플레이)
  config.js         배점, 완공 기준 등 조정 가능한 숫자
  data/levels/      📖 레벨 데이터 (문장 카드, 정답, 채점 항목, 힌트)
  game/             🧠 게임 규칙 (문장 분석, 채점, 보상, 진행 상태, 데이터 검사)
  building/         🏠 3D 건물
    makeBlueprint.js     카드 → 건물 설계도
    buildParts.js        설계도 → 3D 부품
    BuildingRenderer.js  장면·카메라·조명·애니메이션 관리
  components/       🖥️ 화면 조각 (React)
  styles/app.css    디자인과 반응형 레이아웃
tests/              자동 테스트
docs/               개발 기록과 결정 사항
```

뒤 단계에서 `storage/`(기록 저장) 폴더가 추가됩니다.
