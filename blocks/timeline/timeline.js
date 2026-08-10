export default function decorate(block) {
  const rows = [...block.children];

  const wrapper = document.createElement('div');
  wrapper.className = 'timeline__wrapper';

  const grid = document.createElement('div');
  grid.className = 'timeline__grid';

  rows.forEach((row, index) => {
    const cols = [...row.children];

    if (cols.length < 2) return;

    const image = cols[0].querySelector('img');
    const link = cols[1].querySelector('a');

    if (!link) return;

    const item = document.createElement('a');
    item.className = 'timeline__item';

    item.href = link.href;
    item.target = '_blank';
    item.rel = 'noopener noreferrer';

    if (index === 5 || index === 11) {
      item.classList.add('timeline__item--no-divider');
    }

    // Add class from index 3 onwards
    if (index >= 3) {
      item.classList.add('timeline__item--small');
    }

    const icon = document.createElement('div');
    icon.className = 'timeline__icon';

    if (image) {
      const clonedImage = image.cloneNode(true);
      clonedImage.alt = link.textContent.trim();
      icon.appendChild(clonedImage);
    }

    const content = document.createElement('div');
    content.className = 'timeline__content';

    const text = document.createElement('span');
    text.className = 'timeline__text';
    text.innerHTML = buildText(link.textContent.trim());

    content.appendChild(text);

    item.append(icon, content);
    grid.appendChild(item);
  });

  wrapper.appendChild(grid);

  block.textContent = '';
  block.appendChild(wrapper);
}

function buildText(value) {
  return value;
}
 