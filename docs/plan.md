# Implementation Plan — 나만을 위한 Todo 웹 애플리케이션

어떤 순서로 만들 것인가 (Phase, Tasks, 위험 요소)

- **관련 PRD**: `docs/prd.md`
- **관련 Spec**: `docs/spec.md`
- **작성일**: 2026-05-28

---

## 1. 개요

`docs/spec.md`에 설계된 전체 시스템을 구현한다. 기술 스택 및 Out of Scope는 `docs/spec.md`, `docs/prd.md` 참조.

---

## 2. 사전 조건

### 환경
- [ ] Java 17 설치 확인 (`java -version`)
- [ ] Node.js 20+ 설치 확인 (`node -v`)
- [ ] SQLite CLI 설치 확인 (`sqlite3 --version`)
- [ ] Git 설치 확인 (`git --version`)

---

## 3. 구현 단계

---

### Phase 1. 모노레포 뼈대 구성
**목적**: 전체 프로젝트 폴더 구조, git 설정, DB 백업 스크립트를 준비한다.
**의존 단계**: 없음

#### Tasks
- [x] 루트 `.gitignore` 작성 (`.db` 파일 제외)
- [x] `scripts/db-backup.sh` 작성 — `todo.db` → `backup.sql` 덤프
- [x] `scripts/db-restore.sh` 작성 — `backup.sql` → `todo.db` 복원
- [x] `.git/hooks/pre-commit` 작성 — 커밋 전 자동 백업

#### 검증
```bash
chmod +x scripts/db-backup.sh scripts/db-restore.sh
git init
# pre-commit hook 동작 확인
```

---

### Phase 2. Spring Boot 프로젝트 초기화
**목적**: Gradle 프로젝트 생성 및 SQLite 연동이 동작하는 최소 백엔드를 만든다.
**의존 단계**: Phase 1 완료 후

#### Tasks
- [x] Spring Initializr API(`start.spring.io`)로 `backend/` 프로젝트 생성 (web, data-jpa, validation, lombok 포함), `build.gradle`에 sqlite-jdbc, hibernate-community-dialects 수동 추가
- [x] `application.yml` DB 설정 (`jdbc:sqlite:./db/todo.db`)
- [x] `backend/db/` 디렉토리 생성, `schema.sql` 작성
- [x] 앱 기동 시 `backend/db/todo.db` 자동 생성 확인

---

### Phase 3. 공통 인프라
**목적**: 모든 API에서 사용하는 응답 래퍼와 CORS 설정을 먼저 구성한다.
**의존 단계**: Phase 2 완료 후

#### Tasks
- [x] `ApiResponse<T>` 작성 — `{ success, data, message }`
- [x] `WebConfig` 작성 — `localhost:3000` CORS 허용

---

### Phase 4. Category 도메인 (수직 구현)
**목적**: Category Entity부터 Controller까지 수직으로 완성한다.
**의존 단계**: Phase 3 완료 후

> **도메인 의존성**: Category는 다른 도메인에 의존하지 않는 가장 낮은 단계.

#### Tasks
- [x] `Category` Entity 작성 (`@Entity`, id/name/color/createdAt)
- [x] `CategoryRepository` 작성 (JpaRepository 상속)
- [x] `CategoryService` 작성 (findAll, save, deleteById)
- [x] `CategoryController` 작성
  - GET `/api/categories` — 전체 조회
  - POST `/api/categories` — 생성 (name, color)
  - DELETE `/api/categories/{id}` — 삭제

---

### Phase 5. Tag 도메인 (수직 구현)
**목적**: Tag Entity부터 Controller까지 수직으로 완성한다.
**의존 단계**: Phase 3 완료 후 (Phase 4와 독립적으로 진행 가능)

> **도메인 의존성**: Tag도 다른 도메인에 의존하지 않는 독립 도메인.

#### Tasks
- [x] `Tag` Entity 작성 (id/name/color)
- [x] `TagRepository` 작성
- [x] `TagController` 작성 — Service 없이 Repository 직접 사용
  - GET `/api/tags` — 전체 조회
  - POST `/api/tags` — 생성 (name, color)

---

### Phase 6. Todo 도메인 (수직 구현)
**목적**: Todo Entity부터 Controller까지 수직으로 완성한다. 가장 복잡한 단계.
**의존 단계**: Phase 4, Phase 5 완료 후

> **도메인 의존성**: Todo는 Category(FK)와 Tag(N:N)를 참조하므로 Phase 4, 5 이후에 작업.

#### Tasks
- [x] `Priority` Enum 작성 (HIGH / MEDIUM / LOW)
- [x] `Todo` Entity 작성
  - Category FK (`@ManyToOne`)
  - Tags (`@ManyToMany` via `todo_tags` 중간 테이블)
  - completed, completedAt, dueDate, priority, createdAt, updatedAt
- [x] `TodoRepository` 작성 — 필터 쿼리 (dueDate, categoryId, tagId, priority, completed, 키워드 검색)
- [x] `TodoService` 작성
  - 완료 토글 로직: `completed=true` → `completedAt=now`, `false` → `completedAt=null`
- [x] `TodoController` 작성
  - GET `/api/todos` — 목록 조회 (category, tag, priority, completed, search, dueDate 필터)
  - POST `/api/todos` — 생성
  - PUT `/api/todos/{id}` — 수정 (완료 토글 포함)
  - DELETE `/api/todos/{id}` — 삭제

