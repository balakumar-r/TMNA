const BLOCK = 'footer-v3';

/**
 * loads and decorates the footer
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // The authored content sits in a single row > cell wrapper.
  const content = block.querySelector(':scope > div > div') || block;
  content.classList.add(`${BLOCK}__inner`);

  // --- "YOUR PRIVACY CHOICES" link + toggle image ---
  const privacy = content.querySelector('.button-wrapper');
  if (privacy) {
    privacy.classList.add(`${BLOCK}__privacy`);

    const privacyLink = privacy.querySelector('a');
    if (privacyLink) {
      privacyLink.classList.add(`${BLOCK}__privacy-link`);
    }

    const privacyIcon = privacy.querySelector('picture');
    if (privacyIcon) {
      privacyIcon.classList.add(`${BLOCK}__privacy-icon`);
    }
  }

  // --- primary navigation list (Privacy Notice / Terms of Use / Help) ---
  const nav = content.querySelector('ul');
  if (nav) {
    nav.classList.add(`${BLOCK}__nav`);
    nav.querySelectorAll(':scope > li').forEach((item) => {
      item.classList.add(`${BLOCK}__nav-item`);
      const link = item.querySelector('a');
      if (link) link.classList.add(`${BLOCK}__nav-link`);
    });
  }

  // --- remaining paragraphs: cookie consent link + copyright ---
  let cookie = null;
  content.querySelectorAll(':scope > p').forEach((para) => {
    // skip the privacy button wrapper handled above
    if (para.classList.contains(`${BLOCK}__privacy`)) return;

    const link = para.querySelector('a');
    if (link) {
      para.classList.add(`${BLOCK}__cookie`);
      link.classList.add(`${BLOCK}__cookie-link`);
      cookie = para;
    } else {
      para.classList.add(`${BLOCK}__copyright`);
    }
  });

  // --- group the nav list and cookie link into a single inline row ---
  if (nav || cookie) {
    const linksRow = document.createElement('div');
    linksRow.className = `${BLOCK}__links`;
    (nav || cookie).replaceWith(linksRow);
    if (nav) linksRow.append(nav);
    if (cookie) linksRow.append(cookie);
  }
}
