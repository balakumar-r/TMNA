const SELECTORS = {
  trigger: '.select-vehicle-trigger',
  triggerText: '.select-vehicle-trigger .columns p',
};

function normalizeKey(key) {
  return key
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '');
}

function getBlockData(block) {
  const data = {};

  [...block.children].forEach((row) => {
    const cells = [...row.children];

    if (cells.length < 2) return;

    const rawKey = cells[0].textContent.trim();
    const key = normalizeKey(rawKey);
    const valueCell = cells[1];

    if (!key) return;

    if (key === 'heroimage') {
      const img = valueCell.querySelector('img');
      data.heroImage = img ? img.src : valueCell.textContent.trim();
      return;
    }

    if (key === 'herotitle') {
      data.heroTitle = valueCell.textContent.trim();
      return;
    }

    if (key === 'herodescription') {
      data.heroDescription = valueCell.textContent.trim();
      return;
    }

    if (key === 'signintext') {
      data.signInText = valueCell.textContent.trim();
      return;
    }

    if (key === 'signinlink') {
      data.signInLink = valueCell.textContent.trim();
      return;
    }

    if (key === 'jointext') {
      data.joinText = valueCell.textContent.trim();
      return;
    }

    if (key === 'joinlink') {
      data.joinLink = valueCell.textContent.trim();
      return;
    }

    if (key === 'formtitle') {
      data.formTitle = valueCell.textContent.trim();
      return;
    }

    if (key === 'formdescription') {
      data.formDescription = valueCell.textContent.trim();
      return;
    }

    if (key === 'years') {
      data.years = valueCell.textContent.trim();
      return;
    }

    if (key === 'models') {
      data.models = valueCell.innerText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
      return;
    }

    if (key === 'checkboxlabel') {
      data.checkboxLabel = valueCell.textContent.trim();
      return;
    }

    if (key === 'continuelabel') {
      data.continueLabel = valueCell.textContent.trim();
    }
  });

  return data;
}

function parseModels(modelRows = []) {
  const modelMap = {};

  modelRows.forEach((row) => {
    const parts = row.split(':');

    if (parts.length < 2) return;

    const year = parts[0].trim();
    const modelsText = parts.slice(1).join(':').trim();

    if (!year || !modelsText) return;

    modelMap[year] = modelsText
      .split(',')
      .map((model) => model.trim())
      .filter(Boolean);
  });

  return modelMap;
}

function createOption(value, text, disabled = false, selected = false) {
  const option = document.createElement('option');

  option.value = value;
  option.textContent = text;

  if (disabled) option.disabled = true;
  if (selected) option.selected = true;

  return option;
}

function lockBodyScroll(isLocked) {
  document.body.classList.toggle('select-vehicle-modal-open', isLocked);
}

function setSubmitState(submitButton, yearSelect, modelSelect) {
  const isValid = yearSelect.value && modelSelect.value;

  submitButton.disabled = !isValid;
  submitButton.classList.toggle('disabled', !isValid);
  submitButton.setAttribute('aria-disabled', String(!isValid));
}

function openModal(modal) {
  modal.hidden = false;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  lockBodyScroll(true);

  const closeButton = modal.querySelector('.select-vehicle-modal__close');

  window.setTimeout(() => {
    closeButton?.focus();
  }, 50);
}

function closeModal(modal) {
  const trigger = document.querySelector(SELECTORS.trigger);

  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  lockBodyScroll(false);

  window.setTimeout(() => {
    modal.hidden = true;
    trigger?.focus();
  }, 200);
}

function updateTriggerText(modelName, yearValue) {
  const trigger = document.querySelector(SELECTORS.trigger);
  const triggerText = document.querySelector(SELECTORS.triggerText);

  if (!modelName) return;

  if (triggerText) {
    triggerText.textContent = modelName;
  }

  if (trigger) {
    trigger.classList.add('has-selected-vehicle');
    trigger.setAttribute('data-selected-year', yearValue);
    trigger.setAttribute('data-selected-model', modelName);
  }
}

