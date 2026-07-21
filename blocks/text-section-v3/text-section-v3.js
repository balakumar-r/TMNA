export default function decorate(block) {
    const row = block.firstElementChild;
    if (!row) return;
    const [left, middle, right] = [...row.children];
    left.classList.add('left-content');
    middle.classList.add('middle-content');
    right.classList.add('right-content');
    const tag = left.querySelector('p');

    if (tag) {
      tag.classList.add('tag');
    }

    const price = right.querySelector('p');
    if (price) {
      const text = price.textContent.trim();
      const match = text.match(/^(\$[\d,.]+)\s*(.*)$/);
      if (match) {
        price.innerHTML = `<span>${match[1]}</span> ${match[2]}`;
      }
      price.classList.add('price');
    } 
    
    const link = right.querySelector('a'); 
    if (link) {
      link.classList.add('addon-link');
      link.target = '_blank';
      link.rel = 'noopener';
    }
  }