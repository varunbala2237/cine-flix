import { ExternalLink as LinkIcon } from "lucide-react"

export default function Details({ media }) {
  const tmdbUrl = `https://www.themoviedb.org/${media.type}/${media.id}`
  
  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">{media.title}</h2>

      <div className="flex text-sm text-gray-400 gap-3 mb-1">
        <span>{media.release_date?.slice(0, 4)}</span>
        {media.rating && <span>Rating: {media.rating}</span>}
      </div>

      <div className="flex text-sm text-gray-400 gap-3 mb-1">
        {media.director && <span>Director: {media.director}</span>}
      </div>

      <div className="flex flex-wrap text-sm text-gray-400 gap-3 mb-2">
        {media.seasons && <span>Seasons: {media.seasons}</span>}
        {media.episodes && <span>Episodes: {media.episodes}</span>}
        {media.runtime && <span>Runtime: {media.runtime} min</span>}
      </div>

      <p className="text-gray-300 text-sm">{media.overview}</p>
      
      <a
        href={tmdbUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-yellow-400 text-sm hover:underline"
      >
        More Details
        <LinkIcon size={14} className="ml-1" />
      </a>
    </div>
  )
}
