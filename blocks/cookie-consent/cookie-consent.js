/*
  cookie-consent.js
  Builds the "Cookie Consent" modal shown in the screenshots.

  Split of responsibilities:
  - Copy (title, intro, category names/descriptions) is authored as plain
    content on a da.live page (default: /fragments/cookie-consent) — so
    legal/marketing can edit wording without touching code.
  - This script owns everything interactive: opening/closing, toggle
    state, persistence (localStorage), and dispatching an event other
    scripts (analytics, ads, session-replay tooling) can listen for to
    turn themselves on/off based on the saved preference.

  Wiring: footer.js already dispatches `footer:open-cookie-consent` when
  the "Cookie Consent Options" button is clicked — this file listens for
  that event, so no extra wiring is needed between the two blocks.

  Usage as a page block (drop an empty "Cookie Consent" block anywhere,
  e.g. in the footer's own source page) OR import + call once from
  scripts.js as a global utility — both call ensureModal() the same way.
*/

import { loadFragment } from '../fragment/fragment.js';

const CONSENT_STORAGE_KEY = 'cookie-consent-preferences';
const DEFAULT_CONTENT_PATH = '/fragments/cookie-consent';

let modalEl = null;
let categoriesState = [];

function getSavedPreferences() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function savePreferences(prefs) {
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent('cookieConsent:saved', { detail: prefs }));
}

/**
 * Reads the authored fragment into { title, icon, intro, categories }.
 * Convention: h1/h2 = title, leading <p>s before the first h3 = intro,
 * each h3 + the paragraph right after it = one category.
 */
function parseContent(fragment) {
  const heading = fragment.querySelector('h1, h2');
  const title = heading ? heading.textContent.trim() : 'Cookie Consent';
  const icon = fragment.querySelector('img');
  const firstH3 = fragment.querySelector('h3');

  let intro = '';
  let node = heading ? heading.nextElementSibling : fragment.firstElementChild;
  while (node && node !== firstH3) {
    if (node.tagName === 'P') intro += node.innerHTML;
    node = node.nextElementSibling;
  }

  const categories = [];
  fragment.querySelectorAll('h3').forEach((h3) => {
    const name = h3.textContent.trim();
    const descEl = h3.nextElementSibling;
    const description = descEl && descEl.tagName === 'P' ? descEl.innerHTML : '';
    categories.push({ name, description });
  });

  return { title, icon, intro, categories };
}

function buildToggle(cat) {
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = `cookie-consent-toggle${cat.enabled ? ' is-on' : ''}`;
  toggle.setAttribute('role', 'switch');
  toggle.setAttribute('aria-checked', String(cat.enabled));
  toggle.setAttribute('aria-label', cat.name);
  toggle.innerHTML = `<span class="cookie-consent-toggle-label">${cat.enabled ? 'ON' : 'OFF'}</span>`;

  toggle.addEventListener('click', () => {
    cat.enabled = !cat.enabled;
    toggle.classList.toggle('is-on', cat.enabled);
    toggle.setAttribute('aria-checked', String(cat.enabled));
    toggle.querySelector('.cookie-consent-toggle-label').textContent = cat.enabled ? 'ON' : 'OFF';
  });

  return toggle;
}

function buildCategoryCard(cat) {
  const card = document.createElement('div');
  card.className = 'cookie-consent-category';

  const header = document.createElement('div');
  header.className = 'cookie-consent-category-header';
  const heading = document.createElement('h3');
  heading.textContent = cat.name;
  header.append(heading);
  if (!cat.isEssential) header.append(buildToggle(cat));

  const desc = document.createElement('div');
  desc.className = 'cookie-consent-category-desc';
  desc.innerHTML = cat.description;

  card.append(header, desc);
  return card;
}

function buildModal({ title, icon, intro, categories }) {
  const overlay = document.createElement('div');
  overlay.className = 'cookie-consent-overlay';
  overlay.hidden = true;

  const dialog = document.createElement('div');
  dialog.className = 'cookie-consent-dialog';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-label', title);

  const header = document.createElement('div');
  header.className = 'cookie-consent-header';
  if (icon) {
    const iconWrap = document.createElement('span');
    iconWrap.className = 'cookie-consent-icon';
    iconWrap.append(icon);
    header.append(iconWrap);
  }
  const titleEl = document.createElement('h2');
  titleEl.textContent = title;
  header.append(titleEl);

  const body = document.createElement('div');
  body.className = 'cookie-consent-body';
  const introEl = document.createElement('div');
  introEl.className = 'cookie-consent-intro';
  introEl.innerHTML = intro;
  body.append(introEl);

  const saved = getSavedPreferences();
  categoriesState = categories.map((cat, i) => ({
    ...cat,
    isEssential: i === 0, // first authored category is always mandatory
    enabled: i === 0 ? true : (saved?.[cat.name] ?? true),
  }));
  categoriesState.forEach((cat) => body.append(buildCategoryCard(cat)));

  const footer = document.createElement('div');
  footer.className = 'cookie-consent-footer';
  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'cookie-consent-save';
  saveBtn.textContent = 'SAVE';
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'cookie-consent-cancel';
  cancelBtn.textContent = 'CANCEL';
  footer.append(saveBtn, cancelBtn);

  dialog.append(header, body, footer);
  overlay.append(dialog);
  document.body.append(overlay);

  const close = () => {
    overlay.hidden = true;
    document.body.classList.remove('cookie-consent-open');
  };

  saveBtn.addEventListener('click', () => {
    const prefs = {};
    categoriesState.forEach((cat) => { prefs[cat.name] = cat.enabled; });
    savePreferences(prefs);
    close();
  });

  cancelBtn.addEventListener('click', close);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });

  return overlay;
}

let buildPromise = null;

function ensureModal(contentPath = DEFAULT_CONTENT_PATH) {
  if (modalEl) return Promise.resolve(modalEl);
  if (buildPromise) return buildPromise;

  buildPromise = loadFragment(contentPath).then((fragment) => {
    if (!fragment) return null;
    modalEl = buildModal(parseContent(fragment));
    return modalEl;
  });

  return buildPromise;
}

export async function openCookieConsentModal(contentPath) {
  const modal = await ensureModal(contentPath);
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add('cookie-consent-open');
  modal.querySelector('.cookie-consent-save')?.focus();
}

window.addEventListener('footer:open-cookie-consent', () => {
  openCookieConsentModal();
});

/**
 * If you'd rather place this as an actual EDS block somewhere (instead of
 * importing it once as a global utility in scripts.js), dropping an empty
 * "Cookie Consent" block on any page pre-warms the fragment fetch and
 * registers the listener. It renders nothing itself.
 */
export default async function decorate(block) {
  const contentPath = block.dataset.content || DEFAULT_CONTENT_PATH;
  block.textContent = '';
  ensureModal(contentPath);
}
