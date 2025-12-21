import { useNavigate } from "react-router-dom"

const IMG_BASE = "https://image.tmdb.org/t/p/w500"

export default function Card({ id, title, poster, backdrop, type, progress }) {
  const navigate = useNavigate()
  const img = `${IMG_BASE}${poster || backdrop}`

  const percent =
    progress && progress.duration
      ? Math.min(100, (progress.currentTime / progress.duration) * 100)
      : 0

  return (
    <div
      onClick={() => navigate(`/player/${type}/${id}`)}
      className="bg-zinc-900 overflow-hidden cursor-pointer"
    >
      {/* Image wrapper */}
      <div className="relative">
        <img
          src={img}
          alt={title}
          className="w-full h-40 object-cover"
        />

        {/* Progress bar */}
        {percent > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/50">
            <div
              className="h-full bg-yellow-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="p-2">
        <p className="text-sm line-clamp-2">{title}</p>
      </div>
    </div>
  )
}
