import { getBlockConfig } from '../../scripts/utils/block-config.js';

// Labels used for authoring config rows (Brand / Class Name). Read by
// getBlockConfig() and must NOT be rendered into the page.
const CONFIG_LABELS = ['brand', 'class name', 'classname', 'class'];

/**
 * A config row is a two-cell row whose first cell is a known config label
 * (e.g. "Brand" | "toyota", "Class Name" | "cards-with-divider").
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
 * Default cards variation — image as background with a content overlay.
 * @param {Element} block
 */
function renderDefault(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const [colA, colB] = [...row.children];

  // Auto-detect which column holds the image
  const colAHasImage = !!colA.querySelector('picture');
  const imageCol = colAHasImage ? colA : colB;
  const contentCol = colAHasImage ? colB : colA;

  // Text side modifier — also the BEM prefix for this variation's elements
  // (cards--text-right / cards--text-left share the same functionality).
  const VARIANT = colAHasImage ? 'cards--text-right' : 'cards--text-left';
  block.classList.add(VARIANT);

  // Background image
  const bgWrap = document.createElement('div');
  bgWrap.className = `${VARIANT}-bg`;

  const picture = imageCol.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      img.setAttribute('loading', 'eager');
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
    bgWrap.append(picture);
  }

  // Content overlay
  const content = document.createElement('div');
  content.className = `${VARIANT}-content`;

  [...contentCol.children].forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) {
      const heading = document.createElement(el.tagName.toLowerCase());
      heading.className = `${VARIANT}-heading`;
      heading.innerHTML = el.innerHTML;
      content.append(heading);
      return;
    }

    const anchor = el.querySelector('a');
    if (anchor) {
      const isPdf = anchor.href?.toLowerCase().includes('.pdf');
      const a = document.createElement('a');
      a.href = anchor.href;
      a.className = isPdf ? `${VARIANT}-link ${VARIANT}-pdf-link` : `${VARIANT}-link`;
      a.innerHTML = anchor.innerHTML || anchor.textContent.trim();
      if (anchor.target) a.target = anchor.target;
      content.append(a);
      return;
    }

    if (el.textContent.trim()) {
      const p = document.createElement('p');
      p.className = `${VARIANT}-text`;
      p.textContent = el.textContent.trim();
      content.append(p);
    }
  });

  block.textContent = '';
  block.append(bgWrap, content);
}

/**
 * "cards-with-divider" variation — image + text side-by-side with a divider.
 * @param {Element} block
 */
function renderWithDivider(block) {
  const row = block.querySelector(':scope > div');
  if (!row) return;

  const cells = [...row.children];
  const [textCell, imageCell] = cells;

  // ── Image side ─────────────────────────────────────────────
  const mediaWrap = document.createElement('div');
  mediaWrap.className = 'cards-with-divider-media';

  const picture = imageCell?.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      img.setAttribute('loading', 'lazy');
      img.removeAttribute('width');
      img.removeAttribute('height');
    }
    mediaWrap.append(picture);
  }

  // ── Text side ──────────────────────────────────────────────
  const textWrap = document.createElement('div');
  textWrap.className = 'cards-with-divider-text';

  let headingEl = null;
  const lines = [...textCell.children].filter((el) => el.textContent.trim());

  lines.forEach((el, index) => {
    const link = el.querySelector('a');

    if (index === 0 && !link) {
      const heading = document.createElement('h2');
      heading.className = 'cards-with-divider-heading';
      heading.textContent = el.textContent.trim();
      textWrap.append(heading);
      headingEl = heading;

      // Mobile inline divider — visible only on mobile via CSS
      const mobileDivider = document.createElement('div');
      mobileDivider.className = 'cards-with-divider-divider-mobile';
      textWrap.append(mobileDivider);
      return;
    }

    if (link) {
      const cta = document.createElement('a');
      cta.className = 'cards-with-divider-cta';
      cta.href = link.href;
      cta.textContent = link.textContent.trim();
      textWrap.append(cta);
      return;
    }

    const desc = document.createElement('p');
    desc.className = 'cards-with-divider-description';
    desc.textContent = el.textContent.trim();
    textWrap.append(desc);
  });

  // ── Desktop full-width divider ─────────────────────────────
  const desktopDivider = document.createElement('div');
  desktopDivider.className = 'cards-with-divider-divider';

  // ── Rebuild DOM ────────────────────────────────────────────
  const inner = document.createElement('div');
  inner.className = 'cards-with-divider-inner';
  inner.append(mediaWrap, textWrap);

  block.textContent = '';
  block.append(inner, desktopDivider);

  // Position desktop divider dynamically below the heading element
  const positionDivider = () => {
    if (!headingEl || window.innerWidth <= 768) return;
    const blockTop = block.getBoundingClientRect().top;
    const headingBottom = headingEl.getBoundingClientRect().bottom;
    desktopDivider.style.top = `${headingBottom - blockTop + 8}px`;
  };

  requestAnimationFrame(positionDivider);
  window.addEventListener('resize', positionDivider);
}

