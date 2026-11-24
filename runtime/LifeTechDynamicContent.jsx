import { useLayoutEffect, useRef } from 'react';

export default function LifeTechDynamicContent() {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const source = document.getElementById('lt-dynamic-content');
    const target = containerRef.current;

    if (!source || !target) {
      console.warn(
        'LifeTechOCMS dynamic content container not found.'
      );
      return;
    }

    // Move framework-generated content into the Layout.
    while (source.firstChild) {
      target.appendChild(source.firstChild);
    }
  }, []);

  return <div ref={containerRef} />;
}