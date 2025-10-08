# To-Do List (localStorage-only)

This repository has been converted to a frontend-only app that stores tasks and
settings in browser localStorage. It no longer uses a server or SQLite database.

Quick start
1. Open `index.html` in your browser (or serve the folder with any static server).
2. Use the UI to add/edit/delete tasks. Data is saved to the following localStorage keys:
	- `todo_tasks_v1` (array of tasks)
	- `todo_settings_v1` (object of settings)

Notes
- The app intentionally runs in localStorage mode for simple testing and offline use.
- If you want to restore server/db mode later, edit `script.js` and set `USE_LOCAL_STORAGE = false` and re-add server files.

Files of interest
- `index.html`, `style.css`, `script.js` — main frontend
- `package.json` — trimmed to reflect frontend-only usage

Cleanup performed (2025-10-08): debug/test files and the SQLite DB were removed from the project directory. See `archive_unused.txt` for details.

If you want these files preserved instead of deleted, I can restore them from a provided backup or move related files into an `archive/` folder.
