import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const VARIANTS = [
	'footer-brand',
	'footer-default',
	'footer-media',
	'footer-pref',
	'footer-privacy',
	'footer-privacydefault',
];

const CONTENT_PATHS = {
	'footer-brand': '/footer/footer-brand',
	'footer-default': '/footer/footer-default',
	'footer-media': '/footer/footer-media',
	'footer-pref': '/footer/footer-pref',
	'footer-privacy': '/footer/footer-privacy',
	'footer-privacydefault': '/footer/footer-privacydefault',
};

function variantFromClasses(el) {
	return VARIANTS.find((variant) => el.classList.contains(variant)
		|| el.classList.contains(variant.slice('footer-'.length))) || null;
}

function pageVariant(block) {
	return variantFromClasses(block)
		|| VARIANTS.find((variant) => block.closest(`.${variant}-container`))
		|| null;
}

function hasContent(el) {
	return [...el.children]
		.some((row) => row.textContent.trim() || row.querySelector('picture, img'));
}

const footerDocs = new Map();

function loadFooterDoc(path) {
	if (!footerDocs.has(path)) footerDocs.set(path, loadFragment(path));
	return footerDocs.get(path);
}

function getFooterVariationClass(block) {
	return [...block.classList].find((className) => (
		className !== 'footer-unified'
		&& className.startsWith('footer-')
		&& !className.endsWith('-container')
	)) || '';
}

/**
 * Decorates footer brand block.
 *
 * @param {Element} block
 */
function decorateFooterBrand(block) {
	const wrapper = document.createElement('div');
	wrapper.className = 'footer-brand-content';

	[...block.children].forEach((row) => {
		const cells = [...row.children];
		const picture = row.querySelector('picture');
		const links = [...row.querySelectorAll('a')];
		const text = row.textContent.trim();

		// Logo + wordmark row
		if (picture) {
			const logoRow = document.createElement('div');
			logoRow.className = 'footer-brand-logo-row';

			const iconCell = cells.find((cell) => cell.querySelector('picture'));
			const wordmarkCell = cells.find((cell) => cell !== iconCell);

			if (iconCell) {
				iconCell.classList.add('footer-brand-icon');
				logoRow.append(iconCell);
			}

			if (wordmarkCell) {
				wordmarkCell.classList.add('footer-brand-wordmark');
				logoRow.append(wordmarkCell);
			}

			wrapper.append(logoRow);
			return;
		}

		// Links row
		if (links.length) {
			const linksRow = document.createElement('div');
			linksRow.className = 'footer-brand-links';

			links.forEach((link, index) => {
				link.classList.add('footer-brand-link');
				linksRow.append(link);

				if (index < links.length - 1) {
					const separator = document.createElement('span');
					separator.className = 'footer-brand-sep';
					separator.setAttribute('aria-hidden', 'true');
					separator.textContent = '|';
					linksRow.append(separator);
				}
			});

			wrapper.append(linksRow);
			return;
		}

		// Copyright row
		if (text.includes('©')) {
			const paragraph = document.createElement('p');
			paragraph.className = 'footer-brand-copyright';
			paragraph.textContent = text;
			wrapper.append(paragraph);
			return;
		}

		// Disclaimer row
		if (text) {
			const paragraph = document.createElement('p');
			paragraph.className = 'footer-brand-disclaimer';
			paragraph.textContent = text;
			wrapper.append(paragraph);
		}
	});

	block.replaceChildren(wrapper);
}

/**
 * Decorates footer preference block.
 *
 * Expected block class:
 * footer-pref
 *
 * Generated classes:
 * footer-pref-bar
 * footer-pref-bar-left
 * footer-pref-bar-right
 * footer-pref-nav-link
 * footer-pref-sep
 * footer-pref-privacy-link
 * footer-pref-cookie-link
 * footer-pref-copyright
 * footer-pref-copy-line
 *
 * @param {Element} block
 */
function decorateFooterPref(block) {
	const rows = [...block.children];

	if (!rows.length) {
		return;
	}

	const barLeft = document.createElement('div');
	barLeft.className = 'footer-pref-bar-left';

	const barRight = document.createElement('div');
	barRight.className = 'footer-pref-bar-right';

	const copyright = document.createElement('div');
	copyright.className = 'footer-pref-copyright';

	const leftLinksAll = [];
	const rightItemsAll = [];

	rows.forEach((row) => {
		const cells = [...row.children];
		const [colA, colB] = cells;
		const colAHasLink = colA && colA.querySelector('a');

		if (colAHasLink) {
			// Left links
			colA.querySelectorAll('a').forEach((link) => {
				leftLinksAll.push(link);
			});

			// Right items
			if (colB) {
				const lines = colB.querySelectorAll('p');
				const items = lines.length ? [...lines] : [colB];

				items.forEach((item) => {
					const link = item.tagName === 'A' ? item : item.querySelector('a');

					if (link) {
						rightItemsAll.push({
							text: link.textContent.trim(),
							href: link.href,
						});
					} else {
						const text = item.textContent.trim();

						if (text) {
							rightItemsAll.push({
								text,
								href: null,
							});
						}
					}
				});
			}
		} else {
			// Copyright row
			const text = row.textContent.trim();

			if (text) {
				const paragraph = document.createElement('p');
				paragraph.className = 'footer-pref-copy-line';
				paragraph.textContent = text;
				copyright.append(paragraph);
			}
		}
	});

	// Build left nav links with pipe separators
	leftLinksAll.forEach((originalLink, index) => {
		const link = document.createElement('a');
		link.href = originalLink.href;
		link.textContent = originalLink.textContent.trim();
		link.className = 'footer-pref-nav-link';

		if (originalLink.target) {
			link.target = originalLink.target;
		}

		if (originalLink.rel) {
			link.rel = originalLink.rel;
		}

		barLeft.append(link);

		if (index < leftLinksAll.length - 1) {
			const separator = document.createElement('span');
			separator.className = 'footer-pref-sep';
			separator.setAttribute('aria-hidden', 'true');
			separator.textContent = '|';
			barLeft.append(separator);
		}
	});

	// Build right preference items
	rightItemsAll.forEach(({ text, href }, index) => {
		if (index === 0) {
			const link = document.createElement('a');
			link.href = href || '#';
			link.textContent = text;
			link.className = 'footer-pref-privacy-link';
			barRight.append(link);
			return;
		}

		if (href) {
			const link = document.createElement('a');
			link.href = href;
			link.textContent = text;
			link.className = 'footer-pref-cookie-link';
			barRight.append(link);
			return;
		}

		const span = document.createElement('span');
		span.textContent = text;
		span.className = 'footer-pref-cookie-link';
		barRight.append(span);
	});

	const bar = document.createElement('div');
	bar.className = 'footer-pref-bar';
	bar.append(barLeft, barRight);

	block.textContent = '';
	block.append(bar, copyright);
}

