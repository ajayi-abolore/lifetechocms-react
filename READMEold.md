# @lifetechocms/react

React and Vite integration for building and exporting [LifeTechOCMS](https://github.com/lifetechOCMS/lifetechocms) themes.

The package turns React Layouts and Views into a LifeTechOCMS theme containing HTML entry files and compiled JavaScript/CSS assets. It provides a Vite plugin and the `lt-export` command.

> **Version:** 0.1.4 — initial public-release candidate. Tested with React 19 and Vite 8. Additional environments are not yet verified.

## Requirements

- Node.js compatible with your installed Vite 8 version
- React 19 and React DOM 19
- Vite 8 and `@vitejs/plugin-react`
- A LifeTechOCMS installation for importing and testing the exported theme

## Install

From the root of an existing React/Vite application:

```bash
npm install -D @lifetechocms/react@0.1.4
```

If starting a new application:

```bash
npm create vite@latest ThemeLtReactDemo -- --template react
cd ThemeLtReactDemo
npm install
npm install -D @lifetechocms/react@0.1.4
```

## Configure Vite

In `vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import lifetechReact from '@lifetechocms/react/vite';

export default defineConfig({
  plugins: [
    react(),
    lifetechReact({
      themeName: 'ThemeLtReactDemo',
      layoutsDirectory: 'src/Layouts',
      viewsDirectory: 'src/Views'
    })
  ],
  base: './'
});
```

The `themeName` option is required. Layouts and Views directories can be customized. The plugin generates LifeTechOCMS build entries only when invoked by `lt-export`; ordinary Vite development/build commands remain separate.

## Create Layouts and Views

Example project structure:

```text
src/
├── Layouts/
│   └── Default.jsx
└── Views/
    ├── Home.jsx
    ├── About.jsx
    └── auth/
        └── Login.jsx
```

A Layout must **default-export** a React component that renders `children`:

```jsx
// src/Layouts/Default.jsx
export default function Default({ children }) {
  return (
    <>
      <header><h1>My LifeTechOCMS Site</h1></header>
      <main>{children}</main>
      <footer>Powered by LifeTechOCMS</footer>
    </>
  );
}
```

Each View must also **default-export** a React component:

```jsx
// src/Views/Home.jsx
export default function Home() {
  return <section><h2>Welcome</h2><p>My first React View.</p></section>;
}
```

Nested Views such as `src/Views/auth/Login.jsx` are discovered recursively. If no Layout is found, the exporter generates a minimal Default Layout automatically.

## Export a LifeTechOCMS theme

Add an export script to your application's existing `package.json` scripts:

```json
{
  "scripts": {
    "lt-export": "lt-export"
  }
}
```

Then run:

```bash
npm run lt-export
```

The CLI builds the React entries into `dist-lifetech/`, then creates an export at:

```text
lt-exports/
└── ThemeLtReactDemo/
    ├── Assets/
    │   ├── js/
    │   └── css/          (when CSS is emitted)
    ├── Layouts/
    │   └── Default.html
    ├── Views/
    │   ├── Home.html
    │   ├── About.html
    │   └── auth/
    │       └── Login.html
    └── Storage/          (when layout mappings are generated)
```

The exact files depend on your application and generated assets. The exporter can also generate layout mapping files when applicable.

## Install and test in LifeTechOCMS

Import the exported `ThemeLtReactDemo` theme using your LifeTechOCMS theme-management workflow. Activate or preview it, then verify that the Layout, Views, nested routes, and compiled assets load as expected.

LifeTechOCMS remains responsible for its own routing, pages, content management, and server-side processing. This package generates React-based theme resources; it does not replace the LifeTechOCMS backend.

## Public package entry points

| Import or command | Purpose |
| --- | --- |
| `@lifetechocms/react` | React runtime exports (`LifeTechEntry`, `LifeTechDynamicContent`) |
| `@lifetechocms/react/vite` | Default-exported Vite plugin |
| `@lifetechocms/react/exporter` | Theme exporter utilities |
| `lt-export` | Build and export a LifeTechOCMS theme |

## Development notes

- Keep the Vite plugin registered in `vite.config.js` for both ordinary builds and LifeTech exports.
- `npm run build` performs the application's standard Vite build; `npm run lt-export` creates a LifeTechOCMS theme export.
- The exporter requires the configured Views directory to exist.
- Layouts and Views must have default component exports.
- Avoid View names that generate identical flattened asset names (for example, `Admin/Dashboard.jsx` and `Admin_Dashboard.jsx`).
- This release has been tested with a separately installed npm tarball and a working LifeTechOCMS theme import; broader compatibility testing is ongoing.

## Issues and contributions

Report bugs, compatibility issues, and feature requests at the [LifeTechOCMS issue tracker](https://github.com/lifetechOCMS/lifetechocms/issues).

## License

MIT — see [LICENSE](./LICENSE).
