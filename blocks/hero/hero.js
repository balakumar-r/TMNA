/*
 * Hero Block
 */
import { getBlockConfig } from '../../scripts/utils/block-config.js';

// CSS class prefix for the signin variation markup.
const SIGNIN_BLOCK = 'hero-banner-signin';

// Labels used for authoring config rows (Brand / Class Name). Read by
// getBlockConfig() and must NOT be rendered into the page.
const CONFIG_LABELS = ['brand', 'class name', 'classname', 'class'];

/**
 * A config row is a two-cell row whose first cell is a known config label
 * (e.g. "Brand" | "lexus", "Class Name" | "hero-banner-signin").
 * @param {Element} row
 * @returns {boolean}
 */
function isConfigRow(row) {
  const cells = [...row.children];
  if (cells.length < 2) return false;
  const label = cells[0]?.textContent?.trim().toLowerCase();
  return CONFIG_LABELS.includes(label);
}

/** Removes authoring config rows so their values never appear in the page. */
function removeConfigRows(block) {
  [...block.children].forEach((row) => {
    if (isConfigRow(row)) row.remove();
  });
}

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
 * Variation "hero-banner-image-only": paints the authored image as a full-bleed
 * background on the surrounding section and removes the inline <picture>.
 * @param {Element} block
 */
function renderImageOnly(block) {
  const section = block.closest('.section');
  const picture = block.querySelector('picture');
  if (!section || !picture) return;

  const image = picture.querySelector('img');
  const imageUrl = largestImageUrl(picture)
    || image?.currentSrc
    || image?.getAttribute('src')
    || image?.getAttribute('data-src');

  if (imageUrl) {
    section.style.backgroundImage = `url("${imageUrl}")`;
  }

  const pictureWrapper = picture.parentElement;
  if (pictureWrapper && pictureWrapper.children.length === 1) {
    pictureWrapper.remove();
  }
}

/**
 * Collects authored image URLs from the block, in document order.
 * Prefers <picture> (largest srcset), then image links (<a href>), then <img>.
 * @param {Element} block
 * @returns {string[]}
 */
function collectImageUrls(block) {
  const pictures = [...block.querySelectorAll('picture')];
  if (pictures.length) {
    return pictures.map(largestImageUrl).filter(Boolean);
  }

  const links = [...block.querySelectorAll('a[href]')];
  if (links.length) {
    return links.map((a) => a.getAttribute('href')).filter(Boolean);
  }

  return [...block.querySelectorAll('img')]
    .map((img) => img.getAttribute('src'))
    .filter(Boolean);
}

/**
 * Splits a description paragraph on `[popup]` markers. Nodes before the 1st
 * marker and after the 2nd stay visible in the paragraph; nodes between the two
 * markers (the footnote text, incl. links) are moved into a returned fragment.
 * @param {Element} p
 * @returns {DocumentFragment|null} the footnote content, or null if no markers
 */
function extractFootnotePopup(p) {
  const before = document.createDocumentFragment();
  const popup = document.createDocumentFragment();
  const after = document.createDocumentFragment();
  const regions = [before, popup, after];
  let region = 0;

  [...p.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.includes('[popup]')) {
      node.nodeValue.split('[popup]').forEach((piece, i) => {
        if (i > 0 && region < 2) region += 1;
        if (piece) regions[region].appendChild(document.createTextNode(piece));
      });
      // Drop the original marker text node (its clean pieces were re-added).
      node.remove();
    } else {
      regions[region].appendChild(node);
    }
  });

  // Visible description = before + after; footnote = between.
  p.append(before, after);
  return popup.childNodes.length ? popup : null;
}

/**
 * Builds a dismissible popup panel wrapping the given content.
 * @param {string} modifier BEM modifier (e.g. 'footnote', 'info')
 * @param {Node} content
 * @returns {HTMLElement}
 */
function buildPopup(modifier, content) {
  const popup = document.createElement('div');
  popup.className = `${SIGNIN_BLOCK}__popup ${SIGNIN_BLOCK}__popup--${modifier}`;
  popup.hidden = true;

  const body = document.createElement('div');
  body.className = `${SIGNIN_BLOCK}__popup-body`;
  body.append(content);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = `${SIGNIN_BLOCK}__popup-close`;
  close.setAttribute('aria-label', 'Close');
  close.innerHTML = '&times;';
  close.addEventListener('click', () => { popup.hidden = true; });

  popup.append(body, close);
  return popup;
}

