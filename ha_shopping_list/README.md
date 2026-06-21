# ha-shopping-list

A fast, mobile-friendly shopping list add-on for Home Assistant.

## Features

- **Multiple lists** – create one list per store or purpose; switch with a single tap
- **Category organisation** – assign items to categories (e.g. Dairy, Vegetables); items are grouped and sorted automatically
- **Inline item editing** – tap the ✏️ icon on any item to edit its name, quantity, or category without leaving the page
- **Quick-add per category** – tap **+** next to a category heading to add directly into that category
- **Check off & clear** – tick items as you shop; use "Erledigte löschen" to bulk-remove finished items
- **Persistent storage** – all data lives in `/data/shoppinglist.db` (a plain SQLite file), survives restarts and is included in HA backups

## Installation

1. In Home Assistant, go to **Settings → Add-ons → Add-on Store**.
2. Click the three-dot menu (⋮) → **Repositories** and add your repository URL.
3. Find **Shopping List** in the store, click **Install**.
4. Start the add-on. It appears in the sidebar as **Shopping List** (🛒).

## Usage

### Lists

Click the **🛒 list name** in the header to open the list drawer.  
From there you can create new lists or delete existing ones (the last list cannot be deleted).

### Categories

Click **🏷️ Kategorien** in the header to open the category manager.  
Categories are global (shared across all lists). Create or delete them here.

### Items

- **Add:** Use the form at the top of the page (name, optional quantity, optional category).
- **Quick-add per category:** Click the **+** button next to any category heading.
- **Edit:** Hover over an item and click **✏️** to change its name, quantity, or category.
- **Check off:** Tap the checkbox to mark an item as done (strikethrough).
- **Delete:** Hover over an item and click **✕**, or use "Erledigte löschen" to remove all checked items at once.

## Configuration

| Option | Default | Description |
|---|---|---|
| `log_level` | `info` | Verbosity: `trace`, `debug`, `info`, `warning`, `error`, `fatal` |

## Backup & data

The SQLite database is stored at `/data/shoppinglist.db`. Home Assistant backs this up automatically together with all other add-on data.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3.13 · FastAPI · SQLModel |
| Frontend | React 19 · Vite · Tailwind CSS · TanStack Query |
| Packaging | `uv` · `hatchling` · multi-stage Docker build |
| Runtime | HA Ingress (no external port exposed) |

## License

MIT – see [LICENSE](LICENSE).
