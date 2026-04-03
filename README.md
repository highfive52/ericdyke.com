# Blog Website Portfolio

A personal portfolio and blog website built with React, TypeScript, and Vite.

## Project Goal

This project was created to evaluate the results of building a complete website from scratch using agentic AI.

The intent was to test how well an AI-assisted workflow could:

- design and scaffold a production-ready site structure
- implement reusable frontend components
- integrate Markdown-driven content
- support responsive behavior across devices
- and deliver a portfolio-ready public site

## What This Site Includes

- A portfolio-style homepage with core sections.
- A blog experience powered by Markdown content in `public/content/blog/`.
- Resume and education content rendered from Markdown files in `public/content/resume/`.
- A contact form workflow configured for public-facing use.
- Responsive layout behavior for desktop and mobile.

## Main Frontend Components

Components are organized in `src/components/`.

- `Header.tsx`: top navigation and site-level menu behavior.
- `Hero.tsx`: landing/intro section content.
- `App.tsx`: application composition, content loading, pagination, and contact form handling.

## Project Structure

- `src/`: React and TypeScript application code.
- `src/components/`: reusable UI components.
- `public/content/blog/`: blog articles in Markdown.
- `public/content/resume/`: resume and education content in Markdown.
- `docs/`: project documentation.
- `.htaccess` and `public/.htaccess`: SPA routing support for Apache hosting.

## Tech Stack

- React
- TypeScript
- Vite
- CSS
- Markdown content files

## Local Development

Install dependencies:

```bash
npm install
```

Start dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build locally:

```bash
npm run preview
```

## Deployment Notes

This repository is structured for static hosting. The included `.htaccess` files support client-side routing for Apache-based environments.

## Public Repository Context

This public repository is intended as a portfolio artifact showing both:

- the final website implementation, and
- the outcome of an agentic AI-assisted, from-scratch build workflow.
