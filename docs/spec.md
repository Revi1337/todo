# Technical Spec — 나만을 위한 Todo 웹 애플리케이션

어떻게 설계할 것인가 (기술 스택, 아키텍처, 데이터 모델, API)

- **관련 PRD**: `docs/prd.md`
- **작성일**: 2026-05-28

---

## 1. 개요

Spring Boot(백엔드) + Next.js 15(프론트엔드) + Supabase PostgreSQL(DB)로 구성된 배포형 모노레포 앱.
`docs/prd.md`에 정의된 기능을 구현하기 위한 기술 설계 문서.

---

## 2. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 백엔드 언어 | Java | 17 |
| 백엔드 프레임워크 | Spring Boot | 3.5.0 |
| ORM | Spring Data JPA + Hibernate | 6.x (Spring Boot 관리) |
| DB | Supabase (PostgreSQL) | - |
| DB 드라이버 | postgresql (JDBC) | - |
| 빌드 도구 | Gradle | - |
| 인증 | 커스텀 필터 + HttpSession | - |
| 프론트엔드 프레임워크 | Next.js | 16.x (App Router) |
| 프론트엔드 언어 | TypeScript | - |
| UI 프레임워크 | React | 19.x (Next.js 내장) |
| CSS | Tailwind CSS | 4.x |
| 차트 | react-chartjs-2 + chart.js | - |
| 아이콘 | lucide-react | - |
| 날짜 | dayjs | - |

---

## 3. 아키텍처 설계

### 시스템 구성도
```
[Browser]
    │ HTTPS (배포 도메인)
    ▼
[Next.js 15 (배포)]
    │ Proxy /api/** → Spring Boot
    ▼
[Spring Boot]
    │ JDBC (PostgreSQL)
    ▼
[Supabase PostgreSQL]
```

### 화면 경로

| 경로 | 화면 |
|------|------|
| `/login` | 로그인 |
| `/` | 메인 Todo 목록 |
| `/calendar` | 캘린더 뷰 |
| `/stats` | 통계 대시보드 |

### 패키지 구조
```
revi1337.todo
├── domain
│   ├── todo        (Todo, TodoRepository, TodoQueryService, TodoCommandService, LoggingTodoService, TodoController)
│   ├── category    (Category, CategoryRepository, CategoryQueryService, CategoryCommandService, LoggingCategoryService, CategoryController)
│   ├── tag         (Tag, TagRepository, TagQueryService, TagCommandService, TagController)
│   ├── stats       (StatsController)
│   └── health      (HealthController)
└── common
    ├── ApiResponse  (공통 응답 래퍼)
    ├── WebConfig    (CORS 설정, AuthFilter 등록)
    └── auth
        ├── AuthFilter      (OncePerRequestFilter, 세션 체크)
        └── AuthController  (login / logout / me)
```

> 각 도메인은 CQRS 패턴을 적용한다. `QueryService` (조회), `CommandService` (쓰기), `LoggingService` (데코레이터 계층)으로 분리.

---

## 4. 데이터 모델

### ERD
```
categories ──< todos >──< todo_tags >── tags
```
- `todos` : `categories` = N : 1 (category_id FK, nullable)
- `todos` : `tags` = N : N (todo_tags 중간 테이블)

### 테이블 정의

**categories**
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | |
| name | VARCHAR | NOT NULL, UNIQUE | 카테고리 이름 |
| color | VARCHAR | NOT NULL, DEFAULT '#6366f1' | HEX 색상 코드 |
| created_at | TIMESTAMP | DEFAULT NOW() | |

**tags**
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | |
| name | VARCHAR | NOT NULL, UNIQUE | 태그 이름 |
| color | VARCHAR | DEFAULT '#94a3b8' | HEX 색상 코드 |

**todos**
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | BIGSERIAL | PK | |
| title | VARCHAR | NOT NULL | 제목 |
| description | TEXT | nullable | 설명 |
| completed | BOOLEAN | NOT NULL, DEFAULT false | 완료 여부 |
| priority | VARCHAR | CHECK(HIGH/MEDIUM/LOW), DEFAULT 'MEDIUM' | 우선순위 |
| due_date | DATE | nullable | 마감일 |
| category_id | BIGINT | FK → categories.id, nullable | 카테고리 |
| created_at | TIMESTAMP | DEFAULT NOW() | |
| updated_at | TIMESTAMP | DEFAULT NOW() | |
| completed_at | TIMESTAMP | nullable | 완료 처리 시각 |
| position | INTEGER | NOT NULL, DEFAULT 0 | 그룹 내 정렬 순서 (0-based) |

**todo_tags** (중간 테이블)
| 컬럼 | 타입 | 제약 |
|------|------|------|
| todo_id | BIGINT | FK → todos.id |
| tag_id | BIGINT | FK → tags.id |
| PK | | (todo_id, tag_id) 복합키 |

### 인덱스 전략
- `todos(category_id)` — 카테고리 필터 쿼리
- `todos(due_date)` — 캘린더 날짜 조회
- `todos(completed, completed_at)` — 통계 쿼리

---

## 5. DB 관리 전략

Supabase가 클라우드에서 PostgreSQL을 관리한다. 별도 파일 백업 불필요.

### 연결 설정

연결 정보는 환경변수로 주입한다. `.env`는 `.gitignore`에 추가.

```
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-{region}.pooler.supabase.com:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres.{project_ref}
SPRING_DATASOURCE_PASSWORD=your-password
APP_PASSWORD=your-app-password
```

### Spring Boot DB 설정 (`application.yml`)
```yaml
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL}
    username: ${SPRING_DATASOURCE_USERNAME}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    open-in-view: false
```

---

## 6. 인증 설계