/**
 * "cards-feature-cta" variation — image + content decorated in place with
 * BEM classes (eyebrow / title / description / CTA).
 * @param {Element} block
 */
function renderFeatureCta(block) {
  const BLOCK = 'cards-feature-cta';

  // The block has a single row with two cells: image and content.
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add(`${BLOCK}__row`);

  [...row.children].forEach((cell) => {
    const picture = cell.querySelector('picture');

    if (picture) {
      // --- Image cell ---
      cell.classList.add(`${BLOCK}__media`);
      picture.classList.add(`${BLOCK}__picture`);
      const img = picture.querySelector('img');
      if (img) img.classList.add(`${BLOCK}__image`);
      return;
    }

    // --- Content cell ---
    cell.classList.add(`${BLOCK}__content`);

    const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) heading.classList.add(`${BLOCK}__title`);

    cell.querySelectorAll('p').forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        // paragraph wrapping a link → call to action
        p.classList.add(`${BLOCK}__cta`);
        link.classList.add(`${BLOCK}__link`);
      } else if (heading
        && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        // paragraph before the heading → eyebrow / label
        p.classList.add(`${BLOCK}__eyebrow`);
      } else {
        p.classList.add(`${BLOCK}__description`);
      }
    });
  });
}

/**
 * Decorates one cell (image / heading / paragraphs) with BEM classes for the
 * "cards-map-tooltip" variation.
 * @param {Element} cell The cell (direct child of the row)
 * @param {string} BLOCK BEM block prefix
 */
function decorateMapTooltipCell(cell, BLOCK) {
  cell.classList.add(`${BLOCK}__cell`);

  // --- Media ---
  const picture = cell.querySelector('picture');
  if (picture) {
    picture.classList.add(`${BLOCK}__picture`);
    const img = picture.querySelector('img');
    if (img) img.classList.add(`${BLOCK}__image`);
    // a <p> that only wraps the picture is a media container, not body copy
    const mediaWrap = picture.closest('p');
    if (mediaWrap && mediaWrap.textContent.trim() === '') {
      mediaWrap.classList.add(`${BLOCK}__media`);
    }
  }

  // --- Heading ---
  const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add(`${BLOCK}__title`);

  // --- Paragraphs ---
  cell.querySelectorAll('p').forEach((p) => {
    if (p.classList.contains(`${BLOCK}__media`)) return; // already handled

    const link = p.querySelector('a');
    if (link) {
      // paragraph wrapping a link → call to action
      p.classList.add(`${BLOCK}__cta`);
      link.classList.add(`${BLOCK}__link`);
    } else if (
      heading
      && (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING)
    ) {
      // paragraph before the heading → eyebrow / label
      p.classList.add(`${BLOCK}__eyebrow`);
    } else {
      p.classList.add(`${BLOCK}__description`);
    }
  });
}

/**
 * "cards-map-tooltip" variation — decorates each cell in place with BEM classes.
 * @param {Element} block
 */
function renderMapTooltip(block) {
  const BLOCK = 'cards-map-tooltip';
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add(`${BLOCK}__row`);

  [...row.children].forEach((cell) => decorateMapTooltipCell(cell, BLOCK));
}

/**
 * Loads and decorates the cards block, dispatching to the right variation.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { brand, className } = getBlockConfig(block);
  if (brand === 'toyota') {
    console.log('Toyota block');
  }
  if (brand === 'lexus') {
    console.log('Lexus block');
  }
  console.log(className);

  // Strip Brand / Class Name rows so they don't render as content.
  removeConfigRows(block);

  if (block.classList.contains('cards-with-divider')) {
    renderWithDivider(block);
  } else if (block.classList.contains('cards-feature-cta')) {
    renderFeatureCta(block);
  } else if (block.classList.contains('cards-map-tooltip')) {
    renderMapTooltip(block);
  } else if (block.classList.contains('cards-info-link')) {
    renderInfoLink(block);
  } else if (block.classList.contains('cards-profile')) {
    renderProfile(block);
  } else {
    renderDefault(block);
  }
}


const INFO_LINK_CHEVRON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/**
 * Adds a BEM element class (`block__element`) to a node, if present.
 * @param {Element|null} el The element to decorate
 * @param {string} element The BEM element name
 * @param {string} BLOCK BEM block prefix
 */
function addInfoLinkClass(el, element, BLOCK) {
  if (el) {
    el.classList.add(`${BLOCK}__${element}`);
  }
}

/**
 * Applies BEM classes to a single card's inner content.
 * @param {Element} card The card element
 * @param {string} BLOCK BEM block prefix
 */
