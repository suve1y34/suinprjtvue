# 책담책담 — Frontend (Vue 3, TypeScript, Vite)

개인 책장 관리 및 독서 기록 서비스의 **프론트엔드**입니다.  
Google OAuth2 로그인 성공 후 서버가 발급한 JWT로 세션을 유지합니다.

---

## 링크
- Frontend Repo: https://github.com/suve1y34/suinprjtvue
- Backend Repo: https://github.com/suve1y34/suinprjt

---

## 기능
- Google OAuth2 로그인 → JWT 세션
- 책장 조회/필터 (상태/연/월)
- 책 검색 → 상세 → 추가 (진행/상태/메모/공개여부)
- 진행/상태 갱신, 메모 수정
- 공개 메모 목록 (Cursor 기반 무한 스크롤)
- 마이페이지 (닉네임 인라인 수정)
- 라이트/다크/시스템 테마 토글
- 책등 UI (세로 제목, 페이지 수 기반 두께)

---

## 기술 스택
- Vue 3 (script setup) + TypeScript
- Vite
- Pinia (상태 관리)
- Vue Router
- Axios
- CSS variables (tokens, 다크 모드)

---
