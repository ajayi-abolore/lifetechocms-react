# Contributing to @lifetechocms/react

Thank you for helping improve the LifeTechOCMS React integration. This guide explains how to develop, test, and propose changes to the **npm plugin itself**. If you only want to build a LifeTechOCMS theme using React, start with the [README](./README.md).

## What you can contribute

Contributions may include bug fixes, JSX/TSX compatibility improvements, Vite integration, Layout/View discovery, theme export reliability, documentation, and tests. Please keep changes focused and explain the problem they solve.

## Before you begin

You will need Git, Node.js compatible with Vite 8, npm, and a React/Vite test application. A LifeTechOCMS installation is recommended for end-to-end testing of exported themes.

Read the [README](./README.md) for supported versions, Vite configuration, and theme structure.

## Fork and clone the plugin repository

1. Open the public `lifetechocms-react` repository on GitHub and select **Fork**.
2. Clone **your fork** (replace placeholders with your actual GitHub username and repository URL):

```bash
git clone https://github.com/YOUR_USERNAME/lifetechocms-react.git
cd lifetechocms-react
```

3. Confirm the remote:

```bash
git remote -v
```

4. Add the original repository as `upstream` (copy its exact URL from the GitHub repository page):

```bash
git remote add upstream ORIGINAL_REPOSITORY_URL
```

`origin` points to your fork, where you push your changes. `upstream` points to the original repository, where you fetch changes made by maintainers.

## Install dependencies

From the plugin directory:

```bash
npm install
```

Do not commit `node_modules/` or local build/export output. Follow the repository's `.gitignore`.

## Create a branch

Before editing, update your local default branch. The examples below assume the repository's default branch is `main`:

```bash
git switch main
git fetch upstream
git merge --ff-only upstream/main
git switch -c fix/describe-your-change
```

If your fork's `main` is behind, you can optionally synchronize it:

```bash
git push origin main
```

Use a descriptive branch name such as `fix/react-resolution`, `feature/tsx-support`, or `docs/contributing-guide`. Avoid committing a contribution directly to `main`; a feature branch makes the pull request easier to review and update.

## Set up a separate test application

A plugin contributor should test changes in an independent React application, rather than relying only on files inside the plugin repository.

Example layout:

```text
frontendApp/
├── lifetechocms-react/   # Your cloned plugin repository
└── plugin-dev/           # Separate Vite/React test application
```

From the parent directory, create a test application if you do not already have one:

```bash
npm create vite@latest plugin-dev -- --template react
cd plugin-dev
npm install
```

In the plugin repository, run:

```bash
npm link
```

Then, in `plugin-dev`, run:

```bash
npm link @lifetechocms/react
npm ls @lifetechocms/react
```

The link points to your local plugin checkout. You do **not** need to publish a new npm version for each code change.

> On Windows PowerShell, use `npm.cmd` instead of `npm` if the execution policy blocks npm scripts.

## Configure the test application

In `plugin-dev/vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import lifetechReact from '@lifetechocms/react/vite';

export default defineConfig({
  plugins: [
    react(),
    lifetechReact({
      themeName: 'ThemePluginDev',
      layoutsDirectory: 'src/Layouts',
      viewsDirectory: 'src/Views'
    })
  ],
  base: './'
});
```

Create at least one default-exported React View under `src/Views/`, such as `Home.jsx`. For TSX tests, add `Contact.tsx` and install `typescript`, `@types/react`, and `@types/react-dom` in the test application. You can also add `src/Layouts/Default.jsx` to verify a physical Layout; otherwise the exporter can generate a fallback Default Layout.

Add the following script to the **existing** `plugin-dev/package.json` scripts:

```json
"lt-export": "lt-export"
```

Do not replace the entire `package.json` with this snippet.

## Test your changes

From `plugin-dev`, run:

```bash
npm run build
npm run lt-export
```

Verify that:

- The standard Vite build completes.
- The LifeTechOCMS export completes without unresolved module imports.
- Expected HTML Views appear in `lt-exports/ThemePluginDev/Views/`.
- The expected Layout appears in `lt-exports/ThemePluginDev/Layouts/`.
- Compiled assets appear in `lt-exports/ThemePluginDev/Assets/`.
- Both `.jsx` and `.tsx` Views are exported if your change affects component handling.

For export or Windows filesystem changes, also run the export twice. If applicable, keep the Vite development server running in a separate terminal while testing repeated exports.

Finally, import the exported theme into LifeTechOCMS and verify the affected Views and assets render correctly. A successful Vite build alone does not establish that a LifeTechOCMS export works.

For CLI or plugin source changes, you can also run syntax checks from the plugin repository:

```bash
node --check bin/lt-export.js
node --check vite/index.js
npm pack --dry-run
```

If the repository adds automated tests or lint scripts, run those documented checks as well.

## Commit your changes

Review the changes first:

```bash
git status
git diff
```

Stage only the intended files:

```bash
git add README.md CONTRIBUTING.md
```

Replace those paths with your actual changed files when contributing code.

Commit with a clear message:

```bash
git commit -m "docs: improve contributor setup and testing"
```

Other examples include `fix: resolve React dependencies in linked projects` and `feat: improve TSX View discovery`.

## Push and open a pull request

Push your branch to your fork:

```bash
git push -u origin fix/describe-your-change
```

On GitHub, open a pull request **from your fork's feature branch to the original repository's default branch**. Include:

- The issue or problem being addressed.
- A short summary of the changes.
- How you tested them, including the exact commands.
- Whether you imported and verified the exported theme in LifeTechOCMS.
- Screenshots or error logs when they help reviewers.

Maintainers may request changes. Commit those changes to the same branch and push again; the existing pull request will update automatically.

## Issues and support

Use the [central LifeTechOCMS issue tracker](https://github.com/lifetechOCMS/lifetechocms/issues) for bugs, suggestions, and compatibility reports. State clearly that the issue concerns `@lifetechocms/react` and include the package, Node.js, React, and Vite versions where relevant.

Do not post credentials, access tokens, or other secrets in issues, logs, or pull requests.

## Versioning and publishing

Contributors should **not** change the package version, create release tags, or publish to npm unless a maintainer explicitly requests it. Maintainers coordinate version updates and publication after reviewing and testing changes.

## Related documentation

- [README — Installation, configuration, and theme export](./README.md)
- [LifeTechOCMS framework repository](https://github.com/lifetechOCMS/lifetechocms)
- [LifeTechOCMS issue tracker](https://github.com/lifetechOCMS/lifetechocms/issues)
