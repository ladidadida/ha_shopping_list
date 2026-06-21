# Technical Design – ha-shopping-list

## 1. Overview

`ha-shopping-list` is a Home Assistant Add-on that provides a mobile-optimised shopping list manager. It is built as a single-container application served entirely over HA Ingress, requiring no additional network configuration.

```
┌──────────────────────────────────────────────────┐
│  Home Assistant                                  │
│                                                  │
│   Browser ──► Ingress Proxy ──► Add-on Container │
│                                  │               │
│                               FastAPI            │
│                              /api/v1/*  ──► SQLite (/data/)
│                              /*         ──► React SPA (static)
└──────────────────────────────────────────────────┘
```

---

## 2. Data Model

### 2.1 Entities

#### Category

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, autoincrement |
| `name` | TEXT | NOT NULL, UNIQUE |
| `sort_order` | INTEGER | NOT NULL, default 0 |

#### Item

| Column | Type | Constraints |
|---|---|---|
| `id` | INTEGER | PK, autoincrement |
| `name` | TEXT | NOT NULL |
| `quantity` | TEXT | nullable |
| `checked` | BOOLEAN | NOT NULL, default false |
| `category_id` | INTEGER | FK → Category.id, nullable |

### 2.2 Seed Data

On first startup (empty DB), the application inserts a set of default categories with sensible sort orders so the list is immediately usable.

Default categories (in order): *Obst & Gemüse*, *Fleisch & Fisch*, *Milchprodukte*, *Tiefkühl*, *Backwaren*, *Getränke*, *Haushalt*, *Sonstiges*.

---

## 3. Backend Architecture

### 3.1 Package Structure

```
src/ha_shopping_list/
├── __init__.py
├── __main__.py          # python -m ha_shopping_list
├── _version.py          # hatch-vcs injected version
├── cli.py               # argparse entry point → starts uvicorn
├── app.py               # FastAPI application factory (create_app)
├── database.py          # SQLModel engine + session dependency
├── models/
│   ├── category.py      # CategoryDB (table), CategoryCreate, CategoryRead
│   └── item.py          # ItemDB (table), ItemCreate, ItemUpdate, ItemRead
├── routers/
│   ├── categories.py    # /api/v1/categories
│   └── items.py         # /api/v1/items
└── services/
    ├── categories.py    # CRUD logic for categories
    └── items.py         # CRUD logic for items
```

### 3.2 Application Factory

`create_app()` in `app.py`:
1. Creates the FastAPI instance.
2. Registers exception handlers (404 → JSON, 422 → JSON, 500 → JSON without trace).
3. Mounts the API routers under `/api/v1`.
4. Mounts the React `dist/` folder as a `StaticFiles` app.
5. Adds a startup event that (a) runs `SQLModel.metadata.create_all` and (b) seeds default categories if the `category` table is empty.
6. Adds a middleware that reads the `X-Ingress-Path` request header and injects it into the `index.html` `<meta name="ingress-path">` tag, then caches the modified HTML.

### 3.3 REST API

Base path: `/api/v1`

#### Categories

| Method | Path | Description |
|---|---|---|
| `GET` | `/categories` | List all categories ordered by `sort_order` |
| `POST` | `/categories` | Create a category |
| `DELETE` | `/categories/{id}` | Delete a category (items become uncategorised) |

#### Items

| Method | Path | Description |
|---|---|---|
| `GET` | `/items` | List all items; supports `?checked=true\|false` filter |
| `POST` | `/items` | Create an item |
| `PATCH` | `/items/{id}` | Partial update (name, quantity, checked, category_id) |
| `DELETE` | `/items/{id}` | Delete a single item |
| `DELETE` | `/items?checked=true` | Bulk-delete all checked items |

All endpoints return `application/json`. Timestamps are deliberately omitted from the MVP schema to keep the model simple.

### 3.4 Session Management

```python
# database.py
from sqlmodel import Session, create_engine

engine = create_engine(str(settings.db_url), echo=False)

def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
```

Route handlers receive `session: Session = Depends(get_session)`.

### 3.5 Settings

