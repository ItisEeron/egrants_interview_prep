import fs from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves a project site from /<repo>/, so the build needs that
// prefix on every asset URL. Override with VITE_BASE if the repo is renamed or
// the site moves to a custom domain (where it would be "/").
const BUILD_BASE = process.env.VITE_BASE ?? '/egrants_interview_prep/';

/**
 * GitHub Pages has no rewrite rules, so a deep link like /weeks/w-1 is a request
 * for a file that does not exist and returns 404. Pages serves 404.html for
 * those, so shipping a copy of the app shell under that name hands the URL to
 * the router instead of showing an error page.
 */
function githubPagesSpaFallback() {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    async closeBundle() {
      const dist = path.resolve(import.meta.dirname, 'dist');
      await fs.copyFile(path.join(dist, 'index.html'), path.join(dist, '404.html'));
    },
  };
}

export default defineConfig(({ command }) => ({
  // The dev server is always at the root; only the deployed build is nested.
  base: command === 'build' ? BUILD_BASE : '/',
  plugins: [react(), githubPagesSpaFallback()],
  server: {
    port: 5173,
  },
}));
