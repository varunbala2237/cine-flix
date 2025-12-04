import {
  matchAllRelatedAniMedia,
  extractChronologicalRelationRecursive
} from '../utils/animeUtils';

const BASE_URL = import.meta.env.VITE_ANILIST_BASE;

export async function fetchAnimeMedia(media) {
  if (!media) return null;

  const tmdbTitle = media.title;
  const tmdbDate = media.release_date || '';

  const query = {
    query: `
      query ($search: String) {
        Page(perPage: 50) {
          media(search: $search, type: ANIME) {
            id
            title { english romaji }
            startDate { year month day }
            type
            format
            episodes
            duration
            description
            coverImage { large }
            relations {
              edges {
                relationType(version: 2)
                node {
                  id
                  title { english romaji }
                  startDate { year month day }
                  type
                  format
                  episodes
                  duration
                  description
                  coverImage { large }
                  relations {
                    edges {
                      relationType(version: 2)
                      node {
                        id
                        title { english romaji }
                        startDate { year month day }
                        type
                        format
                        episodes
                        duration
                        description
                        coverImage { large }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { search: tmdbTitle }
  };

  try {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });

    const result = await res.json();
    const candidates = result?.data?.Page?.media || [];
    const matches = matchAllRelatedAniMedia(candidates, tmdbTitle, tmdbDate);

    if (!matches.length) return null;

    const relations = extractChronologicalRelationRecursive(matches);

    let initialIndex = 0;
    if (relations && relations.length) {
      const mediaDateString = tmdbDate;
      if (mediaDateString) {
      const mediaDate = new Date(mediaDateString);
      mediaDate.setHours(0, 0, 0, 0);

      let matchedIndex = relations.findIndex(entry => {
      const { year, month, day } = entry?.startDate || {};
      if (!year || !month || !day) return false;
      const entryDate = new Date(year, month - 1, day);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === mediaDate.getTime();
    });

    if (matchedIndex !== -1) initialIndex = matchedIndex;
    else {
      matchedIndex = relations.findIndex(entry => {
        const { year, month } = entry?.startDate || {};
        if (!year || !month) return false;
        return year === mediaDate.getFullYear() && month === mediaDate.getMonth() + 1;
      });
      if (matchedIndex !== -1) initialIndex = matchedIndex;
      else {
        let closestIndex = -1;
        let smallestDiff = Infinity;
        relations.forEach((entry, index) => {
          const { year, month, day } = entry?.startDate || {};
          if (!year || !month || !day) return;
          const entryDate = new Date(year, month - 1, day);
          entryDate.setHours(0, 0, 0, 0);
          const diff = Math.abs(entryDate.getTime() - mediaDate.getTime());
          if (diff < smallestDiff) {
            smallestDiff = diff;
            closestIndex = index;
          }
        });
        if (closestIndex !== -1) initialIndex = closestIndex;
        }
      }
    }
  }

  return { animeMedia: relations, initialIndex };
  } catch {
    return null;
  }
}
