import { useState, useEffect, useRef } from "react";

// Heplers for local storage
function loadState(id) {
  return JSON.parse(localStorage.getItem("player_state" + id)) || {};
}

function saveState(id, data) {
  const old = loadState(id);
  localStorage.setItem("player_state" + id, JSON.stringify({ ...old, ...data }));
}

export default function AnimePanel({ animeId, animeMedia, animeIndex, onRelationChange, onEpisodeChange, triggerEpisode }) {
  const saved = loadState(id);

  const [selectedIndex, setSelectedIndex] = useState(saved.index ?? animeIndex ?? 0);
  const selectedRelation = animeMedia[selectedIndex];

  const totalEpisodes = selectedRelation?.episodes || 1;
  const [range, setRange] = useState(saved.range || [1, Math.min(50, totalEpisodes)]);
  const [selectedEp, setSelectedEp] = useState(saved.episode || 1);

  const listRef = useRef(null);

  const updateRelation = index => {
    setSelectedIndex(index);
    saveState(animeId, { index });
    setRange([1, Math.min(50, animeMedia[index].episodes || 1)]);
    setSelectedEp(1);
    saveState(animeId, { episode: 1 });
    onEpisodeChange(animeMedia[index].animeId, 1);
  };

  const updateRange = r => {
    setRange(r);
    saveState(animeId, { range: r });
  };

  const updateEp = ep => {
    setSelectedEp(ep);
    saveState(animeId, { episode: ep });
    onEpisodeChange(selectedRelation.animeId, ep);
  };

  const ranges = [];
  for (let start = 1; start <= totalEpisodes; start += 50) {
    ranges.push([start, Math.min(start + 49, totalEpisodes)]);
  }

  const episodesInRange = [];
  for (let ep = range[0]; ep <= Math.min(range[1], totalEpisodes); ep++) {
    episodesInRange.push(ep);
  }

  useEffect(() => {
    if (listRef.current && saved.scroll != null) {
      listRef.current.scrollTop = saved.scroll;
    }
  }, [selectedIndex]);

  useEffect(() => {
    if (triggerEpisode != null) {
      updateEp(triggerEpisode);
    }
  }, [triggerEpisode]);

  const handleScroll = e => {
    saveState(animeId, { scroll: e.target.scrollTop });
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Episodes</h3>
        <select
          className="bg-zinc-900 text-white text-sm p-1"
          value={range.join("-")}
          onChange={e => {
            const [start, end] = e.target.value.split("-").map(Number);
            updateRange([start, end]);
          }}
        >
          {ranges.map(([start, end]) => (
            <option key={start} value={`${start}-${end}`}>
              {start}–{end}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {episodesInRange.map(ep => (
          <button
            key={ep}
            onClick={() => updateEp(ep)}
            className={`p-1 text-sm ${
              selectedEp === ep ? "bg-yellow-500 text-black" : "bg-zinc-900 text-white"
            }`}
          >
            {ep}
          </button>
        ))}
      </div>

      <h3 className="text-lg font-semibold mb-2">Relations</h3>
      <div className="max-h-72 overflow-y-auto" ref={listRef} onScroll={handleScroll}>
        {animeMedia.map((rel, idx) => (
          <div
            key={rel.id}
            onClick={() => updateRelation(idx)}
            className={`p-2 bg-zinc-900 text-sm flex items-center justify-between cursor-pointer mb-1 ${
              selectedIndex === idx ? "border-l-4 border-yellow-500" : "border-l-4 border-transparent"
            }`}
          >
            <p className="truncate">{idx}. {rel.title.english || rel.title.romaji || `Rel ${idx + 1}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
