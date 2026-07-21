const BLOCK = 'card-v5';

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default function decorate(block) {
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
