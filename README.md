# LMS - Technical Assessment

Full-stack Learning Management System covering all four roles from the spec (Super Admin, Admin, Instructor, Student) plus the bonus features: Socket.io real-time notifications, email simulation with Ethereal, and unit tests for the auth service.

**Stack:** Next.js 16 · Express 5 · PostgreSQL · Prisma · Redux Toolkit + RTK Query · Socket.io · Tailwind CSS v4 · TypeScript throughout · pnpm monorepo

### **Live:** [lms.adibdev.me](https://lms.adibdev.me) · API: [lms-api.adibdev.me](https://lms-api.adibdev.me)

---

## Running locally

You'll need Node.js 20+, pnpm 9+, and a Postgres database.

```bash
# Backend
cd backend
cp .env.example .env        # fill in DATABASE_URL and JWT secrets
pnpm install
pnpm db:migrate             # runs prisma migrate dev
pnpm db:seed                # creates test accounts + sample data
pnpm dev                    # http://localhost:8000

# Frontend (separate terminal)
cd frontend
cp .env.local.example .env.local
pnpm install
pnpm dev                    # http://localhost:3000
```

Backend env vars that actually need filling in:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/lms
JWT_ACCESS_SECRET=          # 32+ chars
JWT_REFRESH_SECRET=         # 32+ chars, different from access secret
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

The `SMTP_*` variables can be left empty for local dev. Ethereal generates them automatically on first use and prints a preview URL to the backend console whenever an email would be sent.

`COOKIE_DOMAIN` is only needed when the frontend and backend are deployed on different subdomains (e.g. frontend on Vercel, API on Render). Set it to the shared parent domain with a leading dot — for example `COOKIE_DOMAIN=.adibdev.me` — so the `refresh_token` cookie is accessible to both. Leave it unset for local development.

---

## Test accounts

All seeded accounts share the password **`password123`**

| Role        | Email                    |
| ----------- | ------------------------ |
| Super Admin | superadmin@lms.dev       |
| Admin       | admin@lms.dev            |
| Instructor  | john.instructor@lms.dev  |
| Instructor  | sarah.instructor@lms.dev |
| Student     | alice@example.com        |
| Student     | bob@example.com          |

---

## Architecture

### Backend

Modular feature-based structure. Each module (`auth`, `user`, `course`, `lesson`, `enrollment`, `analytics`, `notification`) is a directory with exactly five files:

```
modules/[feature]/
  *.controller.ts   HTTP handlers - thin, just extracts params and calls service
  *.service.ts      Business logic, ownership checks, orchestration
  *.repository.ts   All Prisma queries, nothing else
  *.dto.ts          Zod schemas for request validation
  *.routes.ts       Express router, middleware chain
```

The request lifecycle is: route → `validate` middleware (Zod) → `authenticate` (JWT Bearer) → `authorize` (role check) → controller → service → repository. Errors propagate up to a central `errorHandler` middleware that maps `AppError` subclasses, Zod errors, and Prisma constraint violations to a consistent JSON shape.

### Auth

Access tokens are JWTs with a 15-minute lifetime, sent as `Authorization: Bearer` headers. Refresh tokens are 64-byte random hex strings stored SHA-256 hashed in the database, with the raw value in an `httpOnly; path=/` cookie. Each `/auth/refresh` call rotates the token - old one deleted, new one issued. A user can have at most 5 active refresh tokens; logging in from a new device drops the oldest one.

On the frontend, the RTK Query base query catches 401s, fires `/auth/refresh` automatically, updates the Redux store, and retries the original request - so components never have to think about token expiry.

### Frontend

Route groups map to protection levels:

