export default function decorate(block) {
    const rows = [...block.children];
  
    const wrapper = document.createElement('div');
    wrapper.className = 'timeline__wrapper';
  
    const title = document.createElement('h2');
    title.className = 'timeline__title';
    title.textContent = 'Learn about your Connected Services';
  
    const grid = document.createElement('div');
    grid.className = 'timeline__grid';
  
    rows.forEach((row, index) => {
      const cols = [...row.children];
  
      if (cols.length < 2) return;
  
      const image = cols[0].querySelector('img');
      const link = cols[1].querySelector('a');
  
      if (!link) return;
  
      const text = link.textContent.trim();
  
      const item = document.createElement('a');
      item.className = 'timeline__item';
  
      item.href = link.href;
      item.target = '_blank';
      item.rel = 'noopener noreferrer';
  
      // Remove divider:
      // 2025 ↔ 2024 (second group)
      // 2019 ↔ 2018
      if (index === 5 || index === 11) {
        item.classList.add('timeline__item--no-divider');
      }
  
      const overlay = document.createElement('div');
      overlay.className = 'timeline__overlay';
  
      const iconWrapper = document.createElement('div');
      iconWrapper.className = 'timeline__icon';
  
      if (image) {
        const clonedImage = image.cloneNode(true);
        clonedImage.alt = text;
        iconWrapper.appendChild(clonedImage);
      }
  
      const content = document.createElement('div');
      content.className = 'timeline__content';
      content.innerHTML = buildLabel(text);
  
      overlay.appendChild(iconWrapper);
      overlay.appendChild(content);
  
      item.appendChild(overlay);
      grid.appendChild(item);
    });
  
    block.innerHTML = '';
  
    wrapper.appendChild(title);
    wrapper.appendChild(grid);
  
    block.appendChild(wrapper);
  }
  
  function buildLabel(text) {
    const words = text.split(' ');
    const year = words.shift();
  
    return `
      <span class="timeline__year">${year}</span>
      <span class="timeline__label">
        ${words.join('<br>')}
      </span>
    `;
  }