# Roadmap – ha-shopping-list

Current date: 2026-04-22

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Done |
| 🔄 | In progress |
| ⬜ | Not started |

---

## Phase 0 – Project Bootstrap ✅

- [x] `pyproject.toml` with `uv` + `hatchling` + `hatch-vcs`
- [x] `bam.yaml` task runner (lint, format, typecheck, test-unit, test-integration, test-component)
- [x] `ruff` + `pyright` configuration
- [x] Basic CLI entry point (`ha_shopping_list.cli:main`)
- [x] Pytest scaffold (unit / integration / component)
- [x] `AGENTS.md`, `spec/design.md`, `spec/roadmap.md`

---

## Phase 1 – Backend MVP ✅

Goal: a fully functional REST API with persistent SQLite storage, tested and type-safe.

### 1.1 Infrastructure
- [x] `pydantic-settings` `Settings` model (DB_PATH, HOST, PORT, LOG_LEVEL)
- [x] `database.py` – SQLModel engine + `get_session` dependency
- [x] `create_app()` factory in `app.py`
- [x] Global exception handlers (404, 422, 500)
- [x] Startup event: `create_all` + seed default categories

### 1.2 Data Models
- [x] `models/category.py` – `CategoryDB`, `CategoryCreate`, `CategoryRead`
- [x] `models/item.py` – `ItemDB`, `ItemCreate`, `ItemUpdate`, `ItemRead`

### 1.3 Services
- [x] `services/categories.py` – list, create, delete
- [x] `services/items.py` – list (with optional `checked` filter), create, partial update, delete, bulk-delete checked

### 1.4 Routers
- [x] `routers/categories.py` – `GET /api/v1/categories`, `POST`, `DELETE /{id}`
- [x] `routers/items.py` – `GET /api/v1/items`, `POST`, `PATCH /{id}`, `DELETE /{id}`, `DELETE ?checked=true`

### 1.5 CLI integration
- [x] `cli.py` extended to start `uvicorn` with settings from env / flags

### 1.6 Tests (Backend)
- [x] Unit tests for all service functions (mocked session)
- [x] Integration tests for all routes (TestClient + tmp SQLite)
- [x] ≥ 85 % coverage on `src/`

---

## Phase 2 – Frontend MVP ✅

Goal: a usable React SPA that covers all MVP user stories.

### 2.1 Project setup
- [x] `frontend/` Vite + React 19 + TypeScript scaffold
- [x] Tailwind CSS v4 configured
- [x] TanStack Query v5 + React Router v7 installed
- [x] API client module with dynamic `ingress-path` base URL

### 2.2 Features
- [x] Add item form (name, optional quantity, optional category)
- [x] Item list grouped by category, sorted by `sort_order`
- [x] Check / uncheck item (optimistic update)
- [x] Delete single item
- [x] "Clear checked" bulk action
- [x] Category management drawer (create, delete)

### 2.3 UX / Accessibility
- [ ] Mobile-first responsive layout
- [ ] Touch-friendly tap targets (min 44 px)
- [ ] Keyboard navigable
- [ ] Loading and error states for every async action

**Exit criteria:** All MVP user stories completable without console errors on a mobile viewport.

---

## Phase 3 – HA Add-on Packaging ✅

Goal: installable and runnable as a local HA add-on.

- [x] `ha-addon/config.yaml` (ingress, panel_icon, panel_title, arch list)
- [x] `ha-addon/build.yaml` (arch-specific HA Python base images)
- [x] `ha-addon/run.sh` with `bashio` logging
- [x] Multi-stage `Dockerfile` (Node build → HA runtime)
- [x] Ingress-path injection middleware (reads `X-Ingress-Path`, patches `index.html`)
- [x] SQLite file created at `/data/shoppinglist.db` with `600` permissions
- [ ] Manual smoke-test on a real HA instance (amd64)

**Exit criteria:** Add-on appears in HA sidebar, list is editable, data survives container restart.

---

## Phase 4 – Polish & Hardening ⬜

- [ ] CI pipeline (GitHub Actions): lint → typecheck → test → build Docker image
- [ ] `README.md` with installation and usage instructions
- [ ] API versioning strategy documented
- [ ] Log structured output (JSON) selectable via `LOG_FORMAT` env var
- [ ] aarch64 + armv7 build verified (QEMU or native)
- [ ] Lighthouse score ≥ 90 on mobile

---

## Phase 5 – Extensibility (Post-MVP) ⬜

These items are explicitly deferred until Phase 1–4 are stable.

- [ ] **Recipe module hook** – dedicated endpoint `POST /api/v1/items/bulk` for external services to push a list of items at once
- [ ] **Pantry / stock integration** – link items to a stock level; automatically add to list when stock drops below threshold
- [ ] **Sharing / multi-user** – per-session write tokens so multiple household members can edit concurrently
- [ ] **Offline support** – Service Worker + background sync for poor-connectivity environments
- [ ] **Import / Export** – CSV or JSON round-trip for backup and migration

---

## Known Constraints & Decisions

| Decision | Rationale |
|---|---|
| SQLite only (no Postgres) | HA add-ons run on embedded hardware; SQLite is sufficient for a single-household list. |
| No auth layer | Ingress handles HA session auth; the add-on trusts all requests arriving via Ingress. |
| No WebSocket / SSE in MVP | Polling via React Query is sufficient; real-time can be added later without breaking API clients. |
| Static frontend committed as build artefact inside image | Keeps the add-on installation simple (no npm at runtime). |
| Hash routing in React | Required so that deep links work under a dynamic Ingress sub-path without server-side routing. |
