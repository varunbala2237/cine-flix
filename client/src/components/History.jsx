import { useState, useEffect } from "react"
import Card from "./Card"

export default function History({ mediaList }) {
  const [list, setList] = useState(mediaList || [])

  useEffect(() => {
    setList(mediaList || [])
  }, [mediaList])

  if (!list.length) return null

  const removeFromHistory = id => {
    const updated = list.filter(item => item.id !== id)
    setList(updated)
    localStorage.setItem("watch_history", JSON.stringify(updated))
  }

  return (
    <>
      <h2 className="text-lg font-semibold mt-4 mb-2">Recently Visited</h2>

      <div className="grid grid-cols-3 gap-3 pb-4">
        {list.map(item => (
          <Card
            key={item.id}
            id={item.id}
            title={item.title}
            poster={item.poster_path}
            backdrop={item.backdrop_path}
            type={item.type}
            progress={item.progress}
            onRemove={removeFromHistory}
          />
        ))}
      </div>
    </>
  )
}
