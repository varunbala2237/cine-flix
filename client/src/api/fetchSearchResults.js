const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

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

