import { useNavigate } from "react-router-dom"
const IMG_BASE = "https://image.tmdb.org/t/p/w500"

export default function Card({ id, title, poster, backdrop, type }) {
  const navigate = useNavigate()
  const img = `${IMG_BASE}${poster || backdrop}`

  return (
    <div
    onClick={() => navigate(`/player/${type}/${id}`)}
    className="overflow-hidden bg-zinc-900">
      <img
        src={img}
        alt={title}
        className="w-full h-40 object-cover"
      />
      <div className="p-2">
        <p className="text-sm">{title}</p>
      </div>
    </div>
  )
}
