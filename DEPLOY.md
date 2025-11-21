# Deployment to GitHub Pages

## Setup Instructions

### 1. Create a GitHub Repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/shortlist.git
git push -u origin main
```

### 2. Enable GitHub Pages

1. Go to your GitHub repository
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**

### 3. Deploy

The app will automatically deploy when you push to the `main` branch.

After the first deployment, your app will be available at:
```
https://YOUR_USERNAME.github.io/shortlist/
```

## Manual Build

To build locally:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Build

To preview the production build locally:

```bash
npm run preview
```

## Update Base URL

If you use a custom domain or different repository name, update the `base` in `vite.config.ts`:

```typescript
base: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '/',
```

Or for a custom domain:

```typescript
base: '/',
```
