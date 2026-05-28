# 나만을 위한 Todo 웹 애플리케이션 구현 계획

## Context
개인용 Todo 웹앱을 처음부터 만드는 작업. 심플하면서도 카테고리/태그/우선순위/마감일/캘린더/통계 등의 생산성 기능을 갖춤.
- **백엔드**: Spring Boot (Java + Gradle) + SQLite
- **프론트엔드**: Nuxt 3 (Vue 3)
- **구조**: 모노레포 (한 폴더에 frontend/, backend/ 공존)

SQLite `.db`는 gitignore, `backup.sql` + `schema.sql`은 git 추적하여 실수 삭제 시 복구 가능하도록 설계.

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| 백엔드 | Spring Boot 3.5.0 (Java 17, Gradle) |
| ORM | Spring Data JPA + Hibernate 6 |
| DB | SQLite (`org.xerial:sqlite-jdbc:3.47.1.0`) |
| SQLite Dialect | `org.hibernate.community.dialect.SQLiteDialect` |
| 프론트엔드 | Nuxt 3 (Vue 3) |
| 스타일 | Tailwind CSS |
| 아이콘 | `lucide-vue-next` |
| 캘린더 | `v-calendar` |
| 차트 | `chart.js` + `vue-chartjs` |
| 날짜 유틸 | `dayjs` |

---

## DB 관리 전략

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

### Spring Boot DB 설정 (`application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:sqlite:./db/todo.db
    driver-class-name: org.sqlite.JDBC
  jpa:
    database-platform: org.hibernate.community.dialect.SQLiteDialect
    hibernate:
      ddl-auto: update
    show-sql: false
    open-in-view: false
```

---

## DB 스키마 (`backend/db/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL UNIQUE,
  color      TEXT     NOT NULL DEFAULT '#6366f1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT    NOT NULL UNIQUE,
  color TEXT    DEFAULT '#94a3b8'
);

CREATE TABLE IF NOT EXISTS todos (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  title        TEXT     NOT NULL,
  description  TEXT,
  completed    BOOLEAN  NOT NULL DEFAULT 0,
  priority     TEXT     NOT NULL CHECK(priority IN ('HIGH','MEDIUM','LOW')) DEFAULT 'MEDIUM',
  due_date     DATE,
  category_id  INTEGER  REFERENCES categories(id) ON DELETE SET NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS todo_tags (
  todo_id INTEGER NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)
);
```

---

## 프로젝트 구조 (모노레포)

```
todo/
├── .gitignore
├── README.md
├── docs/
│   ├── prd.md
│   └── implementation_plan.md
├── guidelines/
│   ├── 1_prd-guideline.md
│   ├── 2_spec-guideline.md
│   └── 3_plan-guideline.md
├── scripts/
│   ├── db-backup.sh
│   └── db-restore.sh
├── backend/                # Spring Boot (Java 17 + Gradle)
│   ├── build.gradle
│   ├── settings.gradle
│   ├── db/
│   │   ├── todo.db         # .gitignore
│   │   ├── schema.sql
│   │   └── backup.sql
│   └── src/main/
│       ├── java/revi1337/todo/
│       │   ├── TodoApplication.java
│       │   ├── domain/
│       │   │   ├── todo/
│       │   │   │   ├── Todo.java
│       │   │   │   ├── TodoRepository.java
│       │   │   │   ├── TodoService.java
│       │   │   │   └── TodoController.java
│       │   │   ├── category/
│       │   │   │   ├── Category.java
│       │   │   │   ├── CategoryRepository.java
│       │   │   │   ├── CategoryService.java
│       │   │   │   └── CategoryController.java
│       │   │   ├── tag/
│       │   │   │   ├── Tag.java
│       │   │   │   ├── TagRepository.java
│       │   │   │   └── TagController.java
│       │   │   └── stats/
│       │   │       └── StatsController.java
│       │   └── common/
│       │       ├── ApiResponse.java
│       │       └── WebConfig.java
│       └── resources/
│           └── application.properties
└── frontend/               # Nuxt 3 (Vue 3)
    ├── nuxt.config.ts
    ├── package.json
    ├── pages/
    │   ├── index.vue
    │   ├── calendar.vue
    │   └── stats.vue
    ├── components/
    │   ├── todo/
    │   │   ├── TodoList.vue
    │   │   ├── TodoItem.vue
    │   │   └── TodoForm.vue
    │   ├── filter/
    │   │   └── FilterSidebar.vue
    │   └── ui/
    │       ├── PriorityBadge.vue
    │       ├── CategoryBadge.vue
    │       └── TagBadge.vue
    └── composables/
        ├── useTodos.ts
        ├── useCategories.ts
        └── useStats.ts
