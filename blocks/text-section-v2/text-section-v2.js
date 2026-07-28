export default function decorate(block) {
    const rows = [...block.children];
  
    const wrapper = document.createElement('div');
    wrapper.className = 'text-section-v2-wrapper';
  
    rows.forEach((row) => {
      const cols = [...row.children];
  
      if (cols.length < 3) return;
  
      row.classList.add('text-section-v2-card');
      cols[0].classList.add('text-section-v2-icon');
      cols[1].classList.add('text-section-v2-content');
      cols[2].classList.add('text-section-v2-resources');
  
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
    pagination.className = 'text-section-v2-pagination';
  
    pagination.innerHTML = `
    <button class="carousel-prev" aria-label="Previous">
  <svg class="arrow-left" width="16" height="16" viewBox="0 0 16 16">
    <g>
      <g>
        <path
          d="M2.071 13c-.552 0-1-.448-1-1s.448-1 1-1h7V4c0-.552.448-1 1-1s1 .448 1 1v8c0 .513-.386.936-.883.993L10.07 13h-8z"
          transform="rotate(-45 6.071 8)"
          fill="currentColor">
        </path>
      </g>
    </g>
  </svg>
</button>
  
      <div class="carousel-counter">
        <span class="current">1</span> of
        <span class="total">${cards.length}</span>
      </div>
  
      <button class="carousel-next" aria-label="Next">
  <svg width="16" height="16" viewBox="0 0 16 16">
    <g>
      <g>
        <path
          d="M2.071 13c-.552 0-1-.448-1-1s.448-1 1-1h7V4c0-.552.448-1 1-1s1 .448 1 1v8c0 .513-.386.936-.883.993L10.07 13h-8z"
          transform="rotate(-45 6.071 8)"
          fill="currentColor">
        </path>
      </g>
    </g>
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
        offset =
          current * (cardWidth + gap)
          - ((viewportWidth - cardWidth) / 2)
          + sidePadding;
      }
  
      wrapper.style.transform = `translateX(-${offset}px)`;
  
      currentEl.textContent = current + 1;
  
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === cards.length - 1;
  
      cards.forEach((cardEl, index) => {
        cardEl.classList.toggle(
          'is-active',
          index === current,
        );
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