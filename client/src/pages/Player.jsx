import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Home as HomeIcon } from "lucide-react"
import Cookies from "js-cookie"
import Header from "../components/Header"
import Details from "../components/Details"
import Panel from "../components/Panel"
import AnimePanel from "../components/AnimePanel"
import Recommended from "../components/Recommended"
import { fetchMediaData } from "../api/fetchMediaData"
import { fetchAnimeMedia } from "../api/fetchAnimeMedia"
import { fetchRecommendedMedia } from "../api/fetchRecommendedMedia"

// Helpers for Local Storage
function loadState(id) {
  return JSON.parse(localStorage.getItem("player_state" + id)) || {}
}

function saveState(id, data) {
  const old = loadState(id)
  localStorage.setItem("player_state" + id, JSON.stringify({ ...old, ...data }))
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
  const saved = loadState(id)
  
  const [media, setMedia] = useState(null)
  const [animeId, setAnimeId] = useState(null)
  const [animeMedia, setAnimeMedia] = useState(undefined)
  const [isDub, setIsDub] = useState(Cookies.get("anime_dub") === "true")
  const [recommendedMedia, setRecommendedMedia] = useState([])
  const [mediaUrl, setMediaUrl] = useState("")
  
  const [selectedSeason, setSelectedSeason] = useState(saved.season ?? 1)
  const [selectedEpisode, setSelectedEpisode] = useState(saved.episode || 1)
  const [autoEpisode, setAutoEpisode] = useState(null)

  useEffect(() => {
    async function load() {
      const data = await fetchMediaData(id, type)
      setMedia(data)
      
      const animeData = await fetchAnimeMedia(data)
      const DUB_PARAM = isDub ? "&dub=true" : "&dub=false"
      
      const recMedia = await fetchRecommendedMedia(id, type)
      setRecommendedMedia(recMedia)
      
      const newSaved = loadState(id)
      if (animeData) {
        const season = newSaved.season ?? animeData.initialIndex ?? 0
        const episode = newSaved.episode || 1
        
        setAnimeMedia(animeData.animeMedia || [])
        setAnimeId(animeData.animeMedia[animeData.initialIndex].id)
        setSelectedSeason(season)
        setSelectedEpisode(episode)
        setMediaUrl(`${BASE_URL}anime/${animeId}/${episode}?${ADD_ONS}${DUB_PARAM}`)
      } else {
        setAnimeMedia([])
        
        if (type === "tv") {
          const season = newSaved.season || 1
          const episode = newSaved.episode || 1
        
          setSelectedSeason(season)
          setSelectedEpisode(episode)
          setMediaUrl(`${BASE_URL}${type}/${id}/${season}/${episode}?${ADD_ONS}`)
        }
      
        if (type === "movie") {
          setMediaUrl(`${BASE_URL}${type}/${id}?${ADD_ONS}`)
        }
      }
    }
    load()
  }, [id, type])
  
  useEffect(() => {
    if (animeMedia === undefined) return
    
    const DUB_PARAM = isDub ? "&dub=true" : "&dub=false"
    
    if (animeMedia.length > 0) {
      setMediaUrl(`${BASE_URL}anime/${animeId}/${selectedEpisode}?${ADD_ONS}${DUB_PARAM}`)
    } else {
      if (type === "tv") {
        setMediaUrl(`${BASE_URL}${type}/${id}/${selectedSeason}/${selectedEpisode}?${ADD_ONS}`)
      }
    }
    
    Cookies.set("anime_dub", isDub, { expires: 365 })
  }, [selectedSeason, selectedEpisode, isDub])
  
  useEffect(() => {
    if (!autoEpisode) return
    if (autoEpisode === selectedEpisode) return

    setSelectedEpisode(autoEpisode)
  }, [autoEpisode])

  // To save history and trigger episode change
  useEffect(() => {
    if (!media) return

    const handleMsg = (e) => {
      if (!e.data) return

      let parsed;
      try { parsed = JSON.parse(e.data) } catch { return }
      if (parsed.type !== "MEDIA_DATA") return

      let data
      try { data = JSON.parse(parsed.data) } catch { return }
      
      let current = animeId ? data[`anime-${animeId}`] : data[`${type}-${id}`]
      if (!current) return

      const watched = current.progress?.watched
      if (watched > 0) {
        saveHistory({
          id: media.id,
          title: media.title,
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          type: media.type
        })
      }

      if (media.type === "tv" && current.last_episode_watched) {
        setAutoEpisode(current.last_episode_watched)
        saveState(id, { episode: current.last_episode_watched })
      }
    }

    window.addEventListener("message", handleMsg)
    return () => window.removeEventListener("message", handleMsg)
  }, [media, animeId])
  
  if (!media) {
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
      
      {animeMedia !== undefined && animeMedia.length > 0 && (
        <div className="my-4 flex items-center">
          <button
            className={`py-1 px-3 text-sm ${!isDub ? "bg-yellow-500 text-black" : "bg-zinc-900"}`}
            onClick={() => setIsDub(false)}
          >
            Sub
          </button>
          <button
            className={`py-1 px-3 text-sm ${isDub ? "bg-yellow-500 text-black" : "bg-zinc-900"}`}
            onClick={() => setIsDub(true)}
          >
            Dub
          </button>
        </div>
      )}
      
      {/* Multi-Panel Section */}
      {animeMedia === undefined ? (
        <p className="text-center text-white mt-4">Loading...</p>
      ) : animeMedia.length > 0 ? (
          <AnimePanel
            id={id}
            animeId={animeId}
            setAnimeId={setAnimeId}
            animeMedia={animeMedia}
            selectedRelation={selectedSeason}
            setSelectedRelation={setSelectedSeason}
            selectedEpisode={selectedEpisode}
            setSelectedEpisode={setSelectedEpisode}
            noOfEpisodes={media.episodes}
          />
      ) : (
        media.type === "tv" && (
          <Panel
            id={media.id}
            seasons={media.seasonsData}
            selectedSeason={selectedSeason}
            setSelectedSeason={setSelectedSeason}
            selectedEpisode={selectedEpisode}
            setSelectedEpisode={setSelectedEpisode}
          />
        )
      )}
      
      {/* Recommended Section */}
      <Recommended mediaRecommended={recommendedMedia} />

    </div>
  )
}
