const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

// Home page functions
export async function fetchLatestMedia() {
  const endpoints = [
    { type: "movie", url: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1` },
    { type: "tv", url: `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&language=en-US&page=1` },
  ];

  const combined = [];

  for (const ep of endpoints) {
    const res = await fetch(ep.url);
    const data = await res.json();

    data.results.forEach(item => {
      combined.push({
        id: item.id,
        title: item.title || item.name,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: ep.type
      });
    });
  }

  return combined;
}

export async function fetchTrendingMedia(mediaType = "all", timeWindow = "week") {
  const res = await fetch(`${BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${API_KEY}`);
  const data = await res.json();

  return data.results.map(item => ({
    id: item.id,
    title: item.title || item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    media_type: item.media_type || (item.title ? "movie" : "tv")
  }));
}

// Search page functions
export async function fetchSearchResults(query) {
  if (!query) return [];

  const res = await fetch(
    `${BASE_URL}/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`
  );
  const data = await res.json();

  return data.results
    .filter(item => item.media_type === "movie" || item.media_type === "tv")
    .map(item => ({
      id: item.id,
      title: item.title || item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      media_type: item.media_type
    }));
}

// Player page functions
export async function fetchMediaData(id, type) {
  if (!id || !type) return null;

  const res = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=en-US`);
  const data = await res.json();
  
  const director =
    data.credits?.crew?.find(c => c.job === "Director")?.name || data.created_by?.[0]?.name || "--";
    
  let seasonsData = [];

  if (type === "tv" && data.seasons?.length) {
    seasonsData = await Promise.all(
      data.seasons.map(async season => {
        const sres = await fetch(
          `${BASE_URL}/tv/${id}/season/${season.season_number}?api_key=${API_KEY}&language=en-US`
        );
        const sdata = await sres.json();

        return {
          ...season,
          episodes: sdata.episodes || []
        };
      })
    );
  }

  return {
    id: data.id,
    title: data.title || data.name,
    overview: data.overview,
    poster_path: data.poster_path,
    backdrop_path: data.backdrop_path,
    release_date: data.release_date || data.first_air_date,
    rating: data.vote_average ? Number(data.vote_average.toFixed(1)) : 0,
    seasons: type === "tv" ? data.number_of_seasons : null,
    episodes: type === "tv" ? data.number_of_episodes : null,
    seasonsData,
    runtime: type === "movie" ? data.runtime : data.episode_run_time?.[0] || null,
    director,
    type
  };
}

export async function fetchRecommendedMedia(id, type) {
  if (!id || !type) return [];

  const res = await fetch(
    `${BASE_URL}/${type}/${id}/recommendations?api_key=${API_KEY}&language=en-US`
  );
  const data = await res.json();

  return data.results.map(item => ({
    id: item.id,
    title: item.title || item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    media_type: type
  }));
}
