# ShoppingList – HA Add-on

## Idee

Einfacher Einkaufsmanager als Home Assistant Add-on mit Ingress-Integration.
Kein Grocy-Klon – Fokus auf schnelle Bedienbarkeit, mobil-optimiert, erweiterbar.

## Architektur

- **Backend**: FastAPI + SQLModel + SQLite unter `/data/shoppinglist.db`
- **Frontend**: React (Vite), wird als statische Dateien vom Backend ausgeliefert
- **Deployment**: HA Add-on mit Ingress; der Ingress-Pfad wird vom Backend in die `index.html` injiziert (`X-Ingress-Path` Header → `<meta>`-Tag → API-Client liest diesen zur Laufzeit)
- **Persistenz**: SQLite liegt im `/data`-Verzeichnis (von HA gemountet)
- **Build**: Multi-Stage Dockerfile (Node für Frontend-Build, HA-Python-Base-Image für Runtime)

## Datenmodell

Zwei Entitäten: **Category** (name, sort_order) und **Item** (name, quantity, checked, category_id).
Beim ersten Start werden Standard-Kategorien angelegt.

## Features (MVP)

- Artikel hinzufügen mit optionaler Menge und Kategorie
- Artikel abhaken und löschen
- Liste nach Kategorien gruppiert und nach `sort_order` sortiert
- Erledigte Artikel gesammelt entfernen
- Kategorien anlegen und löschen

## Erweiterbarkeit

Das REST-API soll von Anfang an so gestaltet sein, dass externe Dienste (z.B. ein späteres Rezept-Modul oder ein Vorrats-Service) Items per POST hinzufügen können, ohne die App selbst zu ändern.

## HA-Integration

- `config.yaml` mit `ingress: true`, `panel_icon`, `panel_title`
- `build.yaml` mit Arch-spezifischen HA-Base-Images
- `run.sh` mit `bashio`-Logging
- Kein separater Port nach außen nötig – alles läuft über Ingress