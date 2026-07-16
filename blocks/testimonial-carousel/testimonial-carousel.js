export default function decorate(block) {
  const slides = [...block.children];

  const carousel = document.createElement('div');
  carousel.className = 'carouselbanner';

  const track = document.createElement('div');
  track.className = 'carousel-track';

  // Create cards
  slides.forEach((slide) => {
    const cols = [...slide.children];

    const heading = cols[0]?.textContent?.trim() || '';
    const body = cols[1]?.textContent?.trim() || '';
    const cta = cols[2]?.querySelector('a');

    const card = document.createElement('div');
    card.className = 'carousel-card';

    card.innerHTML = `
      <div class="card-content">
        <h3 class="testimonial-heading">${heading}</h3>

        <p class="testimonial-body">
          ${body}
        </p>

        ${
          cta
            ? `
              <a class="card-cta" href="${cta.href}">
                ${cta.textContent}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
              </a>
              
            `
            : ''
        }
      </div>
    `;

    track.append(card);
  });

  carousel.append(track);

  // Don't show controls if only one testimonial
  if (slides.length > 1) {
    const controls = document.createElement('div');
    controls.className = 'carousel-controls';

    controls.innerHTML = `
      <button
        class="carousel-arrow carousel-arrow-prev"
        aria-label="Previous testimonial">
        &#10094;
      </button>

      <div class="carousel-pagination"></div>

      <button
        class="carousel-arrow carousel-arrow-next"
        aria-label="Next testimonial">
        &#10095;
      </button>
    `;

    carousel.append(controls);

    const pagination = controls.querySelector('.carousel-pagination');

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `pagination-dot ${index === 0 ? 'active' : ''}`;

      dot.addEventListener('click', () => {
        goToSlide(index);
      });

      pagination.append(dot);
    });
  }

  block.innerHTML = '';
  block.append(carousel);

  // ====================
  // Carousel Logic
  // ====================

  const cards = [...track.children];
  const dots = [...block.querySelectorAll('.pagination-dot')];
  const prevBtn = block.querySelector('.carousel-arrow-prev');
  const nextBtn = block.querySelector('.carousel-arrow-next');

  let currentIndex = 0;

  function updateCarousel() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });

    if (prevBtn) {
      prevBtn.disabled = currentIndex === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = currentIndex === cards.length - 1;
    }
  }

  function goToSlide(index) {
    currentIndex = index;
    updateCarousel();
  }

  prevBtn?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      updateCarousel();
    }
  });

  updateCarousel();
}