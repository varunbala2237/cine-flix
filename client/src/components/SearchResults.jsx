import { useState, useEffect } from "react"
import { History as HistoryIcon, X as XIcon } from "lucide-react"
import Card from "./Card";

export default function SearchResults({ mediaResults, onHistorySelect, onHistoryDelete }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("search_history")) || []
    setHistory(saved)
  }, [])

  // Search history
  if (!mediaResults || mediaResults.length === 0) {
    return (
      <div className="mt-6">
        <div className="flex items-center space-x-2 mb-2">
          <HistoryIcon size={16} className="text-gray-400" />
          <h3 className="text-sm text-gray-400">Recent Searches</h3>
        </div>

        {history.length === 0 && (
          <p className="text-sm mt-4 text-center">
            No recent searches.
          </p>
        )}

        <div className="flex flex-col">
          {history.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center bg-zinc-900 px-3 py-2"
            >
              <span
                onClick={() => onHistorySelect(item)}
                className="text-sm cursor-pointer"
              >
                {item}
              </span>

              <button
                onClick={() => {
                  onHistoryDelete(item)
                  setHistory(history.filter(h => h !== item))
                }}
                className="text-gray-400 text-xs"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3 mt-4 pb-4">
      {mediaResults.map(item => (
        <Card
          id={item.id}
          title={item.title}
          poster={item.poster_path}
          backdrop={item.backdrop_path}
          type={item.media_type}
        />
      ))}
    </div>
  )
}
