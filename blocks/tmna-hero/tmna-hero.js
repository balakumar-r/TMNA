export default function decorate(block) {
  const section = block.closest('.section.tmna-hero-container');
  const picture = block.querySelector('.tmna-hero picture');

  if (!section || !picture) {
    return;
  }

  const image = picture.querySelector('img');
  const candidates = [];

  picture.querySelectorAll('source, img').forEach((el) => {
    const srcset = el.getAttribute('srcset') || el.getAttribute('src');
    if (!srcset) {
      return;
    }

    srcset.split(',').forEach((item) => {
      const trimmed = item.trim();
      if (!trimmed) {
        return;
      }

      const [url] = trimmed.split(/\s+/);
      const widthMatch = url.match(/[?&]width=(\d+)/i);
      const width = widthMatch ? Number(widthMatch[1]) : 0;

      if (url) {
        candidates.push({ url, width });
      }
    });
  });

  const imageUrl = candidates
    .filter(({ url }) => url)
    .sort((a, b) => b.width - a.width)[0]?.url
    || image?.currentSrc
    || image?.getAttribute('src')
    || image?.getAttribute('data-src');

  if (imageUrl) {
    section.style.backgroundImage = `url("${imageUrl}")`;
  }

  const pictureWrapper = picture.parentElement;
  if (pictureWrapper && pictureWrapper.children.length === 1) {
    pictureWrapper.remove();
  }
}
