import { Share2 as ShareIcon } from "lucide-react"
import { useLocation } from "react-router-dom"

export default function Header({ onRouteClick, icon: Icon }) {
  const { pathname } = useLocation()
  const isPlayer = pathname.startsWith("/player")

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) await navigator.share({ url })
  }
  
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold text-yellow-400">Cine-Flix</h1>
      
      <div className="flex items-center gap-4">
        {isPlayer && (
          <button className="text-white" onClick={handleShare}>
            <ShareIcon size={22} />
          </button>
        )}
        <button className="text-white" onClick={onRouteClick}>
          <Icon size={22} />
        </button>
      </div>
    </div>
  )
}
