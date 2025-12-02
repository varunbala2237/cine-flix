import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Home as HomeIcon } from "lucide-react"
import { fetchMediaData, fetchRecommendedMedia } from "../api/fetchMedia"
import Header from "../components/Header"
import Details from "../components/Details"
import Panel from "../components/Panel"
import Recommended from "../components/Recommended"

// Helpers for Local Storage
function loadState(id) {
  return JSON.parse(localStorage.getItem("player_state" + id)) || {}
}

function saveHistory(item) {
  let list = JSON.parse(localStorage.getItem("watch_history")) || []

  list = list.filter(i => i.id !== item.id)

  list.unshift({
    id: item.id,
    title: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    type: item.type,
    last_updated: Date.now()
  })
  
  list = list.slice(0, 6)

  localStorage.setItem("watch_history", JSON.stringify(list))
}

// Add-ons of site
const ADD_ONS="color=FACC15&nextEpisode=true"

export default function Player() {
  const { id, type } = useParams()
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_SOURCE_BASE
  
  const [media, setMedia] = useState(null)
  const [recommendedMedia, setRecommendedMedia] = useState([])
  const [mediaUrl, setMediaUrl] = useState("")
  
  const [externalEpisode, setExternalEpisode] = useState(null)

  useEffect(() => {
    async function load() {
      const data = await fetchMediaData(id, type)
      setMedia(data)
      
      const recMedia = await fetchRecommendedMedia(id, type)
      setRecommendedMedia(recMedia)
      
      if (type === "tv") {
        const saved = loadState(id)
        const s = saved.season || 1
        const e = saved.episode || 1
        setMediaUrl(`${BASE_URL}${type}/${id}/${s}/${e}?${ADD_ONS}`)
      }
      
      if (type === "movie") {
        setMediaUrl(`${BASE_URL}${type}/${id}?${ADD_ONS}`)
      }
    }
    load()
  }, [id, type])
  
  useEffect(() => {
    if (!media || !mediaUrl) return;

    saveHistory({
      id: media.id,
      title: media.title,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      type: media.type
    });
  }, [mediaUrl]);
  
  const handleEpisodeChange = (season, episode) => {
    setMediaUrl(`${BASE_URL}${type}/${id}/${season}/${episode}?${ADD_ONS}`)
  }
  
  // To catch trigger episode
  useEffect(() => {
    const handleMsg = (event) => {
    if (!event.data) return

    let msg
    try { msg = JSON.parse(event.data) } catch { return }

    const keys = Object.keys(msg)
    if (keys.length === 0) return

    const lastKey = keys[keys.length - 1]
    const epData = msg[lastKey]
    if (!epData || !epData.episode) return

    setExternalEpisode(Number(epData.episode))
    }

    window.addEventListener("message", handleMsg)
    return () => window.removeEventListener("message", handleMsg)
  }, [])
  
  if (!media) return <p className="text-center text-white mt-10">Loading...</p>
  
  return (
    <div className="min-h-screen bg-black text-white px-4 py-3">

      {/* Header */}
      <Header 
        onRouteClick={() => navigate("/")}
        icon={HomeIcon}
      />

      <div className="w-full aspect-video mb-4 bg-black">
        <iframe
          src={mediaUrl}
          title={media.title}
          className="w-full h-full"
          allowFullScreen
          allow="encrypted-media"
        />
      </div>

      {/* Details */}
      <Details media={media} />
      
      {media.type === "tv" && (
        <Panel id={media.id} seasons={media.seasonsData} onEpisodeChange={handleEpisodeChange} triggerEpisode={externalEpisode} />
      )}
      
      {/* Recommended Section */}
      <Recommended mediaRecommended={recommendedMedia} />

    </div>
  )
}
