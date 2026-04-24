# Stage 1 – Build the React frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /build/frontend

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests first for layer caching
COPY frontend/package.json frontend/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copy the rest of the frontend source and build
COPY frontend/ .
RUN pnpm run build

# ──────────────────────────────────────────────────────────────
# Stage 2 – Runtime image (HA base with Python 3.14, multi-arch manifest)
FROM ghcr.io/home-assistant/base-python:3.14

LABEL \
    io.hass.name="Shopping List" \
    io.hass.description="A fast, mobile-friendly shopping list for Home Assistant." \
    io.hass.type="addon" \
    io.hass.version="0.1.0"

# Install uv for fast, reproducible installs
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Copy Python project files
COPY pyproject.toml uv.lock README.md ./
COPY src/ ./src/

# Install the Python package (no dev deps, no editable mode)
RUN uv sync --no-dev --frozen

# Make the venv's binaries available without explicit activation
ENV PATH="/app/.venv/bin:$PATH"

# Copy the compiled frontend into the well-known location expected by app.py
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# Copy the add-on entrypoint
COPY run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]
