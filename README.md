# @lifetechocms/react

**React and Vite integration for building and exporting [LifeTechOCMS](https://github.com/lifetechOCMS/lifetechocms) themes.**

LifeTechOCMS is a PHP-based modular framework with Role-Based Access Control (RBAC). Its backend dynamically manages menus, pages, and content based on user roles and permissions. Unauthenticated visitors are assigned the **anonymous** role.

`@lifetechocms/react` enables developers to build React applications using JSX, TSX, and Vite, then compile and export them as LifeTechOCMS-compatible themes.

LifeTechOCMS uses a Layout and Page architecture, allowing React-based layouts to work with dynamic content from different modules, independently of the frontend technology used.

### Practical Development

The [ThemeLtReactKit](https://github.com/ajayi-abolore/ThemeLtReactKit) project is being developed to test React integration and establish conventions for future theme developers.

We also plan to publish more themes in the [LifeTechOCMS Theme Marketplace](https://www.lifetech.host/hubs/community/products?product=theme).
 
## Requirements

- Node.js version compatible with your installed Vite 8 release
- React 19 and React DOM 19
- Vite 8 and `@vitejs/plugin-react`
- A LifeTechOCMS installation for importing and testing exported themes
- TypeScript and React type definitions if you use `.tsx` files

## Install

From the root of an existing React/Vite application:

```bash
npm install -D @lifetechocms/react
```

If starting a new application:

```bash
npm create vite@latest ThemeLtReactDemo -- --template react
cd ThemeLtReactDemo
npm install
npm install -D @lifetechocms/react
```

To use TypeScript in a JavaScript-based Vite project, install the TypeScript tooling:

```bash
npm install -D typescript @types/react @types/react-dom
```

> On Windows PowerShell, use `npm.cmd` instead of `npm` if the PowerShell execution policy blocks the npm script.

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

### Configuration Options

- **`themeName`** (required): The name of the theme to be exported and installed in LifeTechOCMS.
- **`layoutsDirectory`**: The directory path containing your React Layout components. Set this to the location of your layouts in your project.
- **`viewsDirectory`**: The directory path containing your React page components (Views). Set this to the location of your pages in your project.

The directory paths are relative to your project's root folder and can be customized to match your existing React application structure.

The plugin generates LifeTechOCMS build entries only when invoked using `lt-export`. Normal Vite development and build commands remain separate.


## Create Layouts and Views

Example project structure:

```text
src/
├── Layouts/
│   └── Default.jsx
└── Views/
    ├── Home.jsx
    ├── About.jsx
    ├── Contact.tsx
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

Each View must also **default-export** a React component. JavaScript/JSX example:

```jsx
// src/Views/Home.jsx
export default function Home() {
  return <section><h2>Welcome</h2><p>My first React View.</p></section>;
}
```

TypeScript/TSX example:

```tsx
// src/Views/Contact.tsx
type ContactDetails = {
  title: string;
  description: string;
};

export default function Contact() {
  const contact: ContactDetails = {
    title: 'Contact Us',
    description: 'This View uses React and TypeScript.'
  };

  return (
    <section>
      <h2>{contact.title}</h2>
      <p>{contact.description}</p>
    </section>
  );
}
```

JSX and TSX Views have been tested successfully in the export workflow. Nested Views such as `src/Views/auth/Login.jsx` are discovered recursively. If no Layout is found, the exporter generates a minimal Default Layout automatically.

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

The CLI builds React entries into `dist-lifetech/`, then creates an export at:

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
    │   ├── Contact.html
    │   └── auth/
    │       └── Login.html
    └── Storage/          (when layout mappings are generated)
```

The exact files depend on the application and generated assets. For example, `Contact.tsx` is compiled into browser-compatible JavaScript and exported as `Contact.html` with its associated JavaScript assets. The exporter can also generate layout mapping files when applicable.

### Standard Vite build versus LifeTechOCMS export

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the normal Vite development server |
| `npm run build` | Build the standard React application into `dist/` |
| `npm run lt-export` | Build and export a LifeTechOCMS theme |

## Install and test in LifeTechOCMS

Import the exported `ThemeLtReactDemo` theme using the LifeTechOCMS theme-management workflow. Activate or preview it, then verify that the Layout, Views, nested routes, and compiled assets load as expected.

LifeTechOCMS remains responsible for its own routing, pages, content management, and server-side processing. This package generates React-based theme resources; it does not replace the LifeTechOCMS backend.

## Public package entry points

| Import or command | Purpose |
| --- | --- |
| `@lifetechocms/react` | React runtime exports (`LifeTechEntry`, `LifeTechDynamicContent`) |
| `@lifetechocms/react/vite` | Default-exported Vite plugin |
| `@lifetechocms/react/exporter` | Theme exporter utilities |
| `lt-export` | Build and export a LifeTechOCMS theme |

## Local plugin development

Contributors can test plugin changes against a separate React application without publishing each change to npm.

```text
frontendApp/
├── lifetechocms-react/   # Plugin source
└── plugin-dev/           # Independent Vite/React test application
```

From the plugin directory:

```bash
npm install
npm link
```

From the test application's directory:

```bash
npm link @lifetechocms/react
npm ls @lifetechocms/react
npm run lt-export
```

`npm link` connects the test application to the local plugin source. An `extraneous` label in `npm ls` can appear when a locally linked package is not listed in the test application's `package.json`; the link itself can still work.

The CLI and plugin support using dependencies from the consuming application when working with a separately linked plugin. This workflow has been tested with Vite 8 and React 19.

For full setup, testing, Git workflow, and pull-request instructions, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Development notes

- Keep the Vite plugin registered in `vite.config.js` for both ordinary builds and LifeTechOCMS exports.
- The exporter requires the configured Views directory to exist.
- Layouts and Views must default-export React components.
- Avoid View names that generate identical flattened asset names (for example, `Admin/Dashboard.jsx` and `Admin_Dashboard.jsx`).
- A generated Default Layout is a fallback; add `src/Layouts/Default.jsx` or `.tsx` to test a custom Layout.
- Validate exported themes in LifeTechOCMS, not only in the Vite development server.
- React 19, Vite 8, JSX/TSX Views, and theme import have been tested; broader compatibility testing is ongoing.

## Issues and contributions

Report bugs, compatibility issues, and feature requests at the [LifeTechOCMS-React issue tracker](https://github.com/ajayi-abolore/lifetechocms-react/issues). When reporting an issue, identify `@lifetechocms/react` and include your package version, Vite/React versions, relevant commands, and error output.

Developers wishing to improve the plugin should read the [Contribution Guide](./CONTRIBUTING.md) before opening a pull request.

## License

MIT — see [LICENSE](./LICENSE).
