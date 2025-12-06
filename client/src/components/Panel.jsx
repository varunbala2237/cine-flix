import { useState, useEffect, useRef } from "react"

// Helpers for Local Storage
function loadState(id) {
  return JSON.parse(localStorage.getItem("player_state" + id)) || {}
}

function saveState(id, data) {
  const old = loadState(id)
  localStorage.setItem("player_state" + id, JSON.stringify({ ...old, ...data }))
}

export default function Panel({ id, seasons, selectedSeason, setSelectedSeason, selectedEpisode, setSelectedEpisode }) {
  const saved = loadState(id)
  
  const [range, setRange] = useState(saved.range || [1, 50])
  const listRef = useRef(null)

  const updateSeason = s => {
    setSelectedSeason(s)
    saveState(id, { season: s })
  }

  const updateRange = r => {
    setRange(r)
    saveState(id, { range: r })
  }

  const updateEp = ep => {
    setSelectedEpisode(ep)
    saveState(id, { episode: ep })
  }

  const current = seasons.find(s => s.season_number === selectedSeason)
  const total = current?.episodes?.length || 0

  const ranges = []
  for (let start = 1; start <= total; start += 50) {
    ranges.push([start, Math.min(start + 49, total)])
  }

  const episodesInRange =
    current?.episodes?.filter(
      ep => ep.episode_number >= range[0] && ep.episode_number <= range[1]
    ) || []
    
  useEffect(() => {
    if (listRef.current && saved.scroll != null) {
      listRef.current.scrollTop = saved.scroll
    }
  }, [])

  const handleScroll = e => {
    saveState(id, { scroll: e.target.scrollTop })
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Seasons</h3>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {seasons.map(season => (
          <button
            key={season.id}
            onClick={() => updateSeason(season.season_number)}
            className={`p-1 truncate text-sm ${selectedSeason === season.season_number
                ? "bg-yellow-500 text-black"
                : "bg-zinc-900 text-white"
              }`}
          >
            S{season.season_number}
          </button>
        ))}
      </div>

      {current?.episodes && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Episodes</h3>

            <select
              className="bg-zinc-900 text-white text-sm p-1"
              value={range.join("-")}
              onChange={e => {
                const [start, end] = e.target.value.split("-").map(Number)
                updateRange([start, end])
              }}
            >
              {ranges.map(([start, end]) => (
                <option key={start} value={`${start}-${end}`}>
                  {start}–{end}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-75 overflow-y-auto" ref={listRef}
            onScroll={handleScroll}>
            {episodesInRange.map(ep => (
              <div
                key={ep.id}
                onClick={() => updateEp(ep.episode_number)}
                className={`p-2 bg-zinc-900 text-sm flex items-center justify-between cursor-pointer ${selectedEpisode === ep.episode_number ? "border-l-4 border-yellow-500" : "border-l-4 border-transparent"}`}
              >
                <div className="overflow-hidden pr-2">
                  <p className="truncate text-sm">
                    {ep.episode_number}. {ep.name}
                  </p>
                  
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
