# Shopping List – Documentation

A fast, mobile-friendly shopping list add-on for Home Assistant.

## Features

- Multiple named lists (e.g. one per store)
- Items organised by category within each list
- Quick-add row directly below each category
- Bulk-delete checked (done) items per list
- All data stored locally in `/data/shoppinglist.db` – survives restarts and backups

## Configuration

| Option | Default | Description |
|---|---|---|
| `log_level` | `info` | Logging verbosity: `trace`, `debug`, `info`, `warning`, `error`, `fatal` |

## Usage

The add-on appears in the Home Assistant sidebar as **Shopping List** after installation and start.
All household members (not just admins) can access it.

### Lists

Click the list name in the header to open the list drawer where you can create or delete lists.
The default list is created automatically on first start.

### Categories

Click ☰ in the header to manage categories. Categories are shared across all lists.

### Adding items

- Use the form at the top to add an item to any category.
- Click **+** next to a category heading to add directly into that category without touching the top form.

## Backup

The SQLite database at `/data/shoppinglist.db` is included in Home Assistant backups automatically.
