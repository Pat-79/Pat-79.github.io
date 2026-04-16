import { SearchEngine, debounce } from '/assets/js/search.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
  const safeText = escapeHtml(text || '');
  const terms = [...new Set((query || '').trim().split(/\s+/).filter(Boolean))]
    .sort((a, b) => b.length - a.length);

  if (!terms.length) return safeText;

  const pattern = terms.map(escapeRegExp).join('|');
  if (!pattern) return safeText;

  return safeText.replace(new RegExp(`(${pattern})`, 'ig'), '<mark>$1</mark>');
}

function toBool(value) {
  return value !== 'false';
}

function initSearchWidget(widget) {
  const input = widget.querySelector('[data-search-input]');
  const resultsBox = widget.querySelector('[data-search-results]');
  if (!input || !resultsBox) return;

  const limit = Number(widget.dataset.searchLimit || 8);
  const version = widget.dataset.searchVersion || '';
  const syncQuery = toBool(widget.dataset.searchSyncQuery || 'true');

  const engine = new SearchEngine();
  let results = [];
  let active = -1;

  function updateActiveClass() {
    resultsBox.querySelectorAll('.search-widget__item').forEach((element, index) => {
      element.classList.toggle('is-active', index === active);
    });
  }

  function render(nextResults) {
    results = nextResults;
    active = -1;

    const query = input.value;
    const rows = nextResults.slice(0, limit).map((entry) => {
      return `<li class="search-widget__item" data-url="${entry.url}">
        <div class="search-widget__title">${highlightText(entry.title || 'Untitled', query)}</div>
        <div class="search-widget__url">${escapeHtml(entry.url || '')}</div>
        <div class="search-widget__excerpt">${highlightText(entry.excerpt || '', query)}</div>
      </li>`;
    });

    resultsBox.innerHTML = rows.join('');

    if (typeof window.afhWrapFlagGlyphs === 'function') {
      window.afhWrapFlagGlyphs(resultsBox);
    }
  }

  const run = debounce(async (value) => {
    const query = (value || '').trim();

    if (!query) {
      resultsBox.innerHTML = '';

      if (syncQuery) {
        const url = new URL(window.location);
        url.searchParams.delete('q');
        window.history.replaceState({}, '', url);
      }

      return;
    }

    await engine.load(version);

    render(engine.search(query));

    if (syncQuery) {
      const url = new URL(window.location);
      url.searchParams.set('q', query);
      window.history.replaceState({}, '', url);
    }
  }, 120);

  input.addEventListener('input', (event) => {
    run(event.target.value);
  });

  input.addEventListener('keydown', (event) => {
    if (!results.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      active = Math.min(active + 1, Math.min(results.length, limit) - 1);
      updateActiveClass();
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      active = Math.max(active - 1, 0);
      updateActiveClass();
      return;
    }

    if (event.key === 'Enter' && active >= 0) {
      event.preventDefault();
      window.location = results[active].url;
    }
  });

  resultsBox.addEventListener('click', (event) => {
    const item = event.target.closest('.search-widget__item');
    if (!item) return;
    window.location = item.dataset.url;
  });

  const queryParam = new URLSearchParams(window.location.search).get('q');
  if (queryParam) {
    input.value = queryParam;
    run(queryParam);
  }
}

document.querySelectorAll('[data-search-widget]').forEach((widget) => {
  initSearchWidget(widget);
});