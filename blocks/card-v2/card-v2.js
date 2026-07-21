const BLOCK = 'card-v2';

const CHEVRON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
  <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/**
 * Adds a BEM element class (`block__element`) to a node, if present.
 * @param {Element|null} el The element to decorate
 * @param {string} element The BEM element name
 */
function addElementClass(el, element) {
  if (el) {
    el.classList.add(`${BLOCK}__${element}`);
  }
}

/**
 * Applies BEM classes to a single card's inner content.
 * @param {Element} card The card element
 */
function decorateCard(card) {
  addElementClass(card, 'card');
  addElementClass(card.querySelector('h1, h2, h3, h4, h5, h6'), 'title');
  addElementClass(card.querySelector('picture'), 'icon');
  addElementClass(card.querySelector('picture img'), 'image');
  addElementClass(card.querySelector('p'), 'cta');
  addElementClass(card.querySelector('a'), 'link');
}

/**
 * Builds the mobile carousel navigation (prev / counter / next) and wires up
 * scroll + click behavior. Controls are hidden via CSS on tablet and up.
 * @param {Element} block The block element
 * @param {Element} track The scrollable track element
 * @param {Element[]} cards The card elements
 */
function buildCarousel(block, track, cards) {
  const total = cards.length;

  const nav = document.createElement('div');
  nav.className = `${BLOCK}__nav`;

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = `${BLOCK}__nav-btn ${BLOCK}__nav-btn--prev`;
  prev.setAttribute('aria-label', 'Previous card');
  prev.innerHTML = CHEVRON;

  const counter = document.createElement('span');
  counter.className = `${BLOCK}__counter`;
  counter.setAttribute('aria-live', 'polite');

  const next = document.createElement('button');
  next.type = 'button';
  next.className = `${BLOCK}__nav-btn ${BLOCK}__nav-btn--next`;
  next.setAttribute('aria-label', 'Next card');
  next.innerHTML = CHEVRON;

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
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // Collect every card from every authored row, decorate it, and flatten
  // them into a single track (the grid on desktop, the carousel on mobile).
  const cards = [...block.querySelectorAll(':scope > div > div')];
  cards.forEach(decorateCard);

  const track = document.createElement('div');
  track.className = `${BLOCK}__track`;
  cards.forEach((card) => track.append(card));
  block.replaceChildren(track);

  if (cards.length > 1) {
    buildCarousel(block, track, cards);
  }
}
