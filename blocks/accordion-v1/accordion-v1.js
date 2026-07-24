export default function decorate(block) {
    block.classList.add('accordion-block');
  
    const wrapper = document.createElement('div');
    wrapper.className = 'accordion-v1';
  
    const allTriggers = [];
    const allPanels = [];
  
    [...block.children].forEach((row, idx) => {
      const item = document.createElement('div');
      item.className = 'accordion-v1-item';
  
      const headingEl = row.querySelector(':scope > *:first-child');
      const panelEl = document.createElement('div');
      panelEl.className = 'accordion-v1-panel';
      panelEl.setAttribute('role', 'region');
  
      const inner = document.createElement('div');
      inner.className = 'accordion-v1-panel-inner';
  
      let titleHTML = `Item ${idx + 1}`;
      if (headingEl) titleHTML = headingEl.innerHTML;
  
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'accordion-v1-trigger';
      trigger.setAttribute('aria-expanded', 'false');
  
      const id = `accordion-v1-${Math.random().toString(36).slice(2, 9)}`;
      trigger.setAttribute('aria-controls', `${id}-panel`);
      panelEl.id = `${id}-panel`;
  
      const titleSpan = document.createElement('span');
      titleSpan.className = 'accordion-v1-trigger-text';
      titleSpan.innerHTML = titleHTML;
      trigger.appendChild(titleSpan);
  
      let moved = false;
      [...row.children].forEach((c, i) => {
        if (i === 0) return;
        inner.appendChild(c.cloneNode(true));
        moved = true;
      });
  
      if (!moved && headingEl && headingEl.nextElementSibling) {
        inner.appendChild(headingEl.nextElementSibling.cloneNode(true));
      }
  
      panelEl.appendChild(inner);
  
      function closePanel(t, p) {
        t.setAttribute('aria-expanded', 'false');
        p.style.maxHeight = '0px';
        p.addEventListener('transitionend', function hide() {
          p.hidden = true;
          p.removeEventListener('transitionend', hide);
        });
      }
  
      function openPanel(t, p) {
        t.setAttribute('aria-expanded', 'true');
        p.hidden = false;
        p.style.maxHeight = '0px';
        requestAnimationFrame(() => {
          p.style.maxHeight = `${p.scrollHeight}px`;
        });
      }
  
      trigger.addEventListener('click', (e) => {
        // Only respond if the click happened on the text itself
        if (!titleSpan.contains(e.target)) {
          return;
        }
  
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  
        allTriggers.forEach((t, i) => {
          if (t !== trigger) {
            closePanel(t, allPanels[i]);
          }
        });
  
        if (isOpen) {
          closePanel(trigger, panelEl);
        } else {
          openPanel(trigger, panelEl);
        }
      });
  
      panelEl.hidden = true;
      panelEl.style.maxHeight = '0px';
  
      allTriggers.push(trigger);
      allPanels.push(panelEl);
  
      item.append(trigger, panelEl);
      wrapper.append(item);
    });
  
    block.replaceChildren(wrapper);
  }