/**
 * Returns a toggle handler that opens `popup` and closes the others.
 * @param {HTMLElement} popup
 * @param {HTMLElement[]} allPopups
 * @returns {() => void}
 */
function popupToggle(popup, allPopups) {
  return () => {
    const willOpen = popup.hidden;
    allPopups.forEach((pp) => { pp.hidden = true; });
    popup.hidden = !willOpen;
  };
}

/**
 * Variation "hero-banner-signin".
 *   - info row    → "[info]…" text shown via an Info button popup
 *
 * @param {Element} block
 */
function renderSignin(block) {
  // Classify the remaining rows by their content.
  let imageRow;
  let contentRow;
  let infoRow;
  [...block.children].forEach((row) => {
    if (/\[info\]/.test(row.textContent)) infoRow = row;
    else if (row.querySelector('h1, h2, h3, h4, h5, h6')) contentRow = row;
    else if (row.querySelector('a[href], picture, img')) imageRow = row;
  });

  const popups = [];

  // 1. Media — both authored image links become CSS backgrounds; links removed.
  const media = document.createElement('div');
  media.className = `${SIGNIN_BLOCK}__media`;
  if (imageRow) {
    const [desktopUrl, mobileUrl] = collectImageUrls(imageRow);
    if (desktopUrl) {
      block.style.setProperty(`--${SIGNIN_BLOCK}-desktop-image`, `url("${desktopUrl}")`);
    }
    const mobileImage = mobileUrl || desktopUrl;
    if (mobileImage) {
      block.style.setProperty(`--${SIGNIN_BLOCK}-mobile-image`, `url("${mobileImage}")`);
    }
  }

  // 2. Content — heading + description overlaid on the media.
  const content = document.createElement('div');
  content.className = `${SIGNIN_BLOCK}__content`;

  const heading = contentRow?.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add(`${SIGNIN_BLOCK}__title`);
    content.append(heading);
  }

  const description = contentRow?.querySelector('p');
  if (description) {
    description.classList.add(`${SIGNIN_BLOCK}__description`);
    const footnote = extractFootnotePopup(description);
    content.append(description);

    // The <sup> (the "*") toggles the footnote popup.
    const trigger = description.querySelector('sup');
    if (footnote && trigger) {
      const popup = buildPopup('footnote', footnote);
      popups.push(popup);
      trigger.classList.add(`${SIGNIN_BLOCK}__footnote-trigger`);
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('tabindex', '0');
      const toggle = popupToggle(popup, popups);
      trigger.addEventListener('click', toggle);
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });
    }
  }

  // 3. Info button + popup.
  if (infoRow) {
    const infoText = infoRow.textContent.replace('[info]', '').trim();
    const infoContent = document.createElement('p');
    infoContent.textContent = infoText;
    const popup = buildPopup('info', infoContent);
    popups.push(popup);

    const infoBtn = document.createElement('button');
    infoBtn.type = 'button';
    infoBtn.className = `${SIGNIN_BLOCK}__info-btn`;
    infoBtn.textContent = 'Info';
    infoBtn.addEventListener('click', popupToggle(popup, popups));
    content.append(infoBtn);
  }

  // 4. Close any open popup when clicking elsewhere on the page (but not on a
  // popup itself or a trigger), or when pressing Escape.
  if (popups.length) {
    const keepOpenSelector = `.${SIGNIN_BLOCK}__popup, .${SIGNIN_BLOCK}__info-btn, .${SIGNIN_BLOCK}__footnote-trigger`;
    document.addEventListener('click', (e) => {
      if (e.target.closest(keepOpenSelector)) return;
      popups.forEach((pp) => { pp.hidden = true; });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') popups.forEach((pp) => { pp.hidden = true; });
    });
  }

  // 5. Rebuild the block (images are backgrounds only; links never render).
  block.textContent = '';
  block.append(media, content, ...popups);
}

/**
 * Loads and decorates the hero block, dispatching to the right variation.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Reads Brand / Class Name authoring rows and applies `brand-<brand>` +
  // the class name to the block (data-brand is also set) — same as table.js.
  getBlockConfig(block);
  removeConfigRows(block);

  if (block.classList.contains('hero-banner-signin')) {
    renderSignin(block);
  } else {
    renderImageOnly(block);
  }
}
