# Deployment Guide

Because SwasthyaVani has **no backend server and no server-side database**, it deploys as static HTML, CSS, JavaScript, and JSON assets to any modern static hosting service or content delivery network.

---

## 1. Deploying to Vercel (Recommended)

SwasthyaVani includes a pre-configured `frontend/vercel.json` file with security headers, MIME types, and cache-control rules.

### Steps:
1. Connect your GitHub repository to your [Vercel](https://vercel.com) account.
2. In the Vercel project configuration settings:
   - **Root Directory**: Set to `frontend`
   - **Framework Preset**: Select `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Click **Deploy**.
4. Your PWA will be live with automatic SSL and edge caching.

---

## 2. Deploying to GitHub Pages

1. In `frontend/vite.config.js`, configure the `base` path if deploying under a repository sub-path (e.g. `base: '/swasthyavani/'`).
2. Build the production bundle:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. Deploy the contents of `frontend/dist/` to your `gh-pages` branch using GitHub Actions or a tool like `gh-pages`:
   ```bash
   npx gh-pages -d dist
   ```

---

## 3. Local Offline Demonstration (Without Internet)

To serve the application on an offline field laptop or Android test bench:

1. Install web dependencies and build:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
2. Run the preview server:
   ```bash
   npm run preview
   ```
   Open `http://localhost:4173` in any modern web browser.
3. Open Developer Tools (`F12`) -> **Application** -> **Service Workers** to confirm that `swasthyavani-v5` is registered.
4. Toggle **Offline** mode in Developer Tools and refresh. The application will continue to load and function 100% offline.