```

---

## REST API 설계 (포트 8080)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/todos` | 목록 조회 (query: category, tag, priority, completed, search, dueDate) |
| POST | `/api/todos` | 생성 |
| PUT | `/api/todos/{id}` | 수정 (완료 토글 포함) |
| DELETE | `/api/todos/{id}` | 삭제 |
| GET | `/api/categories` | 카테고리 목록 |
| POST | `/api/categories` | 카테고리 생성 |
| DELETE | `/api/categories/{id}` | 카테고리 삭제 |
| GET | `/api/tags` | 태그 목록 |
| POST | `/api/tags` | 태그 생성 |
| GET | `/api/stats` | 통계 (완료율, 카테고리별, 7일 추이) |

### 공통 응답 형식
```json
{ "success": true, "data": {}, "message": null }
```

### CORS
`localhost:3000` 허용 (`WebMvcConfigurer`)

### Nuxt 프록시
```ts
routeRules: { '/api/**': { proxy: 'http://localhost:8080/api/**' } }
```

---

## Gradle 의존성 (`backend/build.gradle`)

```groovy
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.5.0'
    id 'io.spring.dependency-management' version '1.1.7'
}

group = 'revi1337.todo'
version = '0.0.1-SNAPSHOT'

java {
    toolchain { languageVersion = JavaLanguageVersion.of(17) }
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-validation'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.xerial:sqlite-jdbc:3.47.1.0'
    implementation 'org.hibernate.orm:hibernate-community-dialects'
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testCompileOnly 'org.projectlombok:lombok'
    testRuntimeOnly 'org.junit.platform:junit-platform-launcher'
    testAnnotationProcessor 'org.projectlombok:lombok'
}
```

---

## 구현 순서

1. **모노레포 초기화** — 폴더 구조, `.gitignore`, `README.md`, scripts 작성
2. **Spring Boot 백엔드** — 프로젝트 초기화, SQLite 연동, JPA Entity 작성
3. **API 구현** — Categories → Tags → Todos CRUD → Stats
4. **Nuxt 3 프론트엔드** — 프로젝트 초기화, Tailwind CSS, API proxy 설정
5. **기본 레이아웃** — 네비게이션 바, NuxtLayout/NuxtPage 연결
6. **메인 페이지** (`/`) — Todo 목록, 생성/수정 모달, 필터 사이드바
7. **캘린더 페이지** (`/calendar`) — v-calendar로 날짜별 Todo 표시, 날짜 클릭 시 해당 날짜 Todo 목록 + 생성/수정/삭제 전체 CRUD 지원 (생성 시 클릭한 날짜가 마감일로 자동 설정)
8. **통계 페이지** (`/stats`) — 전체 완료율, 카테고리별 현황, 이번 주 완료 추이 (월요일 시작 고정 주간), 이번 달 완료 추이 (1일~말일 일별 바차트)
9. **UI 마무리** — D-day 뱃지, 우선순위 색상, 반응형
10. **git 설정** — pre-commit hook 등록, `backup.sql` 초기화

---

## 검증 방법

1. `cd backend && ./gradlew bootRun` → API 서버 기동 확인 (포트 8080)
2. `cd frontend && npm run dev` → 프론트 기동 확인 (포트 3000)
3. Todo 생성/완료/수정/삭제 동작 확인
4. 카테고리·태그 할당 및 필터 동작 확인
5. 마감일 설정 후 D-day 뱃지 표시 확인
6. `/calendar` 날짜 클릭 → Todo 목록 확인, 생성 시 마감일 자동 설정 확인, 수정/삭제 동작 확인
7. `/stats` 페이지 차트 렌더링 확인
8. `./scripts/db-backup.sh` 실행 후 `backend/db/backup.sql` 내용 확인
9. `backend/db/todo.db` 삭제 후 `./scripts/db-restore.sh`로 복원 확인
