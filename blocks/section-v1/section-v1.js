/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  block.classList.add('section-v1');
  row.classList.add('section-v1__row');

  const cells = [...row.children];
  const mediaCell = cells.find((cell) => cell.querySelector('picture'));
  const contentCell = cells.find((cell) => cell !== mediaCell);

  // Media cell — the image column.
  if (mediaCell) {
    mediaCell.classList.add('section-v1__media');
    mediaCell.querySelector('picture')?.classList.add('section-v1__picture');
    mediaCell.querySelector('img')?.classList.add('section-v1__image');
  }

  // Content cell — heading, body copy and CTA.
  if (contentCell) {
    contentCell.classList.add('section-v1__content');
    contentCell
      .querySelector('h1, h2, h3, h4, h5, h6')
      ?.classList.add('section-v1__title');

    contentCell.querySelectorAll('p').forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        p.classList.add('section-v1__cta-wrapper');
        link.classList.add('section-v1__cta');
      } else {
        p.classList.add('section-v1__text');
      }
    });
  }
}
