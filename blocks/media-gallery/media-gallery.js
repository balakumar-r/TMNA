function getText(cell) {
  return cell?.textContent?.trim() || '';
}

function getAssetUrl(cell) {
  if (!cell) return '';

  const link = cell.querySelector('a');
  if (link) return link.href;

  const img = cell.querySelector('img');
  if (img) return img.src;

  return getText(cell);
}

function normalizeKey(key) {
  return key
    .toLowerCase()
    .trim()
    .replaceAll(' ', '-')
    .replace(/[^a-z0-9-]/g, '');
}

function readConfig(block) {
  const config = {};

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length < 2) return;

    const key = normalizeKey(getText(cells[0]));
    const valueCell = cells[1];

    config[key] = {
      text: getText(valueCell),
      url: getAssetUrl(valueCell),
    };
  });

  return config;
}

function createImage(src, alt = '') {
  const picture = document.createElement('picture');

  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  img.loading = 'eager';
  img.decoding = 'async';

  picture.append(img);

  return picture;
}

function createVideo(src, alt = '') {
  const video = document.createElement('video');

  video.className = 'media-gallery__video';
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  if (alt) {
    video.setAttribute('aria-label', alt);
  } else {
    video.setAttribute('aria-hidden', 'true');
  }

  const source = document.createElement('source');
  source.src = src;
  source.type = 'video/mp4';

  video.append(source);

  return video;
}

function createMedia(type, src, alt = '') {
  const mediaWrapper = document.createElement('div');
  mediaWrapper.className = 'media-gallery__media';

  if (!src) return mediaWrapper;

  if (type === 'video') {
    mediaWrapper.append(createVideo(src, alt));
  } else {
    mediaWrapper.append(createImage(src, alt));
  }

  return mediaWrapper;
}

function createMediaItem(position, type, src, alt) {
  const item = document.createElement('div');
  item.className = `media-gallery__item media-gallery__item--${position}`;

  item.append(createMedia(type, src, alt));

  return item;
}

export default function decorate(block) {
  const config = readConfig(block);

  const title = config.title?.text || '';

  const mediaItems = [
    {
      position: 'center',
      type: 'image',
      src: config['center-image']?.url,
      alt: config['center-alt']?.text || '',
    },
    {
      position: 'top-left',
      type: config['top-left-type']?.text?.toLowerCase() || 'image',
      src: config['top-left-asset']?.url,
      alt: config['top-left-alt']?.text || '',
    },
    {
      position: 'top-right',
      type: config['top-right-type']?.text?.toLowerCase() || 'image',
      src: config['top-right-asset']?.url,
      alt: config['top-right-alt']?.text || '',
    },
    {
      position: 'bottom-left',
      type: config['bottom-left-type']?.text?.toLowerCase() || 'image',
      src: config['bottom-left-asset']?.url,
      alt: config['bottom-left-alt']?.text || '',
    },
    {
      position: 'bottom-right',
      type: config['bottom-right-type']?.text?.toLowerCase() || 'image',
      src: config['bottom-right-asset']?.url,
      alt: config['bottom-right-alt']?.text || '',
    },
  ];

  block.textContent = '';
  block.classList.add('media-gallery--decorated');

  const inner = document.createElement('div');
  inner.className = 'media-gallery__inner';

  mediaItems.forEach((item) => {
    if (!item.src) return;

    inner.append(
      createMediaItem(
        item.position,
        item.type,
        item.src,
        item.alt,
      ),
    );
  });

  if (title) {
    const textWrapper = document.createElement('div');
    textWrapper.className = 'media-gallery__hero-text';

    const heading = document.createElement('h1');
    heading.className = 'media-gallery__title';
    heading.textContent = title;

    textWrapper.append(heading);
    inner.append(textWrapper);
  }

  block.append(inner);
}