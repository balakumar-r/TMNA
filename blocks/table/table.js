/*
 * Table Block
 */
import { getBlockConfig } from '../../scripts/utils/block-config.js';

// Labels used for authoring config rows (Brand / Class Name). These rows are
// read by getBlockConfig() and must NOT be rendered into the visible table.
const CONFIG_LABELS = ['brand', 'class name', 'classname', 'class'];

/**
 * A config row is a two-cell row whose first cell is a known config label
 * (e.g. "Brand" | "lexus", "Class Name" | "table-with-media").
 * @param {Element} row
 * @returns {boolean}
 */
function isConfigRow(row) {
  const cells = [...row.children];
  if (cells.length < 2) return false;
  const label = cells[0]?.textContent?.trim().toLowerCase();
  return CONFIG_LABELS.includes(label);
}

/**
 * Builds a header (<th>) or body (<td>) cell.
 * @param {number} rowIndex 0 = header cell, > 0 = body cell
 * @param {{ bem?: boolean }} [options] whether to add BEM cell classes
 * @returns {HTMLTableCellElement}
 */
function buildCell(rowIndex, { bem = false } = {}) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');

  if (bem) {
    const cellClass = rowIndex
      ? 'table__cell table__cell--body'
      : 'table__cell table__cell--header';
    cell.classList.add(...cellClass.split(' '));
  }

  return cell;
}

/**
 * Tags check (✓) and dash (—) cells so they can be styled distinctly.
 * @param {Element} cell
 */
function addSymbolClass(cell) {
  cell.querySelectorAll('p').forEach((paragraph) => {
    const content = paragraph.textContent.trim();

    if (content === '✓') {
      paragraph.classList.add('table__symbol', 'table__symbol--check');
    } else if (content === '—') {
      paragraph.classList.add('table__symbol', 'table__symbol--dash');
    }
  });
}

/**
 * Copies authored data-align / data-valign onto the rendered cell.
 * @param {Element} col source cell
 * @param {HTMLTableCellElement} cell rendered cell
 */
function applyAlignment(col, cell) {
  const align = col.getAttribute('data-align');
  const valign = col.getAttribute('data-valign');
  if (align) cell.style.textAlign = align;
  if (valign) cell.style.verticalAlign = valign;
}

/**
 * Default variation — "table-with-media": BEM classes, symbol tagging and
 * striped body rows.
 * @param {Element} block
 * @param {Element[]} contentRows
 */
function renderWithMedia(block, contentRows) {
  block.classList.add('table-block');

  const table = document.createElement('table');
  table.classList.add('table');

  const thead = document.createElement('thead');
  thead.classList.add('table__head');

  const tbody = document.createElement('tbody');
  tbody.classList.add('table__body');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  contentRows.forEach((child, i) => {
    const row = document.createElement('tr');

    if (header && i === 0) {
      row.classList.add('table__row', 'table__row--header');
      thead.append(row);
    } else {
      row.classList.add('table__row');
      // Striped modifier for alternating body rows.
      if ((header ? i - 1 : i) % 2 === 1) {
        row.classList.add('table__row--striped');
      }
      tbody.append(row);
    }

    [...child.children].forEach((col) => {
      const cell = buildCell(header ? i : i + 1, { bem: true });
      applyAlignment(col, cell);
      cell.innerHTML = col.innerHTML;
      addSymbolClass(cell);
      row.append(cell);
    });
  });

  block.innerHTML = '';
  block.append(table);
}

/**
 * "table-standard" variation — plain semantic table.
 * @param {Element} block
 * @param {Element[]} contentRows
 */
function renderStandard(block, contentRows) {
  const table = document.createElement('table');
  table.classList.add('table-standard__table');

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  const header = !block.classList.contains('no-header');
  if (header) table.append(thead);
  table.append(tbody);

  contentRows.forEach((child, i) => {
    const row = document.createElement('tr');

    if (header && i === 0) {
      thead.append(row);
    } else {
      tbody.append(row);
    }

    [...child.children].forEach((col) => {
      const cell = buildCell(header ? i : i + 1);
      applyAlignment(col, cell);
      cell.innerHTML = col.innerHTML;
      row.append(cell);
    });
  });

  block.innerHTML = '';
  block.append(table);
}

/**
 * Loads and decorates the table block, dispatching to the right variation.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // Reads Brand / Class Name authoring rows and applies `brand-<brand>` +
  // the class name to the block (data-brand is also set).
  getBlockConfig(block);

  // Only content rows are rendered — config rows (Brand / Class Name) are
  // dropped so their values never appear in the page.
  const contentRows = [...block.children].filter((child) => !isConfigRow(child));

  if (block.classList.contains('table-standard')) {
    renderStandard(block, contentRows);
  } else {
    renderWithMedia(block, contentRows);
  }
}
