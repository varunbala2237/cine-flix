const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

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
