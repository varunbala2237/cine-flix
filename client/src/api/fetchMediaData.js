const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

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
