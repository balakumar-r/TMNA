const BLOCK = 'hero-banner-v2';

/**
 * Picks the largest-width candidate URL from a <picture> (source/img srcset).
 * @param {Element} picture
 * @returns {string|undefined}
 */
function largestImageUrl(picture) {
  const candidates = [];
  picture.querySelectorAll('source, img').forEach((el) => {
    const srcset = el.getAttribute('srcset') || el.getAttribute('src');
    if (!srcset) return;
    srcset.split(',').forEach((item) => {
      const [url] = item.trim().split(/\s+/);
      if (!url) return;
      const widthMatch = url.match(/[?&]width=(\d+)/i);
      candidates.push({ url, width: widthMatch ? Number(widthMatch[1]) : 0 });
    });
  });
  return candidates.sort((a, b) => b.width - a.width)[0]?.url;
}

/**
 * loads and decorates the hero banner
 *
 * Authoring contract: a single block cell that contains a heading and a
 * paragraph. The heading holds two authored images:
 *   1st image → desktop (landscape) — painted as a CSS background on >= tablet
 *   2nd image → mobile (portrait)   — rendered inline for small screens
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const pictures = [...block.querySelectorAll('picture')];
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6');
  const description = block.querySelector('p');

  const [desktopPic, mobilePic] = pictures;

  // 1. Media — mobile image stays inline; desktop image becomes a background.
  const media = document.createElement('div');
  media.className = `${BLOCK}__media`;

  // Desktop image → CSS var, consumed as a background only inside the desktop
  // media query. The <picture> itself is dropped so it never loads on mobile.
  if (desktopPic) {
    const url = largestImageUrl(desktopPic);
    if (url) block.style.setProperty(`--${BLOCK}-desktop-image`, `url("${url}")`);
    desktopPic.remove();
  }

  // Mobile image → keep inline exactly as authored.
  const inlinePic = mobilePic || desktopPic;
  if (inlinePic) {
    inlinePic.classList.add(`${BLOCK}__picture`, `${BLOCK}__picture--mobile`);
    media.append(inlinePic);
  }

  // 2. Content — heading + description overlaid on the media.
  const content = document.createElement('div');
  content.className = `${BLOCK}__content`;

  if (heading) {
    heading.classList.add(`${BLOCK}__title`);
    content.append(heading);
  }
  if (description) {
    description.classList.add(`${BLOCK}__description`);
    content.append(description);
  }

  // 3. Rebuild the block with the BEM structure.
  block.textContent = '';
  if (media.children.length) block.append(media);
  block.append(content);
}
