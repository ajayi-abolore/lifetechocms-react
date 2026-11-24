
import React from 'react';
import { createRoot } from 'react-dom/client';

import LifeTechDynamicContent from './LifeTechDynamicContent.jsx';

export function mountLifeTechLayout(Layout) {
  const root = document.getElementById('lt-react-layout');

  if (!root) {
    console.error(
      'LifeTechOCMS React mount element not found: lt-react-layout'
    );
    return;
  }

  createRoot(root).render(
    <Layout>
      <LifeTechDynamicContent />
    </Layout>
  );
}

export default mountLifeTechLayout;
