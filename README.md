# 문장 건축가

For School Academic Festival

영어 문장을 단어 하나하나 골라 지으면 3D 건물이 함께 지어지는 학습 게임입니다. 인지심리학의 학습 원리(메타인지, 비계 설정, 인출 연습, 자기 설명, 대조 학습 등)를 적용해 보기 위한 교육용 게임입니다. 학습 효과가 검증된 프로그램은 아닙니다.

**바로 플레이하기: https://m1r4e.github.io/english-builder-game/**
(PC·태블릿·휴대폰 브라우저에서 열 수 있고, 한 번 연 뒤에는 인터넷이 끊겨도 실행됩니다.)

학술제 당일 준비와 진행 방법은 [`docs/전시용_실행절차.md`](docs/전시용_실행절차.md)를 보세요.

## 게임 방법

1. 우편함에서 주문서(레벨)를 고르고, 받을 것 같은 공사 대금(예상 점수)을 정한 뒤 도장을 찍습니다.
2. 정해진 순서대로 건물을 짓습니다: 층수(절의 개수) → 1층의 방(주어·동사·목적어·보어 → 꾸미는 말) → 계단(접속사) → 2층 …
3. 방마다 단어를 고르고, 단수·복수·시제 같은 형태와 관사·전치사를 정합니다.
4. 제출하면 점검 보고서(점수, 고칠 점, 예상과 실제 비교)가 나옵니다. 고쳐서 다시 제출할 수 있습니다.

| 문장 | 건물 |
|---|---|
| 절 | 층 |
| 문장 성분(주어·동사·목적어·보어·수식어) | 방 |
| 중심 단어 / 단수·복수 | 가구 / 가구 개수 |
| 관사 | 문패 |
| 꾸미는 형용사 | 카펫 |
| 전치사 | 출입문 |
| 동사의 시제 | 동사 기둥의 재질 |
| 접속사 | 계단 |

## 개발 환경에서 실행하기

처음 한 번만 필요한 준비:

1. [Node.js LTS](https://nodejs.org)를 설치합니다.
2. 이 폴더에서 터미널을 열고 `npm install`을 실행합니다. (Windows PowerShell에서는 `npm.cmd`)

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 실행 → 브라우저에서 http://localhost:5173 열기 |
| `npm test` | 자동 테스트 실행 |
| `npm run build` | 배포용 파일을 `dist` 폴더에 만들기 (오프라인용 서비스 워커 포함) |
| `npm run preview` | 빌드된 결과를 http://localhost:4173 에서 미리보기 |

**배포**: `main` 브랜치를 GitHub에 올리면(push) GitHub Actions가 테스트 → 빌드 → GitHub Pages 공개를 자동으로 합니다 (`.github/workflows/deploy.yml`). 테스트가 실패하면 공개하지 않습니다.

## 폴더 구조

```
src/
  App.jsx           화면 전환 (메인 → 우편함 → 플레이), 저장
  main.jsx          시작점 (글꼴, 오프라인 준비)
  offline.js        오프라인(서비스 워커) 준비 상태
  config.js         배점, 완공 기준, 별 기준, 공사 대금 규칙 등 조정 가능한 숫자
  data/
    levels/         레벨 데이터 (건물 구조, 정답, 의미·특별 요청 채점, 힌트, 자기 설명, 대조 문장)
    lexicon.js      단어 사전 (단어마다 맞는 형태와 틀린 형태)
    survey.js       사전·사후 설문 (기본은 꺼짐)
  game/             게임 규칙 (React·Three.js 없이 순수 계산)
    structure.js    공정 순서, 단어 풀이, 문장 만들기
    scoring.js      채점 (자동 문법 검사 + 레벨 항목)
    session.js      한 판의 진행 상태
    reward.js       별, 공사 대금
    progress.js     레벨 해금, 다음 레벨
    records.js      학습 기록, 난이도 추천, CSV 내보내기
    storage.js      브라우저 저장
    validateLevel.js 레벨 데이터 검사
  building/         3D 건물 (설계도 → 부품 → 렌더러)
  components/       화면 조각 (React)
  styles/app.css    디자인과 반응형 레이아웃
public/icons/       앱 아이콘 (scripts/make-icons.mjs로 만듦)
tests/              자동 테스트
docs/               개발 기록, 전시용 실행 절차
```