---

### Phase 7. Stats API 구현
**목적**: 통계 API를 완성한다.
**의존 단계**: Phase 6 완료 후

#### Tasks
- [x] `StatsController` 작성 — GET `/api/stats`
- [x] 전체 완료율 계산
- [x] 카테고리별 현황 집계
- [x] 이번 주 완료 추이 — 이번 주 월요일~일요일 기준
- [x] 이번 달 완료 추이 — 이번 달 1일~말일, 빈 날짜 0으로 채워서 반환

---

### Phase 8. Nuxt 3 프론트엔드 초기화
**목적**: 프론트엔드 프로젝트를 생성하고 백엔드 API 통신 환경을 갖춘다.
**의존 단계**: Phase 4 완료 후 (Phase 5~7과 병렬 진행 가능)

#### Tasks
- [ ] `frontend/` 디렉토리에 Nuxt 3 프로젝트 생성
- [ ] Tailwind CSS, `@nuxtjs/color-mode` 설치/설정
- [ ] `lucide-vue-next`, `dayjs` 설치
- [ ] `nuxt.config.ts` — `/api/**` → `localhost:8080` 프록시 설정
- [ ] 라이트/다크 모드 기본 레이아웃 작성

---

### Phase 9. 메인 페이지 (`/`) 구현
**목적**: Todo 목록 조회, 생성/수정/삭제, 필터 기능을 가진 메인 화면을 완성한다.
**의존 단계**: Phase 6, Phase 8 완료 후

#### Tasks
- [ ] `useTodos` composable 작성 — API 호출, 상태 관리
- [ ] `useCategories`, `useTags` composable 작성
- [ ] Todo 목록 컴포넌트 — 완료 토글, 우선순위 뱃지, D-day 뱃지
- [ ] Todo 생성/수정 모달 — 전체 필드 입력 (제목, 설명, 카테고리, 태그, 우선순위, 마감일)
- [ ] 필터 사이드바 — 카테고리, 태그, 우선순위, 완료 여부, 텍스트 검색

---

### Phase 10. 캘린더 페이지 (`/calendar`) 구현
**목적**: 날짜별 Todo 시각화 및 날짜 클릭 시 CRUD 기능을 완성한다.
**의존 단계**: Phase 6, Phase 8 완료 후

#### Tasks
- [ ] `v-calendar` 설치 및 월간 캘린더 렌더링
- [ ] 날짜별 Todo 뱃지 표시 (해당 날짜 Todo 수)
- [ ] 날짜 클릭 → 해당 날짜 Todo 목록 패널/모달 표시
  - GET `/api/todos?dueDate={date}` 호출
- [ ] 날짜 패널에서 Todo 생성 — 클릭한 날짜가 마감일로 자동 설정
- [ ] 날짜 패널에서 Todo 수정/삭제

---

### Phase 11. 통계 페이지 (`/stats`) 구현
**목적**: 완료율, 카테고리별 현황, 주간/월간 추이 차트를 완성한다.
**의존 단계**: Phase 7, Phase 8 완료 후

#### Tasks
- [ ] `chart.js` + `vue-chartjs` 설치
- [ ] `useStats` composable 작성
- [ ] 전체 완료율 카드 (숫자 + 프로그레스 바)
- [ ] 카테고리별 현황 (도넛 또는 바차트)
- [ ] 이번 주 완료 추이 바차트 (월~일, 7개 막대)
- [ ] 이번 달 완료 추이 바차트 (1일~말일)

---

### Phase 12. UI 마무리
**목적**: 디자인 일관성, 반응형, 다크모드를 완성한다.
**의존 단계**: Phase 9, Phase 10, Phase 11 완료 후

#### Tasks
- [ ] 우선순위 색상 통일 (HIGH: 빨강, MEDIUM: 노랑, LOW: 회색)
- [ ] 다크모드 전환 토글 버튼 추가
- [ ] 모바일 반응형 레이아웃 확인 (사이드바 접기/펼치기)
- [ ] 빈 상태 UI — Todo가 없을 때 안내 문구/일러스트
- [ ] 로딩 상태 처리 (스켈레톤 또는 스피너)

---

### Phase 13. DB 백업 및 git 설정 마무리
**목적**: pre-commit hook을 활성화하고 초기 backup.sql을 생성한다.
**의존 단계**: Phase 2 완료 후 언제든 진행 가능

#### Tasks
- [ ] `backend/db/schema.sql` 최종 정리 (실제 생성된 스키마 기준)
- [ ] `./scripts/db-backup.sh` 실행 → `backend/db/backup.sql` 생성
- [ ] pre-commit hook 실행 권한 확인 (`chmod +x .git/hooks/pre-commit`)
- [ ] 테스트 커밋 → `backup.sql` 자동 갱신 확인

---

## 4. 위험 요소 & 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| Hibernate + SQLite Dialect 호환 문제 | 중 | Phase 2에서 Hello World 수준 PoC 먼저 확인 |
| `v-calendar` + Nuxt 3 버전 충돌 | 낮 | 설치 전 호환 버전 확인 |
| 주간 통계 월요일 기준 계산 오류 | 중 | 다양한 요일에서 테스트 |
| 월간 통계 빈 날짜 처리 누락 | 중 | 응답에 0인 날짜도 포함되는지 확인 |