function buildModal(block, data) {
  const years = (data.years || '')
    .split(',')
    .map((year) => year.trim())
    .filter(Boolean);

  const modelMap = parseModels(data.models);

  console.log('Select vehicle years:', years);
  console.log('Select vehicle models:', modelMap);

  const heroTitle = data.heroTitle || 'Join The Toyota Family';
  const heroDescription = data.heroDescription || '';
  const signInText = data.signInText || 'Sign In';
  const signInLink = data.signInLink || '#signin';
  const joinText = data.joinText || 'Join Now';
  const joinLink = data.joinLink || '/owners/register';
  const formTitle = data.formTitle || 'Select a vehicle';
  const formDescription =
    data.formDescription ||
    'Choose your Toyota or Scion model to make your experience more personalized.';
  const checkboxLabel =
    data.checkboxLabel || 'Use this info to help me create an account.';
  const continueLabel = data.continueLabel || 'Continue';

  const modal = document.createElement('div');

  modal.className = 'select-vehicle-popup';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-hidden', 'true');
  modal.setAttribute('aria-labelledby', 'select-vehicle-modal-title');

  modal.innerHTML = `
    <div class="select-vehicle-modal__overlay" data-modal-close></div>

    <div class="select-vehicle-modal__dialog">
      <button
        class="select-vehicle-modal__close"
        type="button"
        aria-label="Close select vehicle popup"
        data-modal-close
      >
        <span aria-hidden="true">×</span>
      </button>

      <div class="select-vehicle-modal__content">
        <div class="select-vehicle-modal__hero">
          <div class="select-vehicle-modal__hero-content">
            <h2 class="select-vehicle-modal__hero-title">${heroTitle}</h2>
            <p class="select-vehicle-modal__hero-description">${heroDescription}</p>

            <div class="select-vehicle-modal__hero-ctas">
            <a class="select-vehicle-signin" href="${signInLink}">
                ${signInText}
              </a>
            <a class="select-vehicle-join" href="${joinLink}">
                ${joinText}
              </a>
            </div>
          </div>
        </div>

        <form class="select-vehicle-modal__form" novalidate>
          <div class="select-vehicle-modal__form-header">
            <h3 id="select-vehicle-modal-title" class="select-vehicle-modal__form-title">
              ${formTitle}
            </h3>

            <p class="select-vehicle-modal__form-description">
              ${formDescription}
            </p>
          </div>

          <div class="select-vehicle-modal__field-row">
            <div class="select-vehicle-modal__field">
              <label class="select-vehicle-modal__label" for="select-vehicle-year">
                Year
                <span aria-hidden="true">*</span>
                <span class="select-vehicle-modal__required">*Required</span>
              </label>

              <div class="select-vehicle-modal__select">
                <select id="select-vehicle-year" name="year" required>
                  <option value="" disabled selected>Select a year</option>
                </select>
              </div>
            </div>

            <div class="select-vehicle-modal__field">
              <label class="select-vehicle-modal__label" for="select-vehicle-model">
                Model
                <span aria-hidden="true">*</span>
                <span class="select-vehicle-modal__required">*Required</span>
              </label>

              <div class="select-vehicle-modal__select is-disabled">
                <select id="select-vehicle-model" name="model" required disabled>
                  <option value="" disabled selected>Select a model</option>
                </select>
              </div>
            </div>
          </div>

          <div class="select-vehicle-modal__options">
            <label class="select-vehicle-modal__checkbox">
              <input type="checkbox" name="addvehicle">
              <span>${checkboxLabel}</span>
            </label>
          </div>

          <div class="select-vehicle-modal__footer">
            <button
              class="select-vehicle-modal__submit disabled"
              type="submit"
              disabled
              aria-disabled="true"
            >
              ${continueLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  if (data.heroImage) {
    const hero = modal.querySelector('.select-vehicle-modal__hero');

    hero.style.backgroundImage = `url("${data.heroImage}")`;
    
  }

  const yearSelect = modal.querySelector('#select-vehicle-year');
  const modelSelect = modal.querySelector('#select-vehicle-model');
  const modelSelectWrap = modelSelect.closest('.select-vehicle-modal__select');
  const submitButton = modal.querySelector('.select-vehicle-modal__submit');
  const form = modal.querySelector('.select-vehicle-modal__form');

  const addVehicleCheckbox = modal.querySelector(
  'input[name="addvehicle"]'
);

addVehicleCheckbox?.addEventListener('change', () => {
  submitButton.textContent = addVehicleCheckbox.checked
    ? 'Create Account'
    : continueLabel;
});

  years.forEach((year) => {
    yearSelect.append(createOption(year, year));
  });

  yearSelect.addEventListener('change', () => {
    const selectedYear = yearSelect.value;
    const models = modelMap[selectedYear] || [];

    console.log('Selected year:', selectedYear);
    console.log('Models for selected year:', models);

    modelSelect.innerHTML = '';
    modelSelect.append(createOption('', 'Select a model', true, true));

    models.forEach((model) => {
      modelSelect.append(createOption(model, model));
    });

    modelSelect.disabled = models.length === 0;
    modelSelectWrap.classList.toggle('is-disabled', models.length === 0);

    setSubmitState(submitButton, yearSelect, modelSelect);
  });

  modelSelect.addEventListener('change', () => {
    setSubmitState(submitButton, yearSelect, modelSelect);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!yearSelect.value || !modelSelect.value) {
      setSubmitState(submitButton, yearSelect, modelSelect);
      return;
    }

    updateTriggerText(modelSelect.value, yearSelect.value);
    closeModal(modal);
  });

  modal.addEventListener('click', (event) => {
    const closeButton = event.target.closest('[data-modal-close]');

    if (!closeButton) return;

    closeModal(modal);
  });

  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(modal);
    }
  });

  block.replaceChildren(modal);

  return modal;
}

function bindTrigger(modal) {
  const trigger = document.querySelector(SELECTORS.trigger);

  console.log('Select vehicle trigger:', trigger);

  if (!trigger) return;

  trigger.setAttribute('role', 'button');
  trigger.setAttribute('tabindex', '0');
  trigger.style.cursor = 'pointer';

  trigger.addEventListener('click', (event) => {
    event.preventDefault();

    console.log('Select vehicle trigger clicked');

    openModal(modal);
  });

  trigger.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    openModal(modal);
  });
}

export default function decorate(block) {
  const data = getBlockData(block);

  console.log('Select vehicle block data:', data);

  const modal = buildModal(block, data);

  bindTrigger(modal);
}