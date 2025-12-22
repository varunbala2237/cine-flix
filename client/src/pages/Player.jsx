import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Home as HomeIcon } from "lucide-react"
import Cookies from "js-cookie"
import Header from "../components/Header"
import Details from "../components/Details"
import Switch from "../components/Switch"
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
    progress: item.progress ?? null,
    last_updated: Date.now()
  })
  
  list = list.slice(0, 9)

  localStorage.setItem("watch_history", JSON.stringify(list))
}

// Add-ons of iframe
const ADDONS = "poster=true"

export default function Player() {
  const { id, type } = useParams()
  const navigate = useNavigate()
  const BASE_URL = import.meta.env.VITE_SOURCE_BASE
  const saved = loadState(id)
  
  const [media, setMedia] = useState(null)
  const [animeId, setAnimeId] = useState(null)
  const [animeMedia, setAnimeMedia] = useState(undefined)
  const [isHistorySaved, setIsHistorySaved] = useState(null)
  
  const [isAutoPlay, setIsAutoPlay] = useState(Cookies.get("media_autoplay") === "true")
  const [isAutoNext, setIsAutoNext] = useState(Cookies.get("media_autonext") === "true")
  const [isAutoDub, setIsAutoDub] = useState(Cookies.get("anime_autodub") === "true")
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
      const AUTOPLAY_PARAM = isAutoPlay ? "autoPlay=true" : "autoPlay=false"
      const AUTODUB_PARAM = isAutoDub ? "dub" : "sub"
      
      const recMedia = await fetchRecommendedMedia(id, type)
      setRecommendedMedia(recMedia)
      
      const newSaved = loadState(id)
      if (animeData) {
        const newId = animeData.animeMedia[animeData.initialIndex].id
        const season = newSaved.season ?? animeData.initialIndex ?? 0
        const episode = newSaved.episode || 1
        
        setAnimeMedia(animeData.animeMedia || [])
        setAnimeId(newId)
        setSelectedSeason(season)
        setSelectedEpisode(episode)
        setMediaUrl(`${BASE_URL}anime/ani${newId}/${episode}/${AUTODUB_PARAM}?${AUTOPLAY_PARAM}&${ADDONS}`)
      } else {
        setAnimeMedia([])
        
        if (type === "tv") {
          const season = newSaved.season || 1
          const episode = newSaved.episode || 1
        
          setSelectedSeason(season)
          setSelectedEpisode(episode)
          setMediaUrl(`${BASE_URL}${type}/${id}/${season}/${episode}?${AUTOPLAY_PARAM}&${ADDONS}`)
        }
      
        if (type === "movie") {
          setMediaUrl(`${BASE_URL}${type}/${id}?${AUTOPLAY_PARAM}&${ADDONS}`)
        }
      }
    }
    load()
  }, [id, type])
  
  useEffect(() => {
    if (animeMedia === undefined) return
    
    const AUTOPLAY_PARAM = isAutoPlay ? "autoPlay=true" : "autoPlay=false"
    const AUTODUB_PARAM = isAutoDub ? "dub" : "sub"
    
    if (animeMedia.length > 0) {
      setMediaUrl(`${BASE_URL}anime/ani${animeId}/${selectedEpisode}/${AUTODUB_PARAM}?${AUTOPLAY_PARAM}&${ADDONS}`)
    } else {
      if (type === "tv") {
        setMediaUrl(`${BASE_URL}${type}/${id}/${selectedSeason}/${selectedEpisode}?${AUTOPLAY_PARAM}&${ADDONS}`)
      }
    }
    
    Cookies.set("media_autoplay", isAutoPlay, { expires: 365 })
    Cookies.set("media_autonext", isAutoNext, { expires: 365 })
    Cookies.set("anime_autodub", isAutoDub, { expires: 365 })
  }, [animeId, selectedSeason, selectedEpisode, isAutoPlay, isAutoNext, isAutoDub])
  
  useEffect(() => {
    if (!autoEpisode) return
    if (autoEpisode === selectedEpisode) return

    setSelectedEpisode(autoEpisode)
  }, [autoEpisode])
  
  useEffect(() => {
    setIsHistorySaved(null)
  }, [id])

  // To save history and trigger episode change
  useEffect(() => {
    if (!media) return
    
    if(animeMedia?.length > 0 && isHistorySaved !== media.id) {
      saveHistory({
          id: media.id,
          title: media.title,
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          type: media.type
        })
        setIsHistorySaved(media.id)
    }

    const handleMsg = (e) => {
      if (!e.data || e.data.type !== "PLAYER_EVENT") return

      const {
        event,
        tmdbId,
        duration,
        currentTime,
        mediaType,
        season,
        episode
      } = e.data.data || {}

      if (event === "time" && currentTime > 0 && isHistorySaved !== media.id) {
        saveHistory({
          id: tmdbId ?? media.id,
          title: media.title,
          poster_path: media.poster_path,
          backdrop_path: media.backdrop_path,
          type: media.type,
          progress : {
            currentTime,
            duration
          }
        })
        setIsHistorySaved(media.id)
      }

      if (
        event === "complete" &&
        mediaType === "tv" && isAutoNext
      ) {
        const nextEpisode = episode + 1
        setAutoEpisode(nextEpisode)
        saveState(id, { episode: nextEpisode })
      }
    }

    window.addEventListener("message", handleMsg)
    return () => window.removeEventListener("message", handleMsg)
  }, [media, animeMedia, isAutoNext])
  
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
      
      {/* Control Switches */}
      <div className="my-4 flex flex-nowrap gap-4 text-xs items-center justify-end">
          
        <div className="flex items-center gap-2">
          <span>Auto Play</span>
          <Switch checked={isAutoPlay} onChange={setIsAutoPlay} />
        </div>
        
        {media.type === "tv" && animeMedia?.length === 0 && (
          <div className="flex items-center gap-2">
              <span>Auto Next</span>
              <Switch
                checked={isAutoNext}
                onChange={setIsAutoNext}
              />
            </div>
        )}

        {animeMedia?.length > 0 && (
          <div className="flex items-center gap-2">
              <span>Auto Dub</span>
              <Switch
                checked={isAutoDub}
                onChange={setIsAutoDub}
              />
            </div>
        )}
      </div>

      {/* Details */}
      <Details media={media} />
      
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
