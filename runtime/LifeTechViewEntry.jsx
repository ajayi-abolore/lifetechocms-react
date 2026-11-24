import { createRoot } from 'react-dom/client';

const mountedRoots = new WeakMap();

export function mountLifeTechView(element, Component) {
  if (!element || !Component) {
    return null;
  }

  if (mountedRoots.has(element)) {
    return mountedRoots.get(element);
  }

  const root = createRoot(element);

  root.render(<Component />);

  mountedRoots.set(element, root);

  return root;
}