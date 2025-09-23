# 책담책담 — Frontend (Vue 3, TypeScript, Vite)

개인 책장 관리 및 독서 기록 서비스의 **프론트엔드**입니다.  
Google OAuth2 로그인 성공 후 서버가 발급한 JWT로 세션을 유지합니다.

---

## 링크
- Frontend Repo: https://github.com/suve1y34/suinprjtvue
- Backend Repo: https://github.com/suve1y34/suinprjt
- Live Demo: http://ckk122.cafe24.com

---

## 주요 기능
- Google OAuth2 로그인 → JWT 세션 유지
- 책장 조회/검색/필터(상태/연/월, 키워드, 정렬)
- 책 검색 → 상세 → 추가(진행/상태/메모/리뷰 공개여부)
- 진행/상태/시작·종료일 수정 (DONE 시 서버가 페이지 자동 보정)
- 공개 리뷰 목록 (커서 기반 “더 보기” 로딩)
- 마이페이지 (닉네임/연락처 인라인 편집)
- 라이트/다크/시스템 테마 토글
- 책등 UI (세로 제목, 페이지 수 기반 두께)

---

## 기술 스택
- Vue 3 (script setup) + TypeScript
- Vite
- Pinia (상태 관리)
- Vue Router
- Axios
- CSS variables (디자인 토큰, 다크 테마)

---

## 시작하기

### 1) 요구사항
- **Node.js 18+** (또는 20+ 권장), **npm 9+**
- **백엔드 서버** 구동 (CORS 허용 또는 Vite 프록시 설정)

### 2) 설치 & 실행
```bash
npm ci          # 의존성 설치
npm run dev     # 개발 서버 (http://localhost:5173)
npm run build   # 프로덕션 빌드
npm run preview # 빌드 결과 미리보기
```

### 3) 환경변수 (`.env` 또는 `.env.local`)
```dotenv
# API 베이스 URL (백엔드)
VITE_API_BASE_URL=http://localhost:8080

# Google OAuth (백엔드 리다이렉트 사용 시 FE에선 보통 client id만 참조)
VITE_GOOGLE_CLIENT_ID=<your_google_client_id>

# 서드파티 도서 검색 키(사용한다면)
VITE_ALADIN_TTB_KEY=<your_aladin_key>
```

> **TIP**: `vite.config.ts`에 프록시를 둘 수 있음
```ts
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
});
```

---

## 디렉터리 구조(요약)
```text
src/
  api/                 # axios 인스턴스, 엔드포인트 래퍼 (aladin.api, books.api 등)
  assets/
    styles/            # 전역 css/다크테마 변수
  components/
    books/             # Bookshelf, BookSearchModal, BookDetailModal, ReadingStatsModal
    user/              # MyInfoModal
    ui/                # Toast, 공용 UI
  stores/              # Pinia: auth.store, shelves.store, theme.store ...
  types/               # DTO/타입: shelf.ts, book.ts, user.ts ...
  utils/               # searchHistory, thickness(두께 계산) 등
  views/
    BookshelfView.vue  # 메인 화면(요약바 + 접이식 필터)
    LoginView.vue      # 로그인 화면
```

---
