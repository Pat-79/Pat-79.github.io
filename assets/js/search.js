class SearchEngine {
  constructor() {
    this.index = Object.create(null);
    this.loaded = false;
  }

  async load(version) {
    if (this.loaded) return;

    const STORAGE_KEY = 'searchData';
    const VERSION_KEY = 'searchDataVersion';
    const TIME_KEY = 'searchDataTime';
    const TTL = 1000 * 60 * 60 * 24;

    const cachedVersion = localStorage.getItem(VERSION_KEY);
    const cachedData = localStorage.getItem(STORAGE_KEY);
    const cachedTime = localStorage.getItem(TIME_KEY);

    const isExpired = !cachedTime || (Date.now() - cachedTime > TTL);

    let data;

    if (cachedData && cachedVersion === version && !isExpired) {
      data = JSON.parse(cachedData);
    } else {
      const res = await fetch(`/assets/data/search-data.json?v=${version}`, {
        cache: 'no-cache'
      });
      data = await res.json();

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(VERSION_KEY, version);
        localStorage.setItem(TIME_KEY, Date.now());
      } catch (e) {}
    }

    data.forEach(entry => {
      const w = entry.word;
      if (typeof w !== 'string' || !w) return;
      const title = typeof entry.title === 'string' ? entry.title : '';
      const excerpt = typeof entry.excerpt === 'string' ? entry.excerpt : '';
      if (!this.index[w]) this.index[w] = [];
      if (!this.index[w].some(e => e.url === entry.url)) {
        this.index[w].push({ url: entry.url, title, excerpt });
      }
    });

    this.loaded = true;
  }

  search(query) {
    if (!query) return [];

    const terms = [...new Set(
      query
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    )];
    if (!terms.length) return [];

    const results = Object.create(null);

    for (const term of terms) {
      for (const word in this.index) {
        const exactWord = word === term;
        const prefixWord = !exactWord && word.startsWith(term);
        if (!exactWord && !prefixWord) continue;

        for (const entry of this.index[word]) {
          if (!results[entry.url]) {
            results[entry.url] = {
              ...entry,
              score: 0,
              matchedTerms: Object.create(null)
            };
          }

          const title = (entry.title || '').toLowerCase();
          const excerpt = (entry.excerpt || '').toLowerCase();
          const titleExact = title === term;
          const titlePrefix = !titleExact && title.startsWith(term);
          const titleContains = !titleExact && !titlePrefix && title.includes(term);
          const excerptContains = excerpt.includes(term);

          if (exactWord) results[entry.url].score += 40;
          if (prefixWord) results[entry.url].score += 14;
          if (titleExact) results[entry.url].score += 30;
          if (titlePrefix) results[entry.url].score += 16;
          if (titleContains) results[entry.url].score += 8;
          if (excerptContains) results[entry.url].score += 4;

          results[entry.url].matchedTerms[term] = true;
        }
      }
    }

    return Object.values(results)
      .map(result => {
        const matchCount = Object.keys(result.matchedTerms).length;
        const allTermsMatched = matchCount === terms.length;
        const titleLengthPenalty = Math.min((result.title || '').length / 120, 1);

        result.score += matchCount * 24;
        if (allTermsMatched) result.score += 45;
        result.score -= titleLengthPenalty;
        delete result.matchedTerms;

        return result;
      })
      .sort((a,b)=>b.score-a.score);
  }
}

function debounce(fn, d=120){
  let t;
  return (...args)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...args),d);
  };
}

export { SearchEngine, debounce };
