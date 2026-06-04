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
- [ ] Git 설치 확인 (`git --version`)

---

## 3. 구현 단계

---

### Phase 1. 모노레포 뼈대 구성
**목적**: 전체 프로젝트 폴더 구조와 git 설정을 준비한다.
**의존 단계**: 없음

#### Tasks
- [x] 루트 `.gitignore` 작성
- [x] `.git/hooks/pre-commit` 작성

#### 검증
```bash
git init
```

---

### Phase 2. Spring Boot 프로젝트 초기화
**목적**: Gradle 프로젝트 생성 및 SQLite 연동이 동작하는 최소 백엔드를 만든다.
**의존 단계**: Phase 1 완료 후

#### Tasks
- [x] Spring Initializr API(`start.spring.io`)로 `backend/` 프로젝트 생성 (web, data-jpa, validation, lombok 포함), `build.gradle`에 sqlite-jdbc, hibernate-community-dialects 수동 추가
- [x] `application.yml` DB 설정 (`jdbc:sqlite:./db/todo.db`)
- [x] 앱 기동 시 DB 연결 확인

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
- [x] `TagService` 작성
- [x] `TagController` 작성
  - GET `/api/tags` — 전체 조회
  - POST `/api/tags` — 생성 (name, color)
  - PUT `/api/tags/{id}` — 수정 (name, color)
  - DELETE `/api/tags/{id}` — 삭제

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
  - PUT `/api/todos/{id}` — 수정
  - PATCH `/api/todos/{id}` — 완료 상태 부분 수정 (`{ completed: true/false }`)
  - PATCH `/api/todos/reorder` — 순서 일괄 변경 (`{ items: [{ id, position }] }`)
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

### Phase 8. Next.js 15 프론트엔드 초기화
**목적**: 프론트엔드 프로젝트를 생성하고 백엔드 API 통신 환경을 갖춘다.
**의존 단계**: Phase 4 완료 후 (Phase 5~7과 병렬 진행 가능)

#### Tasks
- [x] `frontend/` 디렉토리에 Next.js 16 프로젝트 생성 (TypeScript, Tailwind, App Router, src/)
- [x] `lucide-react`, `dayjs`, `react-chartjs-2`, `chart.js` 설치
- [x] `next.config.ts` — `/api/**` → `localhost:8080` 프록시 설정 (rewrites)
- [x] `src/types/index.ts` — 공통 타입 정의 (Category, Tag, Todo, ApiResponse 등)

---

### Phase 9. Supabase 마이그레이션
**목적**: DB를 SQLite에서 Supabase(PostgreSQL)로 전환한다.
**의존 단계**: Phase 7 완료 후

#### Tasks
- [x] `build.gradle` — `sqlite-jdbc`, `hibernate-community-dialects` 제거, `postgresql` 드라이버 추가
- [x] `application.yml` — datasource를 Supabase Session Pooler JDBC URL로 교체 (환경변수 `SPRING_DATASOURCE_URL` 등)
- [x] `TodoRepository` — SQLite `DATE()` 함수를 PostgreSQL `::date` 캐스트로 교체

---

### Phase 10. 백엔드 인증 구현
**목적**: 배포 환경에서 나만 접근할 수 있도록 단일 비밀번호 인증을 백엔드에 추가한다.
**의존 단계**: Phase 9 완료 후

