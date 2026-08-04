import { getBlockConfig } from '../../scripts/utils/block-config.js';
function decorateTextV1(block) {
    block.classList.add('text-standard');
  
    const wrapper = document.createElement('div');
    wrapper.className = 'tmna-text-wrapper';
  
    block.parentNode.insertBefore(wrapper, block);
    wrapper.appendChild(block);
  }
  
  function decorateTextV2(block) {
    const rows = [...block.children];
  
    const wrapper = document.createElement('div');
    wrapper.className = 'text-three-column-wrapper';
  
    rows.forEach((row) => {
      const cols = [...row.children];
  
      if (cols.length < 3) return;
  
      row.classList.add('text-three-column-card');
      cols[0].classList.add('text-three-column-icon');
      cols[1].classList.add('text-three-column-content');
      cols[2].classList.add('text-three-column-resources');
  
      wrapper.append(row);
    });
  
    block.innerHTML = '';
    block.append(wrapper);
  
    const cards = [...wrapper.children];
  
    const endSpacer = document.createElement('div');
    endSpacer.className = 'carousel-end-spacer';
    wrapper.append(endSpacer);
  
    let current = 0;
  
    const pagination = document.createElement('div');
    pagination.className = 'text-three-column-pagination';
  
    pagination.innerHTML = `
      <button class="carousel-prev" aria-label="Previous">
        <svg class="arrow-left" width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M2.071 13c-.552 0-1-.448-1-1s.448-1 1-1h7V4c0-.552.448-1 1-1s1 .448 1 1v8c0 .513-.386.936-.883.993L10.07 13h-8z"
            transform="rotate(-45 6.071 8)"
            fill="currentColor">
          </path>
        </svg>
      </button>
  
      <div class="carousel-counter">
        <span class="current">1</span> of
        <span class="total">${cards.length}</span>
      </div>
  
      <button class="carousel-next" aria-label="Next">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M2.071 13c-.552 0-1-.448-1-1s.448-1 1-1h7V4c0-.552.448-1 1-1s1 .448 1 1v8c0 .513-.386.936-.883.993L10.07 13h-8z"
            transform="rotate(-45 6.071 8)"
            fill="currentColor">
          </path>
        </svg>
      </button>
    `;
  
    block.append(pagination);
  
    const currentEl = pagination.querySelector('.current');
    const prevBtn = pagination.querySelector('.carousel-prev');
    const nextBtn = pagination.querySelector('.carousel-next');
  
    const updateCarousel = () => {
      if (window.innerWidth >= 768) {
        wrapper.style.transform = '';
  
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
      }
  
      const card = cards[0];
  
      if (!card) return;
  
      const gap = 12;
      const cardWidth = card.getBoundingClientRect().width;
      const viewportWidth = block.clientWidth;
      const sidePadding = 24;
  
      let offset = 0;
  
      if (current > 0) {
        offset = current * (cardWidth + gap)
        - ((viewportWidth - cardWidth) / 2)
        + sidePadding;
      }
  
      wrapper.style.transform = `translateX(-${offset}px)`;
  
      currentEl.textContent = current + 1;
  
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === cards.length - 1;
  
      cards.forEach((cardEl, index) => {
        cardEl.classList.toggle('is-active', index === current);
      });
    };
  
    prevBtn.addEventListener('click', () => {
      if (current > 0) {
        current -= 1;
        updateCarousel();
      }
    });
  
    nextBtn.addEventListener('click', () => {
      if (current < cards.length - 1) {
        current += 1;
        updateCarousel();
      }
    });
  
    window.addEventListener('resize', updateCarousel);
  
    updateCarousel();
  }
  
  function decorateTextV3(block) {
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
  
  function decorateTextV4(block) {
    block.classList.add('text-standard-privacy');
  
    const row = block.firstElementChild;
  
    if (!row) return;
  
    row.classList.add('text-standard-privacy__row');
  
    const content = row.querySelector(':scope > div') || row;
  
    content.classList.add('text-standard-privacy__content');
  
    content
      .querySelectorAll('h1,h2,h3,h4,h5,h6')
      .forEach((h) => h.classList.add('text-standard-privacy__heading'));
  
    content.querySelectorAll('a').forEach((a) => {
      a.classList.add('text-standard-privacy__link');
  
      const prev = a.previousSibling;
  
      if (prev && prev.nodeType === Node.TEXT_NODE) {
        const match = prev.nodeValue.match(/\[([\w-]+)\]\s*$/);
  
        if (match) {
          a.classList.add(`text-standard-privacy__link--${match[1]}`);
          prev.nodeValue = prev.nodeValue.replace(/\[[\w-]+\]\s*$/, '');
        }
      }
    });
  
    content.querySelectorAll('ul, ol').forEach((list) => {
      list.classList.add('text-standard-privacy__list');
    });
  
    content.querySelectorAll('table').forEach((table) => {
      table.classList.add('text-standard-privacy__table');
  
      const wrapper = document.createElement('div');
      wrapper.className = 'text-standard-privacy__table-wrapper';
  
      table.replaceWith(wrapper);
      wrapper.append(table);
    });
  }
  
  export default function decorate(block) {
    // 1. Extract Config
    const { brand, className } = getBlockConfig(block);
  
    if (brand === 'toyota') {
      console.log('Toyota block');
    }
  
    if (brand === 'lexus') {
      console.log('Lexus block');
    }
  
    // 2. Remaining children are content rows
    const contentRows = [...block.children];
  
    // 3. Variant Dispatch
    if (
      block.classList.contains('text-standard-privacy') ||
      className === 'text-standard-privacy'
    ) {
      decorateTextV4(block, contentRows);
      return;
    }
  
    if (
      block.classList.contains('text-two-column') ||
      className === 'text-two-column'
    ) {
      decorateTextV3(block, contentRows);
      return;
    }
  
    if (
      block.classList.contains('text-three-column') ||
      className === 'text-three-column'
    ) {
      decorateTextV2(block, contentRows);
      return;
    }
  
    // Default Variant
    decorateTextV1(block, contentRows);
  }