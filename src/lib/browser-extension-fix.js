// This small script helps prevent hydration errors caused by browser extensions
// that modify the DOM before React hydration

if (typeof window !== 'undefined') {
  // Remove any browser extension attributes from html element
  const htmlEl = document.documentElement;
  if (htmlEl) {
    const htmlStyle = htmlEl.getAttribute('style');
    if (htmlStyle && htmlStyle.includes('--neonlingo-mark')) {
      // Remove only extension-specific styles, keep others
      htmlEl.removeAttribute('style');
    }
  }

  // Remove any browser extension attributes from body element
  const bodyEl = document.body;
  if (bodyEl) {
    // Remove any attributes that start with __processed_
    Array.from(bodyEl.attributes).forEach(attr => {
      if (attr.name.startsWith('__processed_')) {
        bodyEl.removeAttribute(attr.name);
      }
    });
  }
}

export default {};