A `Settings` Pydantic model (loaded via `pydantic-settings` from environment variables) exposes:

| Variable | Default | Description |
|---|---|---|
| `DB_PATH` | `/data/shoppinglist.db` | Path to the SQLite file |
| `HOST` | `0.0.0.0` | Uvicorn bind address |
| `PORT` | `8099` | Uvicorn port (Ingress-internal) |
| `LOG_LEVEL` | `info` | Uvicorn / application log level |

---

## 4. Frontend Architecture

### 4.1 Tech Stack

- **React 19** with TypeScript
- **Vite** as build tool
- **Tailwind CSS** for styling
- **React Query (TanStack Query v5)** for server state
- **React Router v7** (hash routing to work under any Ingress base path)

### 4.2 Runtime Base-Path Handling

```typescript
// src/api/client.ts
const meta = document.querySelector<HTMLMetaElement>('meta[name="ingress-path"]');
const BASE = meta?.content ?? '';

export const API_BASE = `${BASE}/api/v1`;
```

Every `fetch` / Axios call uses `API_BASE` as prefix – the base path is never hardcoded.

### 4.3 Component Tree

```
App
├── Header
├── AddItemForm
└── CategoryList
    └── CategorySection (per category)
        └── ItemRow (per item)
            ├── Checkbox
            ├── ItemLabel (name + quantity)
            └── DeleteButton
```

### 4.4 Build Output

`vite build` writes to `frontend/dist/`. The Dockerfile copies this into the image at `/app/frontend/dist/`. FastAPI serves it under `/*`.

---

## 5. Home Assistant Add-on Integration

### 5.1 `ha-addon/config.yaml`

```yaml
name: Shopping List
version: "0.1.0"
slug: ha_shopping_list
description: A fast, mobile-friendly shopping list.
url: https://github.com/ladidadida/ha-shopping-list
arch:
  - aarch64
  - amd64
  - armv7
ingress: true
ingress_port: 8099
panel_icon: mdi:cart
panel_title: Shopping List
```

### 5.2 `ha-addon/build.yaml`

```yaml
build_from:
  aarch64: ghcr.io/home-assistant/aarch64-base-python:3.14
  amd64:   ghcr.io/home-assistant/amd64-base-python:3.14
  armv7:   ghcr.io/home-assistant/armv7-base-python:3.14
squash: false
labels:
  io.hass.version: "VERSION"
  io.hass.type: addon
  io.hass.arch: "aarch64|amd64|armv7"
```

### 5.3 `ha-addon/run.sh`

```bash
#!/usr/bin/env bashio
bashio::log.info "Starting ha-shopping-list..."
exec python -m ha_shopping_list \
    --host 0.0.0.0 \
    --port 8099 \
    --db-path /data/shoppinglist.db
```

### 5.4 Dockerfile (Multi-Stage)

```dockerfile
# ── Stage 1: Build frontend ──────────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Runtime image ───────────────────────────────────────────────────
ARG BUILD_FROM
FROM ${BUILD_FROM}

WORKDIR /app
COPY --from=frontend-builder /build/dist ./frontend/dist
COPY pyproject.toml .
COPY src/ ./src/

RUN pip install --no-cache-dir .

COPY ha-addon/run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]
```

---

## 6. Security Considerations

- All inputs are validated by Pydantic / SQLModel before any DB interaction.
- DB queries use SQLModel's ORM (parameterised internally by SQLAlchemy) – no raw SQL strings.
- CORS is restricted to the Ingress host; wildcard CORS is prohibited.
- The SQLite file is created with `600` permissions at startup.
- Internal error details are never exposed in API responses; a global `500` handler returns a generic message.
- The add-on runs as a non-root user inside the container where the HA base image allows it.

---

## 7. Testing Strategy

| Level | Tool | Scope |
|---|---|---|
| Unit | `pytest` | Pure service/model logic, no I/O |
| Integration | `pytest` + `httpx.AsyncClient` | Full FastAPI app, temp SQLite file |
| Component / E2E | `pytest` + subprocess | CLI → uvicorn → HTTP |

Coverage target: ≥ 85 % on `src/`.
