# Job Search Aggregator

A Vite + React application that aggregates job-board searches so you can quickly jump to tailored listings across multiple platforms.

## Prerequisites

- Node.js 18 or newer (includes npm). You can install the latest LTS from [nodejs.org](https://nodejs.org/).

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview
```

## Deploying

The build is entirely static. After running `npm run build`, deploy the contents of the `dist/` folder to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.).

## Analytics (Optional)

If you plan to add privacy-friendly analytics (e.g., Plausible), include their script in `index.html` and fire custom events from `src/JobSearchApp.tsx` as needed.