- `(public)/` - accessible without auth; `AuthHydrator` wraps the layout and attempts a silent token refresh on hard page loads so the navbar reflects session state correctly
- `(auth)/` - login/register; the `proxy.ts` middleware (Next.js 16's replacement for `middleware.ts`) redirects away if a valid cookie is already present
- `(dashboard)/` - requires the `refresh_token` cookie; `AuthGuard` handles the actual refresh-on-mount and redirects to login on failure

State is Redux + RTK Query. The Socket.io client connects on authentication and listens for `notification:new` and `enrollment:new` events - both handlers call `dispatch(apiSlice.util.invalidateTags([...]))` rather than manually updating state, which keeps the cache as the single source of truth.

### A few implementation details worth noting

**Enrollment as a transaction.** When a student enrolls, the service uses a Prisma transaction to create the `Enrollment` row and pre-populate `LessonProgress` records for every lesson currently in the course. This means progress queries are always a simple `count(isCompleted) / count(total)` join with no conditional inserts needed at completion time.

**Progress recalculation is server-side.** Marking a lesson complete triggers a recalculation in the enrollment service: `(completedLessons / totalLessons) * 100`. If that hits 100, the enrollment status flips to `COMPLETED` and a completion notification is queued. The frontend never calculates progress itself.

**Cursor-based pagination.** All list endpoints use cursor pagination (not offset). The last item's `id` is the cursor for the next page. This means you don't get duplicate or skipped rows when records are inserted between requests - more relevant for the enrollment feed and notification list than courses, but consistent throughout.

**Soft deletes on courses.** Deleted courses set `isDeleted = true` rather than being removed. This preserves enrollment history and prevents analytics queries from losing revenue data for courses that have been taken down.

---

## API reference

Base URL: `http://localhost:8000/api/v1`

### Auth

| Method | Endpoint          | Description             | Auth   |
| ------ | ----------------- | ----------------------- | ------ |
| POST   | /auth/register    | Register (student role) | N/A    |
| POST   | /auth/login       | Login                   | N/A    |
| POST   | /auth/refresh     | Rotate refresh token    | Cookie |
| POST   | /auth/logout      | Revoke refresh token    | Cookie |
| GET    | /auth/me          | Current user            | Bearer |
| PATCH  | /auth/me          | Update profile          | Bearer |
| PATCH  | /auth/me/password | Change password         | Bearer |

### Courses

| Method | Endpoint               | Description                            | Auth        |
| ------ | ---------------------- | -------------------------------------- | ----------- |
| GET    | /courses               | List (search, filter, cursor paginate) | N/A         |
| GET    | /courses/slug/:slug    | Get by slug                            | N/A         |
| GET    | /courses/:id           | Get by ID                              | N/A         |
| POST   | /courses               | Create                                 | Instructor+ |
| PATCH  | /courses/:id           | Update                                 | Instructor+ |
| DELETE | /courses/:id           | Soft delete                            | Instructor+ |
| PATCH  | /courses/:id/status    | Publish / archive                      | Instructor+ |
| POST   | /courses/:id/thumbnail | Upload thumbnail (Cloudinary)          | Instructor+ |
| GET    | /courses/:id/students  | Enrolled students                      | Instructor+ |

### Lessons

| Method | Endpoint                             | Description     | Auth        |
| ------ | ------------------------------------ | --------------- | ----------- |
| GET    | /courses/:courseId/lessons           | List            | N/A         |
| GET    | /courses/:courseId/lessons/:lessonId | Get single      | Bearer      |
| POST   | /courses/:courseId/lessons           | Create          | Instructor+ |
| PATCH  | /courses/:courseId/lessons/:lessonId | Update          | Instructor+ |
| DELETE | /courses/:courseId/lessons/:lessonId | Delete          | Instructor+ |
| PATCH  | /courses/:courseId/lessons/reorder   | Reorder (batch) | Instructor+ |

### Enrollments & Progress

| Method | Endpoint                                          | Description          | Auth    |
| ------ | ------------------------------------------------- | -------------------- | ------- |
| GET    | /enrollments                                      | My enrollments       | Student |
| GET    | /enrollments/:courseId                            | Enrollment detail    | Student |
| POST   | /enrollments/:courseId                            | Enroll               | Student |
| DELETE | /enrollments/:courseId                            | Drop                 | Student |
| GET    | /enrollments/:courseId/progress                   | Progress summary     | Student |
| POST   | /enrollments/:courseId/lessons/:lessonId/complete | Mark lesson complete | Student |

### Analytics

| Method | Endpoint                       | Description                          | Auth       |
| ------ | ------------------------------ | ------------------------------------ | ---------- |
| GET    | /analytics/overview            | Totals: users, courses, enrollments  | Admin+     |
| GET    | /analytics/enrollment-growth   | Daily enrollment count, last 10 days | Admin+     |
| GET    | /analytics/top-courses         | Top 5 by enrollment                  | Admin+     |
| GET    | /analytics/revenue             | Revenue per course                   | Admin+     |
| GET    | /analytics/completion-rates    | Completion rate per instructor       | Admin+     |
| GET    | /analytics/instructor/overview | Own stats                            | Instructor |
| GET    | /analytics/instructor/revenue  | Own revenue                          | Instructor |

### Notifications

| Method | Endpoint                    | Description   | Auth   |
| ------ | --------------------------- | ------------- | ------ |
| GET    | /notifications              | List          | Bearer |
| GET    | /notifications/unread-count | Unread count  | Bearer |
| PATCH  | /notifications/:id/read     | Mark read     | Bearer |
| PATCH  | /notifications/read-all     | Mark all read | Bearer |

### Users

| Method | Endpoint            | Description       | Auth   |
| ------ | ------------------- | ----------------- | ------ |
| GET    | /users              | List (filterable) | Admin+ |
| GET    | /users/:id          | Get               | Admin+ |
| POST   | /users              | Create            | Admin+ |
| PATCH  | /users/:id          | Update            | Admin+ |
| PATCH  | /users/:id/suspend  | Suspend           | Admin+ |
| PATCH  | /users/:id/activate | Activate          | Admin+ |

### Categories

| Method | Endpoint        | Description | Auth   |
| ------ | --------------- | ----------- | ------ |
| GET    | /categories     | List        | N/A    |
| POST   | /categories     | Create      | Admin+ |
| PATCH  | /categories/:id | Update      | Admin+ |
| DELETE | /categories/:id | Delete      | Admin+ |

---

## Tests

```bash
cd backend && pnpm test:run
```

Auth service tests (13 cases): register (success, duplicate email), login (valid credentials, wrong password, suspended account), token refresh (valid, reuse detection, expired token), logout, change password (correct current password, wrong current password), and profile update. Mock strategy uses `vi.mock` on the repository and bcrypt - no database required.

---

## Deployment

### Backend → Render

1. New Web Service, root directory `backend`
2. Build: `pnpm install --frozen-lockfile && pnpm prisma generate && pnpm build`
3. Start: `node dist/server.js`
4. Add all env vars from `.env.example`
5. Attach a Render Postgres instance - its `DATABASE_URL` goes in env vars
6. After first deploy: `pnpm db:deploy` (runs pending migrations)

### Frontend → Vercel

1. New project, root directory `frontend`
2. Set `NEXT_PUBLIC_API_URL` to your Render service URL + `/api/v1`
3. Set `NEXT_PUBLIC_SOCKET_URL` to your Render service URL
4. Deploy - Vercel detects Next.js automatically