- **방식**: 커스텀 `OncePerRequestFilter` + `HttpSession` (Spring Security 미사용)
- **자격증명**: 환경변수 `APP_PASSWORD` 단일 비밀번호
- **보호 범위**: `GET` 요청은 인증 불필요 (누구나 조회 가능), `POST/PUT/DELETE`는 인증 필요
- **항상 허용**: `/api/auth/**`
- **미인증 응답**: `401 Unauthorized`

### 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/auth/login` | 비밀번호 검증 후 세션 발급 |
| POST | `/api/auth/logout` | 세션 무효화 |
| GET | `/api/auth/me` | 인증 여부 확인 |

### 인증 흐름

```
요청
 │
 ├─ GET 요청? → 통과 (인증 불필요)
 ├─ /api/auth/**? → 통과
 │
 ▼
AuthFilter — 세션에 authenticated=true ? → 통과
                │ 없으면
                ▼
            401 반환
```

---

## 7. API 설계

> 전체 OpenAPI 3.0 스펙: `backend/openapi.yml`

### 공통 규칙
- Base URL: `/api`
- Content-Type: `application/json`
- 날짜 형식: `YYYY-MM-DD`
- 공통 응답 형식:
```json
{ "success": true,  "data": {},   "message": null  }
{ "success": false, "data": null, "message": "에러 설명" }
```

### Todos

#### GET /api/todos
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| category | Long | 카테고리 ID 필터 |
| tag | Long | 태그 ID 필터 |
| priority | String | HIGH / MEDIUM / LOW |
| completed | Boolean | 완료 여부 필터 |
| search | String | 제목/설명 키워드 |
| dueDate | String | 특정 날짜의 Todo (캘린더용, YYYY-MM-DD) |

#### GET /api/todos/{id}
**200** 단건 Todo / **404** 없음

#### POST /api/todos
```json
{
  "title": "스프링 공부",       // required
  "description": "JPA 챕터",   // optional
  "priority": "HIGH",          // optional, default: MEDIUM
  "dueDate": "2026-06-01",     // optional
  "categoryId": 1,             // optional
  "tagIds": [1, 2]             // optional
}
```
**201** 생성된 Todo 객체 / **400** 유효성 검사 실패

#### PUT /api/todos/{id}
POST와 동일 구조 + `completed` 필드 포함. **200** 수정된 Todo / **400** 유효성 오류 / **404** 없음

#### PATCH /api/todos/{id}
완료 상태 부분 수정.
```json
{ "completed": true }
```
**204** No Content / **404** 없음

#### PATCH /api/todos/reorder
Todo 순서 일괄 변경.
```json
{ "items": [{ "id": 1, "position": 0 }, { "id": 2, "position": 1 }] }
```
**204** No Content

#### DELETE /api/todos/{id}
**204** No Content / **404** 없음

---

### Categories

| Method | Path | 설명 | 응답 |
|--------|------|------|------|
| GET | `/api/categories` | 전체 목록 | 200 |
| POST | `/api/categories` | 생성 (name, color) | 201 |
| PUT | `/api/categories/{id}` | 수정 (name, color) | 200 |
| DELETE | `/api/categories/{id}` | 삭제, 연결 Todo의 category → null | 204 |

---

### Tags

| Method | Path | 설명 | 응답 |
|--------|------|------|------|
| GET | `/api/tags` | 전체 목록 | 200 |
| POST | `/api/tags` | 생성 (name, color) | 201 |
| PUT | `/api/tags/{id}` | 수정 (name, color) | 200 |
| DELETE | `/api/tags/{id}` | 삭제 | 204 |

---

### Stats

#### GET /api/stats
```json
{
  "totalCount": 42,
  "completedCount": 30,
  "completionRate": 71.4,
  "byCategory": [
    { "categoryName": "개발", "total": 20, "completed": 15 }
  ],
  "weeklyTrend": [
    { "day": "MON", "date": "2026-05-26", "count": 3 }
  ],
  "monthlyTrend": [
    { "date": "2026-05-01", "count": 2 },
    { "date": "2026-05-02", "count": 0 }
  ]
}
```

---

## 8. 핵심 로직 설계

### 완료 토글
- `completed=true` → `completedAt = 현재 시각`, `updatedAt = 현재 시각`
- `completed=false` → `completedAt = null`, `updatedAt = 현재 시각`

### 캘린더 날짜 클릭
- 조회: `GET /api/todos?dueDate=2026-06-01` → `WHERE due_date = '2026-06-01'`
- 생성: 프론트에서 클릭한 날짜를 `dueDate` 필드에 자동 세팅 후 POST

### 이번 주 완료 추이
```sql
SELECT completed_at::date AS date, COUNT(*) AS count
FROM todos
WHERE completed = true
  AND completed_at::date BETWEEN {이번주 월요일} AND {이번주 일요일}
GROUP BY completed_at::date
```
→ 월요일 고정 시작 (ISO 기준), 데이터 없는 요일은 count=0으로 채워서 반환

### 이번 달 완료 추이
```sql
SELECT completed_at::date AS date, COUNT(*) AS count
FROM todos
WHERE completed = true
  AND completed_at::date BETWEEN {1일} AND {말일}
GROUP BY completed_at::date
```
→ 데이터 없는 날짜는 count=0으로 채워서 반환

---

## 9. 에러 처리 전략

| 코드 | 상황 |
|------|------|
| 200 | 성공 |
| 201 | 리소스 생성 성공 |
| 204 | 삭제/완료 토글 성공 (No Content) |
| 400 | 입력값 유효성 오류 |
| 401 | 미인증 (세션 없음) |
| 404 | 리소스 없음 |
| 500 | 서버 내부 오류 |

- `@ControllerAdvice` 전역 예외 핸들러 (향후 추가)
- `MethodArgumentNotValidException` → 400
- `EntityNotFoundException` → 404
