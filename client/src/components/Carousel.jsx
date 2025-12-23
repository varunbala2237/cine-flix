import { useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"

const IMG_BASE = "https://image.tmdb.org/t/p/original"

export default function Carousel({ mediaCarousel }) {
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const i = Math.round(el.scrollLeft / el.clientWidth)
      setIndex(i)
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll)
  }, [])
  
  return (
    <div className="relative">
      {/* Slides */}
      <div
        ref={containerRef}
        className="flex overflow-x-scroll overscroll-x-contain snap-x snap-mandatory no-scrollbar"
      >
        {mediaCarousel.map(item => (
          <div
            key={item.id}
            onClick={() => navigate(`/player/${item.media_type}/${item.id}`)}
            className="min-w-full h-52 snap-center relative cursor-pointer"
          >
            <img
              src={`${IMG_BASE}${item.backdrop_path || item.poster_path}`}
              alt={item.title || item.name}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Title */}
            <div className="absolute bottom-4 left-4 right-4">
              <h2 className="text-lg font-semibold text-white">
                {item.title || item.name}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-end gap-2 mt-3">
        {mediaCarousel.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 transition ${
              i === index ? "bg-yellow-500" : "bg-zinc-600"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
