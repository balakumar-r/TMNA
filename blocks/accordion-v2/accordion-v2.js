const BLOCK = 'accordion-v2';

/**
 * loads and decorates the accordion
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // The last row can be an author config row (e.g. "icon" / "+-").
  // Detect it so it is not rendered as a panel.
  const configRow = rows[rows.length - 1];
  const isConfigRow = configRow
    && configRow.children[0]?.textContent.trim().toLowerCase() === 'icon';
  const panelRows = isConfigRow ? rows.slice(0, -1) : rows;

  block.classList.add(`${BLOCK}--decorated`);

  panelRows.forEach((row, index) => {
    const [titleCell, contentCell] = row.children;

    // --- item ---
    row.className = `${BLOCK}__item`;

    // --- header / trigger button ---
    const trigger = document.createElement('button');
    trigger.className = `${BLOCK}__trigger`;
    trigger.type = 'button';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', `${BLOCK}-panel-${index}`);
    trigger.id = `${BLOCK}-trigger-${index}`;

    const title = document.createElement('span');
    title.className = `${BLOCK}__title`;
    title.textContent = titleCell.textContent.trim();

    const icon = document.createElement('span');
    icon.className = `${BLOCK}__icon`;
    icon.setAttribute('aria-hidden', 'true');

    trigger.append(title, icon);

    // --- panel (collapsible content) ---
    const panel = document.createElement('div');
    panel.className = `${BLOCK}__panel`;
    panel.id = `${BLOCK}-panel-${index}`;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', trigger.id);
    panel.hidden = true;

    // --- content: turn the paragraphs of links into a BEM list ---
    const list = document.createElement('ul');
    list.className = `${BLOCK}__links`;

    contentCell.querySelectorAll('a').forEach((anchor) => {
      const li = document.createElement('li');
      li.className = `${BLOCK}__links-item`;
      anchor.classList.add(`${BLOCK}__link`);
      li.append(anchor);
      list.append(li);
    });

    panel.append(list);

    // rebuild the item
    row.replaceChildren(trigger, panel);

    // --- toggle behaviour ---
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
      row.classList.toggle(`${BLOCK}__item--open`, !expanded);
      row.classList.toggle('active', !expanded);
    });
  });

  if (isConfigRow) configRow.remove();
}
