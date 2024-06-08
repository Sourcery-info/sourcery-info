# Sourcery.info Frontend

Your private, secure investigative AI

## About

This is the frontend for the Sourcery.info project.

## Environment Variables

PROJECT_DIR: Where to install project files. Eg. /home/user/sourcery/project-files

You can set these environment variables in a `.env` file in the root of the project, or set them at runtime.

```bash
PROJECT_DIR=/home/user/sourcery/project-files
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
