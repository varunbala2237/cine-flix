const BASE_URL = "https://graphql.anilist.co";

// Helpers
function tokenize(title = '') {
  return title.toLowerCase().split(/[\s:.\-_/]+/).filter(Boolean);
}

function looseTitleMatch(tmdbTitle, eng, romaji) {
  const tmdbTokens = new Set(tokenize(tmdbTitle));
  const candidates = [eng, romaji].filter(Boolean);
  return candidates.some(title => {
    const aniTokens = tokenize(title);
    return tmdbTokens.some(token => aniTokens.includes(token));
  });
}

function getTitleTokenOverlap(tmdbTokens, eng, romaji) {
  const candidates = [eng, romaji].filter(Boolean);
  let best = 0;
  for (const title of candidates) {
    const aniTokens = new Set(tokenize(title));
    const shared = [...tmdbTokens].filter(t => aniTokens.has(t));
    best = Math.max(best, shared.length / tmdbTokens.size);
  }
  return best;
}

function toFullDate({ year, month, day } = {}) {
  if (!year || !month || !day) return null;
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}


// Main function
export async function fetchAnimeMedia(media) {
  if (!media?.title || !(media.release_date)) {
    return { animeMedia: null, initialIndex: 0 };
  }

  const tmdbTitle = media.title;
  const tmdbDateStr = media.release_date;

  const query = `
    query ($search: String) {
      Page(perPage: 50) {
        media(search: $search, type: ANIME) {
          id
          title { english romaji native }
          startDate { year month day }
          format
          episodes
          relations {
            edges {
              relationType(version: 2)
              node {
                id
                title { english romaji native }
                startDate { year month day }
                format
                episodes
                relations {
                  edges {
                    relationType(version: 2)
                    node {
                      id
                      title { english romaji native }
                      startDate { year month day }
                      format
                      episodes
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = { search: tmdbTitle };

  let result;
  try {
    const resp = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const json = await resp.json();
    if (json.errors) return { animeMedia: null, initialIndex: 0 };
    result = json.data.Page.media;
  } catch {
    return { animeMedia: null, initialIndex: 0 };
  }

  if (!Array.isArray(result) || result.length === 0) {
    return { animeMedia: null, initialIndex: 0 };
  }

  // Filter matches
  const tmdbTokens = new Set(tokenize(tmdbTitle));
  const tmdbMonth = tmdbDateStr.slice(0, 7);

  const matches = result.filter(mediaItem => {
    const aniDateFull = toFullDate(mediaItem.startDate);
    const aniMonth = aniDateFull?.slice(0, 7);
    const titleMatch = looseTitleMatch(tmdbTitle, mediaItem.title.english, mediaItem.title.romaji);
    const overlap = getTitleTokenOverlap(tmdbTokens, mediaItem.title.english, mediaItem.title.romaji);
    return titleMatch && aniMonth === tmdbMonth && overlap >= 0.4;
  });

  // Choose relevant
  const relevant = matches.length > 0 ? matches : result;

  // Relation extraction
  const visited = new Set();
  const queue = [...relevant];
  const collected = [];

  const ALLOWED_FORMATS = new Set(['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL']);
  const VALID_REL_TYPES = new Set([
    'PREQUEL','SEQUEL','PARENT','SIDE_STORY','ALTERNATIVE_VERSION','COMPILATION','SUMMARY','OTHER'
  ]);

  while (queue.length) {
    const cur = queue.shift();
    if (!cur || visited.has(cur.id)) continue;
    visited.add(cur.id);
    collected.push(cur);

    const edges = cur.relations?.edges || [];
    for (const edge of edges) {
      const node = edge.node;
      if (node && ALLOWED_FORMATS.has(node.format) && VALID_REL_TYPES.has(edge.relationType)) {
        queue.push(node);
      }
    }
  }

  // Sort chronological
  collected.sort((a, b) => {
    const da = new Date(toFullDate(a.startDate) || '2100-01-01');
    const db = new Date(toFullDate(b.startDate) || '2100-01-01');
    return da - db;
  });

  const animeMedia = collected;

  // Initial index detection
  const mediaDate = new Date(tmdbDateStr);
  mediaDate.setHours(0,0,0,0);

  let selectedIndex = animeMedia.findIndex(entry => {
    const d = entry.startDate;
    if (!d?.year || !d?.month || !d?.day) return false;
    const entryDate = new Date(d.year, d.month - 1, d.day);
    entryDate.setHours(0,0,0,0);
    return entryDate.getTime() === mediaDate.getTime();
  });

  if (selectedIndex === -1) {
    selectedIndex = animeMedia.findIndex(entry => {
      const d = entry.startDate;
      if (!d?.year || !d?.month) return false;
      return (
        d.year === mediaDate.getFullYear() &&
        d.month === mediaDate.getMonth() + 1
      );
    });
  }

  if (selectedIndex === -1) {
    let closest = -1;
    let minDiff = Infinity;
    animeMedia.forEach((entry, idx) => {
      const d = entry.startDate;
      if (!d?.year || !d?.month || !d?.day) return;
      const entryDate = new Date(d.year, d.month - 1, d.day);
      entryDate.setHours(0,0,0,0);
      const diff = Math.abs(entryDate.getTime() - mediaDate.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = idx;
      }
    });
    selectedIndex = closest !== -1 ? closest : 0;
  }

  const initialIndex = selectedIndex;

  return { animeMedia, initialIndex };
}
