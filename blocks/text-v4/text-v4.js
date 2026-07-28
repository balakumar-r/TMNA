/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;

  block.classList.add('text-v4');
  row.classList.add('text-v4__row');

  const content = row.querySelector(':scope > div') || row;
  content.classList.add('text-v4__content');

  // Semantic elements get BEM classes; body copy is styled via the block scope.
  content
    .querySelectorAll('h1, h2, h3, h4, h5, h6')
    .forEach((h) => h.classList.add('text-v4__heading'));

  content.querySelectorAll('a').forEach((a) => {
    a.classList.add('text-v4__link');

    // A marker like [text] / [text-ver] sitting just before the link names a
    // unique modifier class for it. Read it from the preceding text node,
    // apply the class, then strip only the marker token.
    const prev = a.previousSibling;
    if (prev && prev.nodeType === Node.TEXT_NODE) {
      const match = prev.nodeValue.match(/\[([\w-]+)\]\s*$/);
      if (match) {
        a.classList.add(`text-v4__link--${match[1]}`);
        prev.nodeValue = prev.nodeValue.replace(/\[[\w-]+\]\s*$/, '');
      }
    }
  });

  content
    .querySelectorAll('ul, ol')
    .forEach((list) => list.classList.add('text-v4__list'));

  // Wrap tables so they can scroll horizontally instead of overflowing.
  content.querySelectorAll('table').forEach((table) => {
    table.classList.add('text-v4__table');
    const wrapper = document.createElement('div');
    wrapper.className = 'text-v4__table-wrapper';
    table.replaceWith(wrapper);
    wrapper.append(table);
  });
}
