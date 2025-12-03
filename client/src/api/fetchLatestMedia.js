const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

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
