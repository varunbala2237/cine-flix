import { useState, useEffect, useRef } from "react"

// Helpers for local storage
function loadState(id) {
  return JSON.parse(localStorage.getItem("player_state" + id)) || {}
}

function saveState(id, data) {
  const old = loadState(id)
  localStorage.setItem("player_state" + id, JSON.stringify({ ...old, ...data }))
}

export default function AnimePanel({
  id,
  animeId,
  setAnimeId,
  animeMedia = [],
  selectedRelation,
  setSelectedRelation,
  selectedEpisode,
  setSelectedEpisode
}) {
  const saved = loadState(id)
  const relationsRef = useRef(null)

  const initialRelationIndex =
    saved.relationIndex != null
      ? saved.relationIndex
      : selectedRelation != null
      ? selectedRelation
      : 0

  const [currentRelationIndex, setCurrentRelationIndex] = useState(initialRelationIndex)

  const current = animeMedia[currentRelationIndex] || null
  const totalEpisodes = current?.episodes || 1

  const [range, setRange] = useState(saved.range || [1, Math.min(50, totalEpisodes)])

  const ranges = []
  for (let start = 1; start <= totalEpisodes; start += 50) {
    ranges.push([start, Math.min(start + 49, totalEpisodes)])
  }

  const episodesInRange = Array.from(
    { length: Math.max(0, Math.min(range[1], totalEpisodes) - range[0] + 1) },
    (_, i) => range[0] + i
  )

  useEffect(() => {
    if (!animeMedia || animeMedia.length === 0) return
    const rel = animeMedia[currentRelationIndex]
    if (!rel) return

    setAnimeId(rel.id)

    const restored = loadState(id)
    const ep = restored.episode || 1
    setSelectedEpisode(ep)

    const r = restored.range || [1, Math.min(50, rel.episodes || 1)]
    setRange(r)

    if (relationsRef.current && saved.relationsScroll != null) {
      relationsRef.current.scrollTop = saved.relationsScroll
    }
  }, [animeMedia, currentRelationIndex])

  const handleRelationsScroll = e => {
    saveState(id, { relationsScroll: e.target.scrollTop })
  }

  const handleSelectRelation = index => {
    const rel = animeMedia[index]
    if (!rel) return

    setCurrentRelationIndex(index)
    setSelectedRelation(index)
    setAnimeId(rel.id)

    const restored = loadState(id)
    const ep = restored.episode || 1
    const r = restored.range || [1, Math.min(50, rel.episodes || 1)]

    setSelectedEpisode(ep)
    setRange(r)

    saveState(id, { relationIndex: index })
  }

  const handleRangeChange = r => {
    setRange(r)
    saveState(id, { range: r })
  }

  const handleSelectEpisode = ep => {
    setSelectedEpisode(ep)
    saveState(id, { episode: ep })
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Episodes</h3>
        <select
          className="bg-zinc-900 text-white text-sm p-1"
          value={range.join("-")}
          onChange={e => {
            const [s, e2] = e.target.value.split("-").map(Number)
            handleRangeChange([s, e2])
          }}
        >
          {ranges.map(([s, e]) => (
            <option key={s} value={`${s}-${e}`}>
              {s}–{e}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {episodesInRange.map(ep => (
          <button
            key={ep}
            onClick={() => handleSelectEpisode(ep)}
            className={`p-1 text-sm truncate ${
              selectedEpisode === ep
                ? "bg-yellow-500 text-black"
                : "bg-zinc-900 text-white"
            }`}
          >
            {ep}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-2">Relations</h3>

      <div
        className="max-h-75 overflow-y-auto"
        ref={relationsRef}
        onScroll={handleRelationsScroll}
      >
        {animeMedia.map((rel, i) => (
          <div
            key={rel.id}
            onClick={() => handleSelectRelation(i)}
            className={`p-2 bg-zinc-900 text-sm flex items-center justify-between cursor-pointer ${
              currentRelationIndex === i
                ? "border-l-4 border-yellow-500"
                : "border-l-4 border-transparent"
            }`}
          >
            <p className="truncate text-sm">
              {i}. {rel.title?.english || rel.title?.romaji || `Relation ${i + 1}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
