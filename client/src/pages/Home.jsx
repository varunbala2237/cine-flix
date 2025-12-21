import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search as SearchIcon} from "lucide-react"
import Header from "../components/Header"
import Carousel from "../components/Carousel"
import History from "../components/History"
import Trending from "../components/Trending"
import CookieStatus from "../components/CookieStatus"
import { fetchLatestMedia } from "../api/fetchLatestMedia"
import { fetchTrendingMedia } from "../api/fetchTrendingMedia"

// Helpers for Local Storage
function loadHistory() {
  const items = JSON.parse(localStorage.getItem("watch_history")) || []
  return items.slice(0, 9)
}

export default function Home() {
  const navigate = useNavigate()
  
  const [carouselMedia, setCarouselMedia] = useState(null)
  const [trendingMedia, setTrendingMedia] = useState(null)

  useEffect(() => {
    async function loadData() {
      const latest = await fetchLatestMedia()
      setCarouselMedia(latest.slice(0, 9))

      const trending = await fetchTrendingMedia("all", "week")
      setTrendingMedia(trending)
    }
    loadData()
  }, [])
  
  if(!carouselMedia || !trendingMedia) {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-3">
        <p className="text-center text-white mt-10">Loading...</p>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-black text-white px-4 py-3">

      {/* Header */}
      <Header 
        onRouteClick={() => navigate("/search")}
        icon={SearchIcon}
      />

      {/* Carousel Section */}
      <Carousel mediaCarousel={carouselMedia}/>
      
      {/* Recently Visited Section */}
      <History mediaList={loadHistory()} />
      
      {/* Trending Section */}
      <Trending mediaTrending={trendingMedia} />
    
      {/* Cookie Status Section */}
      <CookieStatus />
    </div>
  )
}