#### Tasks
- [x] `AuthFilter.java` (OncePerRequestFilter) — GET 요청 및 `/api/auth/**`는 통과, 나머지 메서드(POST/PUT/DELETE)는 세션 체크 후 미인증 시 401
- [x] `AuthController.java` — `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- [x] `WebConfig.java` — CORS 출처를 배포 도메인으로 업데이트, `AuthFilter` 등록

---

---
> **전략: UI 선행 → API 후행**
> Phase 11~16에서 모든 페이지의 UI 껍데기를 mock 데이터로 완성한 뒤, Phase 17~20에서 실제 API를 일괄 연결한다.
> 이유: 디자인 일관성 유지, 에이전트 환각 방지, 컴포넌트 재사용성 극대화.
---

### Phase 11. 기본 레이아웃 작성
**목적**: 모든 페이지가 공유하는 네비게이션 레이아웃을 구성한다.
**의존 단계**: Phase 10 완료 후

#### Tasks
- [x] `src/app/layout.tsx` — 상단 네비게이션 바 (`/`, `/calendar`, `/stats`, `/login` 링크) 포함 루트 레이아웃

---

### Phase 12. 로그인 페이지 UI
**목적**: 로그인 화면의 UI 껍데기만 완성한다. API 연결은 Phase 17에서 수행한다.
**의존 단계**: Phase 11 완료 후

#### Tasks
- [x] `src/app/login/page.tsx` — 로그인 폼 UI (비밀번호 입력 필드, 제출 버튼, 에러 메시지 영역)
- [x] 폼 제출 시 콘솔 로그만 출력 (실제 API 호출 없음)

---

### Phase 13. 메인 페이지 UI (`/`)
**목적**: Todo 목록, 생성/수정/삭제 모달, 필터 사이드바의 UI 껍데기를 mock 데이터로 완성한다. API 연결은 Phase 18에서 수행한다.
**의존 단계**: Phase 11 완료 후

#### Tasks
- [x] `src/mocks/todos.ts` — Todo, Category, Tag mock 데이터 정의
- [x] Todo 목록 컴포넌트 — 완료 토글(UI만), 우선순위 뱃지, D-day 뱃지
- [x] Todo 생성/수정 모달 — 전체 필드 입력 UI (제목, 설명, 카테고리, 태그, 우선순위, 마감일)
- [x] 필터 사이드바 — 카테고리, 태그, 우선순위, 완료 여부, 텍스트 검색 UI

---

### Phase 14. 캘린더 페이지 UI (`/calendar`)
**목적**: 월간 캘린더와 날짜 클릭 패널의 UI 껍데기를 mock 데이터로 완성한다. API 연결은 Phase 19에서 수행한다.
**의존 단계**: Phase 11 완료 후

#### Tasks
- [x] dayjs + Tailwind로 월간 캘린더 직접 구현
- [x] 날짜별 Todo 뱃지 표시 (mock 데이터 기반 Todo 수)
- [x] 날짜 클릭 → 해당 날짜 Todo 목록 패널/모달 표시 (mock 데이터)
- [x] 날짜 패널에서 Todo 생성/수정/삭제 UI (폼만, 실제 저장 없음)

---

### Phase 15. 통계 페이지 UI (`/stats`)
**목적**: 완료율, 카테고리별 현황, 주간/월간 추이 차트의 UI 껍데기를 mock 데이터로 완성한다. API 연결은 Phase 20에서 수행한다.
**의존 단계**: Phase 11 완료 후

#### Tasks
- [x] `src/mocks/stats.ts` — Stats mock 데이터 정의
- [x] 전체 완료율 카드 (숫자 + 프로그레스 바)
- [x] 카테고리별 현황 (도넛 또는 바차트)
- [x] 이번 주 완료 추이 바차트 (월~일, 7개 막대)
- [x] 이번 달 완료 추이 바차트 (1일~말일)

---

### Phase 16. UI 마무리
**목적**: 디자인 일관성과 반응형을 완성한다. API 연결 전에 UI를 완전히 다듬는다.
**의존 단계**: Phase 13, Phase 14, Phase 15 완료 후

#### Tasks
- [x] 우선순위 색상 통일 (HIGH: 빨강, MEDIUM: 노랑, LOW: 회색)
- [x] 모바일 반응형 레이아웃 확인 (사이드바 접기/펼치기)
- [x] 빈 상태 UI — Todo가 없을 때 안내 문구/일러스트
- [x] 로딩 상태 처리 (스켈레톤 또는 스피너)

---

### Phase 17. 인증 API 연결
**목적**: 로그인 페이지와 백엔드 인증 API를 연결하고, 미인증 접근을 차단한다.
**의존 단계**: Phase 16 완료 후

#### Tasks
- [x] `src/hooks/useAuth.ts` — `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` 호출
- [x] `src/proxy.ts` (Next.js 16 규칙, 구 `middleware.ts`) — 미인증 시 `/login` 리다이렉트, 세션 유효성 백엔드 검증
- [x] `src/app/login/page.tsx` — 폼 제출을 `useAuth.login`으로 교체 (Phase 12 mock 제거)

---

### Phase 18. 메인 페이지 API 연결
**목적**: 메인 페이지의 mock 데이터를 실제 API 호출로 교체한다.
**의존 단계**: Phase 17 완료 후

#### Tasks
- [x] `src/hooks/useTodos.ts` — `GET/POST/PUT/PATCH/DELETE /api/todos` 호출, 상태 관리
- [x] `src/hooks/useCategories.ts` — `GET/POST/DELETE /api/categories` 호출
- [x] `src/hooks/useTags.ts` — `GET/POST /api/tags` 호출
- [x] 메인 페이지 컴포넌트에서 `src/mocks/todos.ts` 제거, 위 훅으로 교체
- [x] mutation 훅에 401 응답 처리 추가 (→ `/login` 리다이렉트)

---

### Phase 19. 캘린더 페이지 API 연결
**목적**: 캘린더 페이지의 mock 데이터를 실제 API 호출로 교체한다.
**의존 단계**: Phase 18 완료 후

#### Tasks
- [x] 캘린더 컴포넌트에서 `src/mocks/todos.ts` 제거, `useTodos` 훅으로 교체
- [x] 날짜 클릭 패널 — `GET /api/todos?dueDate={date}` 실제 호출
- [x] 날짜 패널 Todo 생성 시 클릭한 날짜를 `dueDate`로 자동 설정하여 실제 저장

---

### Phase 20. 통계 페이지 API 연결
**목적**: 통계 페이지의 mock 데이터를 실제 API 호출로 교체한다.
**의존 단계**: Phase 18 완료 후

#### Tasks
- [x] `src/hooks/useStats.ts` — `GET /api/stats` 호출
- [x] 통계 페이지 컴포넌트에서 `src/mocks/stats.ts` 제거, `useStats` 훅으로 교체

---

---

> **일간 플래너 고도화 (Phase 21~24)**
> 전략: UI 선행 (Phase 21) → API 명세 확정 (Phase 22) → 백엔드 구현 (Phase 23) → 프론트 연동 (Phase 24)
---

### Phase 21. 일간 플래너 UI (목업)
**목적**: 실제 API 없이 플래너 페이지의 UI 껍데기를 mock 데이터로 완성한다.
**UI 레퍼런스**: Stitch 프로젝트 `8074316594367710553` > "일간 플래너 - 드래그 앤 드롭" 스크린
**의존 단계**: Phase 20 완료 후

#### Tasks
- [x] `Sidebar.tsx` — "플래너" 네비 항목 추가 (`/planner`, CalendarClock 아이콘)
- [x] `src/app/(main)/planner/page.tsx` — 페이지 shell 생성
- [x] `src/hooks/usePlannerState.ts` — 날짜 네비 + 다이얼로그 상태 훅
- [x] `src/components/planner/PlannerView.tsx` — 날짜 헤더, 좌우 레이아웃
- [x] `src/components/planner/PlannerPool.tsx` — 태스크 풀 목록
- [x] 초기 커스텀 그리드(`PlannerTimeGrid`, `PlannerEventCard`, `PlannerPoolCard`) 구현 → Phase 25에서 FullCalendar 기반으로 전면 대체

#### 검증
- `/planner` 접근 → 사이드바 "플래너" 활성화, 시간 그리드 + 태스크 풀 레이아웃 렌더링

---

### Phase 22. 플래너 API 명세 확정
**목적**: Phase 21 UI에서 필요한 API를 정리하고 프론트엔드 타입을 추가한다.
**의존 단계**: Phase 21 완료 후

#### Tasks
- [x] `src/types/index.ts` — `TodoSchedule` 인터페이스 추가 (`id, todoId, startTime, endTime, scheduleDate`)
- [x] 신규 API 명세 확인 (`docs/spec.md` TodoSchedules 섹션 참조)

---

### Phase 23. 백엔드: TodoSchedule 도메인 구현
**목적**: TodoSchedule Entity → Repository → Service → Controller 순서로 구현하고 각 레이어마다 테스트를 작성한다.
**의존 단계**: Phase 22 완료 후

> **구현 순서: Entity → Repository → Service → Controller**  
> `ddl-auto: update` 이므로 Entity 필드 추가 시 Hibernate가 `todo_schedules` 테이블을 자동 생성한다.

#### Tasks
- [x] `TodoSchedule` Entity 구현 및 Entity 단위 테스트
- [x] `TodoScheduleRepository` 구현 및 `@DataJpaTest` 기반 쿼리 테스트
- [x] `ScheduleRequest`, `ScheduleUpdateRequest`, `ScheduleResponse` DTO 구현
- [x] `TodoScheduleService` 인터페이스 + `DefaultTodoScheduleService` 구현 및 `@SpringBootTest` 기반 서비스 테스트
- [x] `TodoScheduleController` 구현 및 `@WebMvcTest` 기반 컨트롤러 테스트

#### 검증
```bash
./gradlew test
```
백엔드 재시작 후 DB에 `todo_schedules` 테이블 자동 생성 확인

---

### Phase 24. 프론트엔드 API 연동
**목적**: Phase 21 mock 데이터를 실제 API 호출로 교체한다.
**의존 단계**: Phase 23 완료 후

#### Tasks
- [x] `src/hooks/useTodoSchedules.ts` — GET/POST/PUT/DELETE 훅 구현
- [x] `usePlannerTodos.ts` — mock 제거, `useTodos` + `useTodoSchedules` 병렬 호출로 교체
  - `todoId`로 조인: `scheduledTodos` / `unscheduledTodos` 분리
  - DnD `onDragEnd` → POST/DELETE API 호출 + 낙관적 업데이트 + 실패 시 롤백
- [x] `docs/spec.md`, `docs/prd.md` 업데이트 (이미 반영됨)

#### 검증
- 풀 → 10:00 슬롯 드래그 → 이벤트 카드 10:00 렌더링, DB `todo_schedules` 행 생성
- 이벤트 → 풀 드래그 → 행 삭제
- 날짜 이동 → 해당 날짜 데이터 갱신

---

---

### Phase 25. 플래너 FullCalendar 마이그레이션
**목적**: 커스텀 픽셀 계산 그리드를 FullCalendar `timeGridDay` 기반으로 전면 교체하여 이벤트 DnD·리사이즈·렌더링을 프레임워크에 위임한다.
**의존 단계**: Phase 24 완료 후

#### Tasks
- [x] `@fullcalendar/react`, `@fullcalendar/timegrid`, `@fullcalendar/interaction` 설치
- [x] `PlannerCalendar.tsx` 구현 — FullCalendar 기반 시간 그리드 (00:00~24:00, 10분 스냅)
  - `eventDrop` / `eventResize` / `eventReceive` 핸들러로 PUT/POST/DELETE API 연동
  - `eventContent` 커스텀 렌더러 — Checkbox, 시간, 태그, 카테고리, 우선순위 뱃지
  - 드래그 중 자동 스크롤 (RAF 기반 마우스 Y 감지)
- [x] `globals.css` — FullCalendar 스타일 오버라이드 (`.fc-planner-wrap` 스코프)
- [x] `PlannerPool.tsx` — `@fullcalendar/interaction`의 `Draggable` API로 풀 아이템 외부 드래그 연동
- [x] 기존 커스텀 그리드 컴포넌트(`PlannerTimeGrid`, `PlannerEventCard`, `PlannerPoolCard`) 및 `src/lib/planner.ts` 제거

---

### Phase 26. 플래너 모바일 대응 및 UX 개선
**목적**: 모바일/태블릿에서 플래너를 탭 방식으로 표시하고 전반적인 레이아웃·스타일을 개선한다.
**의존 단계**: Phase 25 완료 후

#### Tasks
- [x] `PlannerView.tsx` — 1280px 미만에서 탭 모드 전환 (`useMediaQuery`)
  - '일정' / '할 일' 탭으로 `PlannerCalendar`·`PlannerPool` 토글
  - 탭 모드에서 `PlannerCalendar`에 `disableDnd={true}` 전달 → FullCalendar `editable`/`droppable` 비활성화
- [x] `PlannerScheduleModal.tsx` — 스케줄 생성/수정/삭제 다이얼로그
- [x] 전반적인 레이아웃 및 스타일 개선 (카드 border, 라벨, 반응형 여백 등)

---

## 4. 위험 요소 & 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| Supabase 연결 정보 누락/오류 | 중 | 환경변수 설정 후 `bootRun` 전 연결 확인 |
| PostgreSQL 타입 변경으로 JPA 매핑 오류 | 중 | Phase 9 직후 앱 기동 및 CRUD 동작 확인 |
| 세션 쿠키가 배포 도메인에서 전달 안 됨 | 중 | CORS `allowCredentials`, `SameSite` 설정 확인 |
| 주간 통계 월요일 기준 계산 오류 | 중 | 다양한 요일에서 테스트 |
| 월간 통계 빈 날짜 처리 누락 | 중 | 응답에 0인 날짜도 포함되는지 확인 |

