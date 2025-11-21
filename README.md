# Shortlist

A simple, clean daily todo list manager built as a Progressive Web App (PWA).

## Features

✅ **Daily Organization** - Create todo lists for each day
✅ **Quick Entry** - Type and press Enter to add todos
✅ **Inline Editing** - Click any todo to edit with auto-save
✅ **URL Support** - Add links to todos (optional)
✅ **Keyboard Navigation** - Fully accessible with Tab and keyboard shortcuts
✅ **Move Todos** - Drag & drop or use Option+Up/Down to move todos
✅ **Cross-Day Movement** - Move todos between different days
✅ **Copy Open Todos** - Copy unfinished tasks from previous day
✅ **Offline Support** - Works without internet (PWA)
✅ **Local Storage** - All data saved in your browser

## Keyboard Shortcuts

- **Enter** - Save new todo / Finish editing
- **Escape** - Cancel editing
- **Tab** - Navigate between elements
- **Option + ↑/↓** - Move todo up/down (within or across days)

## Project Setup

```sh
npm install
```

### Development

```sh
npm run dev
```

### Build for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Deployment

See [DEPLOY.md](./DEPLOY.md) for GitHub Pages deployment instructions.

## Tech Stack

- Vue 3 + TypeScript
- Pinia (state management)
- Vite
- PWA (Service Worker + Web Manifest)
- LocalStorage for persistence
