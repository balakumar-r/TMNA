
function buildCell(rowIndex) {
  const cell = rowIndex ? document.createElement('td') : document.createElement('th');
  if (!rowIndex) cell.setAttribute('scope', 'col');

  // Add BEM classes
  const cellClass = rowIndex ? 'table__cell table__cell--body' : 'table__cell table__cell--header';
  cell.classList.add(...cellClass.split(' '));

  return cell;
}

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

export default async function decorate(block) {
  // Add BEM class to block
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

  [...block.children].forEach((child, i) => {
    const row = document.createElement('tr');
    
    // Add BEM row class
    if (header && i === 0) {
      row.classList.add('table__row', 'table__row--header');
      thead.append(row);
    } else {
      row.classList.add('table__row');
      // Add striped modifier for alternating rows
      if ((header ? i - 1 : i) % 2 === 1) {
        row.classList.add('table__row--striped');
      }
      tbody.append(row);
    }
    
    [...child.children].forEach((col) => {
      const cell = buildCell(header ? i : i + 1);
      cell.innerHTML = col.innerHTML;
      addSymbolClass(cell);
      row.append(cell);
    });
  });
  
  block.innerHTML = '';
  block.append(table);
}