/**
 * Decorates one footer privacy variation block.
 * Example:
 * footer-privacy
 * footer-privacydefault
 *
 * @param {Element} footerBlock
 */
function decorateFooterPrivacyVariation(footerBlock) {
	const blockClass = getFooterVariationClass(footerBlock);

	if (!blockClass) {
		return;
	}

	const section = footerBlock.closest('.section');

	if (section) {
		section.classList.add(`${blockClass}__inner`);
	}

	const content = footerBlock.querySelector(':scope > div > div') || footerBlock;

	const privacy = content.querySelector('.button-wrapper');

	if (privacy) {
		privacy.classList.add(`${blockClass}__privacy`);

		const privacyLink = privacy.querySelector('a');

		if (privacyLink) {
			privacyLink.classList.add(`${blockClass}__privacy-link`);
		}

		const privacyIcon = privacy.querySelector('picture');

		if (privacyIcon) {
			privacyIcon.classList.add(`${blockClass}__privacy-icon`);
		}
	}

	const nav = content.querySelector('ul');

	if (nav) {
		nav.classList.add(`${blockClass}__nav`);

		nav.querySelectorAll(':scope > li').forEach((item) => {
			item.classList.add(`${blockClass}__nav-item`);

			const link = item.querySelector('a');

			if (link) {
				link.classList.add(`${blockClass}__nav-link`);
			}
		});
	}

	let cookie = null;

	content.querySelectorAll(':scope > p').forEach((paragraph) => {
		if (paragraph.classList.contains(`${blockClass}__privacy`)) {
			return;
		}

		const link = paragraph.querySelector('a');

		if (link) {
			paragraph.classList.add(`${blockClass}__cookie`);
			link.classList.add(`${blockClass}__cookie-link`);
			cookie = paragraph;
		} else {
			paragraph.classList.add(`${blockClass}__copyright`);
		}
	});

	if (nav || cookie) {
		const linksRow = document.createElement('div');
		linksRow.className = `${blockClass}__links`;

		(nav || cookie).replaceWith(linksRow);

		if (nav) {
			linksRow.append(nav);
		}

		if (cookie) {
			linksRow.append(cookie);
		}
	}
}

/**
 * Decorates footer blocks based on variation class.
 *
 * @param {Element} footerBlock
 */
function decorateFooterBlock(footerBlock) {
	const blockClass = getFooterVariationClass(footerBlock);

	if (!blockClass) {
		return;
	}

	if (blockClass === 'footer-brand') {
		decorateFooterBrand(footerBlock);
		return;
	}

	if (blockClass === 'footer-pref') {
		decorateFooterPref(footerBlock);
		return;
	}

	if (blockClass === 'footer-privacy' || blockClass === 'footer-privacydefault') {
		decorateFooterPrivacyVariation(footerBlock);
	}
}

async function resolveFooter(block, footerPath) {
	const onPage = pageVariant(block);
	if (onPage) {
		if (hasContent(block)) {
			return { variant: onPage, content: block };
		}
		if (CONTENT_PATHS[onPage]) {
			const variantDoc = await loadFooterDoc(CONTENT_PATHS[onPage]);
			if (variantDoc) return { variant: onPage, content: variantDoc };
		}
	}

	const footerDoc = await loadFooterDoc(footerPath);
	const declaration = footerDoc?.querySelector('.footer-unified');
	if (!declaration) {
		return { variant: 'footer', content: footerDoc };
	}

	const variant = variantFromClasses(declaration) || 'footer';
	if (hasContent(declaration)) {
		return { variant, content: declaration };
	}

	if (CONTENT_PATHS[variant]) {
		const variantDoc = await loadFooterDoc(CONTENT_PATHS[variant]);
		if (variantDoc) return { variant, content: variantDoc };
	}

	return { variant, content: footerDoc };
}

/**
 * Loads and decorates the footer.
 *
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
	const footerMeta = getMetadata('footer');

	const footerPath = footerMeta
		? new URL(footerMeta, window.location).pathname
		: '/footer';

	const { content } = await resolveFooter(block, footerPath);
	if (!content) return;

	if (content !== block) {
		block.textContent = '';
		const footer = document.createElement('div');
		while (content.firstElementChild) {
			footer.append(content.firstElementChild);
		}
		block.append(footer);
	}

	const footerBlocks = [...block.querySelectorAll('.columns.block[class*="footer-"]')];
	if (getFooterVariationClass(block)) footerBlocks.unshift(block);

	footerBlocks.forEach((footerBlock) => {
		decorateFooterBlock(footerBlock);
	});
}
