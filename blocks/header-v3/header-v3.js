const DEFAULT_HREFS = {
    'toyota-logo': 'https://www.toyota.com',
    'lexus-logo': 'https://www.lexus.com',
  };
  
  function detectBrandClass(src = '', alt = '', fallbackIndex = 0) {
    const haystack = `${src} ${alt}`.toLowerCase();
    if (haystack.includes('lexus')) return 'lexus-logo';
    if (haystack.includes('toyota')) return 'toyota-logo';
    return fallbackIndex === 0 ? 'toyota-logo' : 'lexus-logo';
  }
  
  export default function decorate(block) {
    const rows = [...block.children];
    let titleText = 'My Toyota & Lexus Communications Profile';
    const imageEls = [];
    rows.forEach((row) => {
      const cells = [...row.children];
      const rowImages = [...row.querySelectorAll('picture, img')].filter((el) => {
        if (el.tagName === 'IMG') return !el.closest('picture');
        return true;
      });
  
      if (rowImages.length === 0) {
        const text = cells.map((c) => c.textContent.trim()).join(' ').trim();
        if (text) titleText = text;
        return;
      }
  
      rowImages.forEach((el) => imageEls.push(el));
    });
  
    block.textContent = '';
    const headerWrap = document.createElement('div');
    headerWrap.className = 'header-wrap row';
    const col = document.createElement('div');
    col.className = 'col';
  
    const logoWrap = document.createElement('div');
    logoWrap.className = 'logo-wrap';
    logoWrap.setAttribute('role', 'img');
    logoWrap.setAttribute('aria-label', 'Brand Logo');
  
    imageEls.forEach((el, index) => {
      const picture = el.tagName === 'PICTURE' ? el : null;
      const img = picture ? picture.querySelector('img') : el;
      if (!img) return;
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const brandClass = detectBrandClass(src, alt, index);
      const existingLink = el.closest('a');
      const href = existingLink?.getAttribute('href') || DEFAULT_HREFS[brandClass];
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = brandClass;
      a.append(picture || img);
      logoWrap.append(a);
    });
  
    col.append(logoWrap);
    headerWrap.append(col);
    const headerCnt = document.createElement('div');
    headerCnt.className = 'header-cnt col';
    const title = document.createElement('p');
    title.className = 'header-title';
    title.textContent = titleText;
    headerCnt.append(title);
    headerWrap.append(headerCnt);
    block.append(headerWrap);
  }