# Todo

개인 생산성 향상을 위한 Todo 웹 애플리케이션.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 백엔드 | Spring Boot 3.5, Java 17, Spring Data JPA |
| 프론트엔드 | Next.js 16, TypeScript, Tailwind CSS 4 |
| 데이터베이스 | Supabase (PostgreSQL) |
| 인증 | 커스텀 필터 + HttpSession (단일 비밀번호) |

## 주요 기능

- **Todo 관리** — 생성, 수정, 삭제, 완료 토글, 우선순위 (HIGH / MEDIUM / LOW)
- **카테고리 & 태그** — 색상 기반 카테고리와 태그로 분류
- **필터 & 검색** — 카테고리, 태그, 우선순위, 완료 여부, 키워드, 마감일 필터
- **캘린더 뷰** — 월간 캘린더에서 마감일 시각화 및 인라인 관리
- **통계 대시보드** — 완료율, 카테고리별 현황, 주간/월간 추이 차트
- **순서 변경** — 그룹 내 Todo 드래그로 수동 정렬

## 프로젝트 구조

```
todo/
├── backend/          # Spring Boot 애플리케이션
│   ├── src/
│   └── openapi.yml   # OpenAPI 3.0 스펙
├── frontend/         # Next.js 애플리케이션
│   └── src/
└── docs/
    ├── prd.md        # 제품 요구사항
    ├── spec.md       # 기술 설계
    └── plan.md       # 구현 계획
```

## 실행 방법

### 사전 조건

- Java 17
- Node.js 20+
- Supabase 프로젝트 (PostgreSQL)

### 백엔드

```bash
cd backend

# 환경변수 파일 생성
cp .env.example .env  # Supabase 연결 정보 입력

# 실행
./gradlew bootRun
```

**환경변수** (`backend/.env`):

```
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres.<project-ref>
SPRING_DATASOURCE_PASSWORD=<password>
APP_PASSWORD=<your-app-password>
APP_CORS_ORIGIN=http://localhost:3000
```

### 프론트엔드

```bash
cd frontend
npm install
npm run dev
```

프론트엔드는 `/api/**` 요청을 `http://localhost:8080`으로 프록시한다.

## API

전체 OpenAPI 3.0 스펙: [`backend/openapi.yml`](backend/openapi.yml)

Base URL: `/api`

| 도메인 | 엔드포인트 |
|---|---|
| Todos | `GET/POST /api/todos` · `GET/PUT/PATCH/DELETE /api/todos/{id}` · `PATCH /api/todos/reorder` |
| Categories | `GET/POST /api/categories` · `PUT/DELETE /api/categories/{id}` |
| Tags | `GET/POST /api/tags` · `PUT/DELETE /api/tags/{id}` |
| Stats | `GET /api/stats` |
| Auth | `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` |

## 개발 환경

**IDE**
- IntelliJ IDEA
- Antigravity IDE

**AI Agent**
- Claude Code
- Gemini 3.1 Pro
