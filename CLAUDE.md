# 문장 건축가 (english-builder-game) — Claude 작업 안내

인지심리학 학습 원리를 적용한 영어 문장 구성 3D 학습 게임. 학술제 전시용 웹 게임이다.
React + Vite + Three.js, 오프라인(PWA) 실행이 목표이고, 게임 실행 중에는 AI API를 쓰지 않는다.

## 함께 작업하는 사람
- 프로그래밍 경험이 많지 않은 고등학생이다. 중요한 구현 내용은 쉬운 말로 설명한다.
- **설명, 진행 보고, 질문, 코드 주석, 문서는 모두 한국어로 쓴다.** (영어는 게임 속 영어 문장과 코드 이름에만)
- 핵심 게임 규칙이나 기획을 바꿀 때는 먼저 설명하고 승인을 받는다.
- 구현하지 않은 기능을 했다고 보고하지 않는다. 각 단계가 끝나면 실제로 실행·테스트한 결과를 보고한다.
- 커밋 작성자 이름은 **MMM**, 이메일은 GitHub 비공개 주소 **209072790+M1R4E@users.noreply.github.com**이다 (이 저장소의 로컬 git 설정). 실제 이메일 주소는 커밋에 남기지 않는다.
- GitHub 저장소: https://github.com/M1R4E/english-builder-game (공개). 새 컴퓨터에서는 클론한 뒤 위 이름·이메일을 `git config`로 먼저 설정한다.

## 꼭 읽을 문서
- `docs/개발기록.md`: 확정된 기획 결정 ①~⑪, 단계별로 한 일과 테스트 결과, 남은 문제. **작업 전에 먼저 읽는다.**
- `README.md`: 실행 방법과 폴더 구조

## 명령 (Windows PowerShell에서는 `npm` 대신 `npm.cmd`)
- `npm.cmd install`: 처음 한 번 (node_modules 설치)
- `npm.cmd run dev`: 개발 서버 (http://localhost:5173)
- `npm.cmd test`: 자동 테스트 (Vitest)
- `npm.cmd run build`: 배포용 빌드

## 구조 원칙
- `src/data/levels/`: 레벨 내용만. 새 레벨은 `validateLevel`로 검사되고, `tests/`에 레벨별 전수 채점 테스트를 둔다.
- `src/game/`: 채점·진행·보상 순수 로직. React/Three.js를 쓰지 않는다.
- `src/building/`: 카드 → 설계도(makeBlueprint) → 3D 부품(buildParts) → 렌더러(BuildingRenderer)
- `src/components/`: 화면. 채점은 점수(0~100)로 하고, 화면에는 돈(1점 = 1,000원, `game/money.js`)으로 보여 준다.
- 화면에 이모지를 쓰지 않는다. 상태는 색 + 글자 배지로 표시한다.

## 진행 상황 (2026-10-15 기준)
- 완료: 0단계(환경), 1단계(기본 구조), 2단계(레벨 1 전체 플레이)
  - 2단계 보완: 3D 전체 화면, 영수증 주문서와 수락 도장, 메인 화면, 우편함 레벨 선택, 돈 표시, 점검 보고서 연출
  - 2단계 보완 3: 글꼴(주아·고운돋움), 건축 표현 특별 요청 사항, 견적 오차 차감(최종 공사 대금), 자리를 골라 카드 놓는 조립 방식, 완공 연출
- 건축 방식(3단계 2차, 2026-10-16): 층 = 절, 방 = 문장 성분, 방 안의 부품 = 단어(가구·개수·문패·카펫·출입문·받침대), 계단 = 접속사.
  - 공정 순서: 층수 → 1층 필수 방 → 1층 장식 방 → 계단 → 2층 … (`game/structure.js`). 단어는 `data/lexicon.js` 사전에서 고른다.
  - 채점: 관사·수·형태·수 일치·품사는 자동 검사(`game/scoring.js`), 의미·특별 요청은 레벨 데이터에 적는다. 레벨 작성법은 `level01.js` 맨 위 주석.
  - 레벨 해금·다음 레벨: `game/progress.js`. 저장: `game/storage.js`(localStorage), 학습 기록·추천·CSV: `game/records.js`.
- 4단계와 4단계 보완, 5단계(반응형 카드 판·터치 크기·작은 화면 이름표·풍경·화면 전환)까지 완료(2026-10-16). 다음: 6단계(오프라인 PWA).
- 테스트: `tests/levels.test.js`(레벨별 한 단계 변경 전수 + 무작위 3,000채), `tests/game.test.js`, `tests/blueprint.test.js`
- 다음: 6단계(오프라인 PWA), 7단계(배포)
- 미뤄 둔 일
  - 설문 문항은 사용자가 정해 `src/data/survey.js`에 넣고 enabled를 켠다

## 알려진 환경 문제
- Windows에서 파일을 빠르게 연달아 고치면 Vite가 변경을 놓치는 일이 있어 `vite.config.js`에서 polling을 켜 두었다.
- 브라우저 콘솔에 남은 예전 오류와 새 오류를 구분하려면 새 탭에서 확인한다.
