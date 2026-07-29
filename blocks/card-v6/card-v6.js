const BLOCK = 'card-v6';

/**
 * Decorates the text/media inside a single cell with BEM class names.
 * A cell may contain an image, a heading, and one or more paragraphs.
 * @param {Element} cell The cell (direct child of the row)
 */
function decorateCell(cell) {
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
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add(`${BLOCK}__row`);

  [...row.children].forEach((cell) => decorateCell(cell));
}
