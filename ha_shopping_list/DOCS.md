# Shopping List – Documentation

A fast, mobile-friendly shopping list add-on for Home Assistant.

## Features

- Multiple named lists (e.g. one per store)
- Items organised by category within each list
- Inline item editing (name, quantity, category)
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

Click the **🛒 list name** in the top-left of the header to open the list drawer where you can create or delete lists.
The default list is created automatically on first start.

### Categories

Click **🏷️ Kategorien** in the header (top right) to open the category manager.
Categories are shared across all lists. Create or delete them here.

### Adding items

- Use the form at the top to add an item to any category.
- Click **+** next to a category heading to add directly into that category without touching the top form.

### Editing items

Hover over any item and click the **✏️** button that appears.
An inline form opens where you can change the item's name, quantity, and category.
Press **Speichern** to save or **Abbrechen** (or Escape) to cancel.

### Checking off and clearing items

Tap the checkbox on an item to mark it as done (it will be shown with a strikethrough).
Once one or more items are checked, a **"Erledigte löschen (n)"** button appears in the header.
Clicking it removes all checked items from the active list.

## Backup

The SQLite database at `/data/shoppinglist.db` is included in Home Assistant backups automatically.
