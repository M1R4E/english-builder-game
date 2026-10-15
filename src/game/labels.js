// 문장 성분 이름 (여러 파일에서 함께 쓴다)
export const ROLE_LABELS = {
  S: '주어',
  V: '동사',
  O: '목적어',
  C: '보어',
  M: '수식어',
  CONJ: '접속사',
};

// 한 절에 하나씩만 있어야 하는 성분
export const CORE_ROLES = ['S', 'V', 'O', 'C'];
