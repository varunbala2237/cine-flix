import { useNavigate } from "react-router-dom"
const IMG_BASE = "https://image.tmdb.org/t/p/w500"

export default function Carousel({ mediaCarousel }) {
  const navigate = useNavigate()
  
  return (
    <div className="w-full overflow-x-auto flex space-x-3 py-3 scrollbar-hide">
      {mediaCarousel.map(item => (
        <div 
        key={item.id}
        onClick={() => navigate(`/player/${item.media_type}/${item.id}`)}
        className="relative w-72 h-40 flex-shrink-0 overflow-hidden">
          <img
            src={`${IMG_BASE}${item.poster_path || item.backdrop_path}`}
            alt={item.title || item.name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent"></div>
          {/* Media title */}
          <p className="absolute bottom-2 left-2 text-white font-semibold text-sm">
            {item.title || item.name}
          </p>
        </div>
      ))}
    </div>
  )
}
