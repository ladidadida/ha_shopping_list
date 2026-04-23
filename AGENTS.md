# AGENTS.md – Coding Agent Guidelines

This file describes conventions, commands, and constraints for AI agents working in this repository.

## Project Summary

`ha-shopping-list` is a Home Assistant Add-on: a self-hosted shopping list manager with a FastAPI backend, a React frontend (served as static files), and SQLite persistence. It is deployed via HA Ingress, with no exposed external port.

## Repository Layout

```
src/ha_shopping_list/   # Python package (FastAPI app, models, CLI entrypoint)
tests/
  unit/                 # Pure unit tests (no I/O, no DB)
  integration/          # Tests against in-process app with a real (tmp) SQLite DB
  component/            # End-to-end CLI / HTTP tests
spec/                   # Architecture and roadmap documents
frontend/               # React (Vite) source – compiled artefacts are NOT committed
  dist/                 # Build output (git-ignored), served by FastAPI at runtime
ha-addon/               # HA add-on metadata: config.yaml, build.yaml, run.sh, Dockerfile
```

## Tech Stack

| Layer | Technology |
|---|---|
| Backend language | Python ≥ 3.14 |
| Web framework | FastAPI |
| ORM / DB | SQLModel + SQLite (`/data/shoppinglist.db`) |
| Frontend | React 19 + Vite |
| Packaging | `uv` + `hatchling` with `hatch-vcs` versioning |
| Task runner | `bam` (`bam.yaml`) |
| Linter / formatter | `ruff` |
| Type checker | `pyright` |
| Test runner | `pytest` |

## Development Commands

```bash
# Install all dependencies (including dev)
uv sync --all-groups

# Run linter
uv run ruff check src tests

# Format code
uv run ruff format src tests

# Type-check
uv run pyright

# Run unit tests
uv run pytest tests/unit

# Run integration tests
uv run pytest tests/integration

# Run component / e2e tests
uv run pytest tests/component

# Run all checks via bam
uv run bam
```

## Coding Conventions

### Python

- Target **Python 3.14**; use `from __future__ import annotations` in every module.
- All public functions must have type annotations; rely on `pyright` in strict mode.
- Follow `ruff` defaults; line length 88.
- Never use `print()` for application logging – use Python's `logging` module with a named logger (`logging.getLogger(__name__)`).
- Database sessions must be dependency-injected via FastAPI's `Depends`; never create sessions inside route handlers directly.
- Use `SQLModel` table models for DB entities; use separate Pydantic-only models (no `table=True`) for request/response schemas.
- All DB mutations go through service functions in a `services/` subpackage – route handlers must not contain business logic.

### API Design

- REST, JSON, versioned under `/api/v1/`.
- Use standard HTTP status codes strictly (200, 201, 204, 404, 422).
- Returning empty lists is always `200 []`, never `404`.
- Endpoints must be designed for external consumption from the start (see PROJECT_START.md).

### Frontend

- React functional components only, no class components.
- State management via React Query for server state; `useState`/`useReducer` for local UI state.
- Tailwind CSS for styling.
- The Ingress base path is read at runtime from `<meta name="ingress-path">` in `index.html`; the API client must prepend it to every request.
- No hardcoded `/api/…` paths anywhere outside the single API client module.

### Tests

- Unit tests: pure functions, no filesystem, no network, no DB.
- Integration tests: use `pytest-anyio` with an in-process FastAPI `TestClient` and a temporary SQLite file.
- Component / e2e tests: spin up the full CLI/server, issue real HTTP requests.
- Every new route needs at least one integration test.
- Fixtures live in `tests/conftest.py`; keep them minimal.

## Architecture Rules

1. **No business logic in route handlers.** Handlers call services; services call repositories or ORM.
2. **No direct SQLite access outside SQLModel sessions.** Do not use `sqlite3` or raw SQL strings.
3. **Frontend build artefact (`frontend/dist/`) is not committed.** The Dockerfile builds it during the image build stage.
4. **`/data` is HA-managed storage.** The application must never assume it can write anywhere else at runtime.
5. **Ingress path is dynamic.** The backend injects it into `index.html` on startup via the `X-Ingress-Path` header; never hardcode it.

## Security Checklist (OWASP Top 10)

- Validate all inputs with Pydantic models (FastAPI enforces this automatically for request bodies).
- Parameterize all DB queries – never format SQL strings.
- Set CORS policy to allow only the HA Ingress origin.
- Do not log or return internal exception traces to clients; use a global exception handler.
- SQLite file must have `600` permissions.

## What NOT to Do

- Do not add features beyond the current milestone without updating `spec/roadmap.md`.
- Do not commit secrets, tokens, or credentials.
- Do not install packages not listed in `pyproject.toml`; add them there first.
- Do not skip type annotations to silence `pyright` errors – fix the types instead.
- Do not alter `bam.yaml` task definitions without understanding caching implications.
