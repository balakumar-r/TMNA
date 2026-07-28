/*
  footer.js
  EDS footer block, content sourced from the /privacy-footer page.

  Real-world DOM this now handles:
  - .footer-nav's Columns block was authored as 2 ROWS (row1 = 5 headings,
    row2 = 5 matching lists) instead of heading+list paired per cell. We
    pair them up by index instead of asking the author to re-author.
  - This block can end up living ON the /privacy-footer page itself (its
    own source). In that case there's nothing to fetch — the real sections
    are already siblings on the page — so we just drop the block and
    decorate what's already there, instead of fetching (and duplicating)
    itself.
*/

import { loadFragment } from '../fragment/fragment.js';

const MOBILE_BREAKPOINT = '(min-width: 64em)';

function decorateCookieConsent(section) {
  // authored as plain text (<p>Cookie Consent Options</p>), not a link —
  // match either a <p> or an <a> with that exact text.
  section.querySelectorAll('li p, li a').forEach((el) => {
    if (el.textContent.trim().toLowerCase() === 'cookie consent options') {
      const btn = document.createElement('button');
      btn.className = 'footer-cookie-consent';
      btn.type = 'button';
      btn.textContent = el.textContent.trim();
      btn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('footer:open-cookie-consent'));
      });
      el.replaceWith(btn);
    }
  });
}

/**
 * "Your Privacy Choices" is authored as two sibling <p>s inside the same
 * <li> — one with the link, one with just the icon <picture>. Move the
 * icon into the link itself so icon+text sit inline, then drop the
 * now-empty leftover <p>.
 */
function decoratePrivacyChoicesIcon(section) {
  section.querySelectorAll('li').forEach((li) => {
    const link = li.querySelector('a');
    if (!link || !link.textContent.trim().toLowerCase().includes('privacy choices')) return;
    const img = li.querySelector('img');
    if (img) link.prepend(img);
    li.querySelectorAll('p').forEach((p) => {
      if (!p.textContent.trim() && !p.querySelector('a, img')) p.remove();
    });
  });
}

function decorateExternalLinks(section) {
  section.querySelectorAll('a[href^="http"]').forEach((a) => {
    if (!a.href.includes(window.location.hostname)) {
      a.classList.add('is-external');
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });
}

/**
 * Pairs row-1 heading cells with row-2 list cells by index (the actual
 * authored shape), tags each pair, and wires the mobile accordion toggle.
 *
 * We key off the columns block's row/cell STRUCTURE, which is present in
 * the DOM as soon as the section exists — not off its size-variant class
 * (columns-5-cols) or data-block-status, which the columns block only adds
 * once its own async decorate() runs. Waiting on those was both slowing the
 * footer down and, on timeout, skipping the accordion setup entirely.
 */
function decorateAccordion(navSection) {
  const columnsBlock = navSection.querySelector('.columns');
  if (!columnsBlock) return;

  const rows = columnsBlock.querySelectorAll(':scope > div');
  const headingRow = rows[0];
  const listRow = rows[1];
  if (!headingRow || !listRow) return;

  const headingCells = [...headingRow.children];
  const listCells = [...listRow.children];

  headingCells.forEach((headingCell, i) => {
    const heading = headingCell.querySelector('h2, h3');
    const listCell = listCells[i];
    const list = listCell?.querySelector('ul');
    if (!heading || !list) return;

    headingCell.classList.add('footer-column-heading');
    listCell.classList.add('footer-column-list');
    heading.setAttribute('role', 'button');
    heading.setAttribute('tabindex', '0');
    heading.setAttribute('aria-expanded', 'false');

    const toggle = () => {
      if (window.matchMedia(MOBILE_BREAKPOINT).matches) return; // desktop: always open
      const isOpen = !listCell.classList.contains('is-open');
      listCell.classList.toggle('is-open', isOpen);
      headingCell.classList.toggle('is-open', isOpen);
      heading.setAttribute('aria-expanded', String(isOpen));
    };

    heading.addEventListener('click', toggle);
    heading.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
}

/**
 * Second column of footer-cta's columns-2-cols block = social icons.
 * (First column = Manage Preferences button.)
 */
function decorateSocialLinks(ctaSection) {
  const list = ctaSection.querySelector('.columns-2-cols > div > div:last-child ul');
  if (!list) return;
  list.classList.add('footer-social-links');
  list.querySelectorAll('a').forEach((a) => {
    const img = a.querySelector('img');
    if (img && !a.getAttribute('aria-label')) {
      a.setAttribute('aria-label', img.alt || '');
    }
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
}

function decorateManageButton(ctaSection) {
  const btnLink = ctaSection.querySelector('p > a:only-child');
  if (btnLink) {
    btnLink.classList.add('button', 'footer-manage-btn');
  }
}

/**
 * `scope` is either the block itself (content was fetched into it) or
 * `document` (this page already IS the footer source).
 */
function decorateFooterSections(scope) {
  const utility = scope.querySelector('.footer-utility');
  const cta = scope.querySelector('.footer-cta');
  const nav = scope.querySelector('.footer-nav');

  if (utility) {
    decorateCookieConsent(utility);
    decoratePrivacyChoicesIcon(utility);
    decorateExternalLinks(utility);
  }

  if (cta) {
    decorateManageButton(cta);
    decorateSocialLinks(cta);
  }

  if (nav) {
    decorateExternalLinks(nav);
    decorateAccordion(nav);
  }
}

export default async function decorate(block) {
  const footerMeta = block.dataset.footer || '/privacy-footer';
  const currentPath = window.location.pathname.replace(/\.html$/, '');
  const hasOwnContent = block.children.length > 0;

  // This page IS the footer source, or the block already has real authored
  // content in it — either way there's nothing to fetch. Decorate in place
  // (the other 3 sections are siblings of this block, not descendants, so
  // scope to `document`).
  if (currentPath === footerMeta || hasOwnContent) {
    decorateFooterSections(document);
    return;
  }

  const fragment = await loadFragment(footerMeta);
  if (!fragment) return;
  block.textContent = '';
  block.append(fragment);
  decorateFooterSections(block);
}