function decorateInfoLinkCard(card, BLOCK) {
  addInfoLinkClass(card, 'card', BLOCK);
  addInfoLinkClass(card.querySelector('h1, h2, h3, h4, h5, h6'), 'title', BLOCK);
  addInfoLinkClass(card.querySelector('picture'), 'icon', BLOCK);
  addInfoLinkClass(card.querySelector('picture img'), 'image', BLOCK);
  addInfoLinkClass(card.querySelector('p'), 'cta', BLOCK);
  addInfoLinkClass(card.querySelector('a'), 'link', BLOCK);
}

/**
 * Builds the mobile carousel navigation (prev / counter / next) and wires up
 * scroll + click behavior. Controls are hidden via CSS on tablet and up.
 * @param {Element} block The block element
 * @param {Element} track The scrollable track element
 * @param {Element[]} cards The card elements
 * @param {string} BLOCK BEM block prefix
 */
function buildInfoLinkCarousel(block, track, cards, BLOCK) {
  const total = cards.length;

  const nav = document.createElement('div');
  nav.className = `${BLOCK}__nav`;

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = `${BLOCK}__nav-btn ${BLOCK}__nav-btn--prev`;
  prev.setAttribute('aria-label', 'Previous card');
  prev.innerHTML = INFO_LINK_CHEVRON;

  const counter = document.createElement('span');
  counter.className = `${BLOCK}__counter`;
  counter.setAttribute('aria-live', 'polite');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = `${BLOCK}__nav-btn ${BLOCK}__nav-btn--next`;
  next.setAttribute('aria-label', 'Next card');
  next.innerHTML = INFO_LINK_CHEVRON;

  nav.append(prev, counter, next);
  block.append(nav);

  const ACTIVE = `${BLOCK}__nav-btn--active`;
  const setActive = (btn) => {
    [prev, next].forEach((b) => b.classList.toggle(ACTIVE, b === btn));
  };

  // Distance between adjacent cards (card width + gap), read from the DOM.
  const step = () => (total > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth);
  const currentIndex = () => Math.round(track.scrollLeft / step());

  const render = () => {
    const index = currentIndex();
    counter.textContent = `${index + 1} of ${total}`;
    prev.disabled = index <= 0;
    next.disabled = index >= total - 1;
    // A disabled (end-reached) button can't stay active.
    [prev, next].forEach((b) => {
      if (b.disabled) b.classList.remove(ACTIVE);
    });
  };

  const goTo = (i) => {
    const clamped = Math.max(0, Math.min(total - 1, i));
    track.scrollTo({ left: clamped * step(), behavior: 'smooth' });
  };

  prev.addEventListener('click', () => {
    setActive(prev);
    goTo(currentIndex() - 1);
  });
  next.addEventListener('click', () => {
    setActive(next);
    goTo(currentIndex() + 1);
  });

  let ticking = false;
  track.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        render();
        ticking = false;
      });
    }
  });
  window.addEventListener('resize', render);

  render();
}

/**
 * "cards-info-link" variation — icon/title/CTA cards in a grid (desktop) or a
 * swipeable carousel with prev/next controls (mobile).
 * @param {Element} block
 */
function renderInfoLink(block) {
  const BLOCK = 'cards-info-link';

  // Collect every card from every authored row, decorate it, and flatten
  // them into a single track (the grid on desktop, the carousel on mobile).
  const cards = [...block.querySelectorAll(':scope > div > div')];
  cards.forEach((card) => decorateInfoLinkCard(card, BLOCK));

  const track = document.createElement('div');
  track.className = `${BLOCK}__track`;
  cards.forEach((card) => track.append(card));
  block.replaceChildren(track);

  if (cards.length > 1) {
    buildInfoLinkCarousel(block, track, cards, BLOCK);
  }
}

/**
 * "cards-profile" variation
 * @param {Element} block
 */
function renderProfile(block) {
  const row = block.firstElementChild;
  if (!row) return;

  block.classList.add('cards-profile');
  row.classList.add('cards-profile__row');

  const cells = [...row.children];
  const mediaCell = cells.find((cell) => cell.querySelector('picture'));
  const contentCell = cells.find((cell) => cell !== mediaCell);

  // Media cell
  if (mediaCell) {
    mediaCell.classList.add('cards-profile__media');
    mediaCell.querySelector('picture')?.classList.add('cards-profile__picture');
    mediaCell.querySelector('img')?.classList.add('cards-profile__image');
  }

  // Content cell
  if (contentCell) {
    contentCell.classList.add('cards-profile__content');

    contentCell
      .querySelector('h1, h2, h3, h4, h5, h6')
      ?.classList.add('cards-profile__title');

    contentCell.querySelectorAll('p').forEach((p) => {
      const link = p.querySelector('a');

      if (link) {
        p.classList.add('cards-profile__cta-wrapper');
        link.classList.add('cards-profile__cta');
      } else {
        p.classList.add('cards-profile__text');
      }
    });
  }
}