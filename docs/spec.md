# Technical Spec — 나만을 위한 Todo 웹 애플리케이션

어떻게 설계할 것인가 (기술 스택, 아키텍처, 데이터 모델, API)

- **관련 PRD**: `docs/prd.md`
- **작성일**: 2026-05-28

---

## 1. 개요

Spring Boot(백엔드) + Nuxt 3(프론트엔드) + SQLite(DB)로 구성된 로컬 전용 모노레포 앱.
`docs/prd.md`에 정의된 기능을 구현하기 위한 기술 설계 문서.

---

## 2. 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 백엔드 언어 | Java | 17 |
| 백엔드 프레임워크 | Spring Boot | 3.5.0 |
| ORM | Spring Data JPA + Hibernate | 6.x (Spring Boot 관리) |
| DB 드라이버 | sqlite-jdbc | 3.47.1.0 |
| SQLite Dialect | `hibernate-community-dialects` | - |
| 빌드 도구 | Gradle | - |
| 프론트엔드 프레임워크 | Nuxt | 3.x (latest stable) |
| 프론트엔드 언어 | TypeScript | - |
| UI 프레임워크 | Vue | 3.x (Nuxt 내장) |
| CSS | Tailwind CSS | 3.x |

---

## 3. 아키텍처 설계

### 시스템 구성도
```
[Browser]
    │ HTTP (localhost:3000)
    ▼
[Nuxt 3 Dev Server :3000]
    │ Proxy /api/** → :8080
    ▼
[Spring Boot :8080]
    │ JDBC (sqlite-jdbc)
    ▼
[SQLite — backend/db/todo.db]
```

### 화면 경로

| 경로 | 화면 |
|------|------|
| `/` | 메인 Todo 목록 |
| `/calendar` | 캘린더 뷰 |
| `/stats` | 통계 대시보드 |

### 패키지 구조
```
revi1337.todo
├── domain
│   ├── todo        (Todo, TodoRepository, TodoService, TodoController)
│   ├── category    (Category, CategoryRepository, CategoryService, CategoryController)
│   ├── tag         (Tag, TagRepository, TagController)
│   └── stats       (StatsController)
└── common
    ├── ApiResponse  (공통 응답 래퍼)
    └── WebConfig    (CORS 설정)
```

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
| id | INTEGER | PK, AUTOINCREMENT | |
| name | TEXT | NOT NULL, UNIQUE | 카테고리 이름 |
| color | TEXT | NOT NULL, DEFAULT '#6366f1' | HEX 색상 코드 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

**tags**
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT | |
| name | TEXT | NOT NULL, UNIQUE | 태그 이름 |
| color | TEXT | DEFAULT '#94a3b8' | HEX 색상 코드 |

**todos**
| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT | |
| title | TEXT | NOT NULL | 제목 |
| description | TEXT | nullable | 설명 |
| completed | BOOLEAN | NOT NULL, DEFAULT 0 | 완료 여부 |
| priority | TEXT | CHECK(HIGH/MEDIUM/LOW), DEFAULT 'MEDIUM' | 우선순위 |
| due_date | DATE | nullable | 마감일 |
| category_id | INTEGER | FK → categories.id, nullable | 카테고리 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| completed_at | DATETIME | nullable | 완료 처리 시각 |

**todo_tags** (중간 테이블)
| 컬럼 | 타입 | 제약 |
|------|------|------|
| todo_id | INTEGER | FK → todos.id |
| tag_id | INTEGER | FK → tags.id |
| PK | | (todo_id, tag_id) 복합키 |

### 인덱스 전략
- `todos(category_id)` — 카테고리 필터 쿼리
- `todos(due_date)` — 캘린더 날짜 조회
- `todos(completed, completed_at)` — 통계 쿼리

---

## 5. DB 관리 전략

```
backend/db/
├── todo.db       ← 🔴 .gitignore  (런타임 바이너리)
├── schema.sql    ← 🟢 git 추적    (테이블 구조 정의)
└── backup.sql    ← 🟢 git 추적    (전체 덤프, 커밋 전 자동 갱신)
```

| 상황 | 명령 | 결과 |
|------|------|------|
| 최초 설치 / git clone 후 | `./scripts/db-restore.sh` | `backup.sql` → `todo.db` 복원 |
| 평상시 개발 | `./gradlew bootRun` | Spring Boot가 `todo.db` 읽기/쓰기 |
| git commit 전 (자동) | pre-commit hook | `todo.db` → `backup.sql` 자동 덤프 |
| 실수로 `.db` 삭제 시 | `./scripts/db-restore.sh` | `backup.sql`로 100% 복구 ✅ |

### pre-commit hook (`.git/hooks/pre-commit`)
```bash
#!/bin/sh
sqlite3 backend/db/todo.db .dump > backend/db/backup.sql
git add backend/db/backup.sql
```

### Spring Boot DB 설정
```properties
spring.datasource.url=jdbc:sqlite:./db/todo.db
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
```

---

## 6. API 설계

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
POST와 동일 구조 + `completed` 필드 포함. **200** 수정된 Todo / **404** 없음

#### DELETE /api/todos/{id}
**204** No Content / **404** 없음

---

### Categories

| Method | Path | 설명 | 응답 |
|--------|------|------|------|
| GET | `/api/categories` | 전체 목록 | 200 |
| POST | `/api/categories` | 생성 (name, color) | 201 |
| DELETE | `/api/categories/{id}` | 삭제, 연결 Todo의 category → null | 204 |

---

### Tags

| Method | Path | 설명 | 응답 |
|--------|------|------|------|
| GET | `/api/tags` | 전체 목록 | 200 |
| POST | `/api/tags` | 생성 (name, color) | 201 |

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

## 7. 핵심 로직 설계

### 완료 토글
- `completed=true` → `completedAt = 현재 시각`, `updatedAt = 현재 시각`
- `completed=false` → `completedAt = null`, `updatedAt = 현재 시각`

### 캘린더 날짜 클릭
- 조회: `GET /api/todos?dueDate=2026-06-01` → `WHERE due_date = '2026-06-01'`
- 생성: 프론트에서 클릭한 날짜를 `dueDate` 필드에 자동 세팅 후 POST

### 이번 주 완료 추이
```sql
SELECT DATE(completed_at) as date, COUNT(*) as count
FROM todos
WHERE completed = 1
  AND DATE(completed_at) BETWEEN {이번주 월요일} AND {이번주 일요일}
GROUP BY DATE(completed_at)
```
→ 월요일 고정 시작 (ISO 기준), 데이터 없는 요일은 count=0으로 채워서 반환

### 이번 달 완료 추이
```sql
SELECT DATE(completed_at) as date, COUNT(*) as count
FROM todos
WHERE completed = 1
  AND DATE(completed_at) BETWEEN {1일} AND {말일}
GROUP BY DATE(completed_at)
```
→ 데이터 없는 날짜는 count=0으로 채워서 반환

---

## 8. 에러 처리 전략

| 코드 | 상황 |
|------|------|
| 200 | 성공 |
| 201 | 리소스 생성 성공 |
| 204 | 삭제 성공 (No Content) |
| 400 | 입력값 유효성 오류 |
| 404 | 리소스 없음 |
| 500 | 서버 내부 오류 |

- `@ControllerAdvice` 전역 예외 핸들러 (향후 추가)
- `MethodArgumentNotValidException` → 400
- `EntityNotFoundException` → 404
