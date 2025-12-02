import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Home as HomeIcon, Search as SearchIcon } from "lucide-react"
import Header from "../components/Header"
import SearchResults from "../components/SearchResults"
import { fetchSearchResults } from "../api/fetchMedia"

export default function Search() {
  const navigate = useNavigate()
  
  const [query, setQuery] = useState("")
  const [resultsMedia, setResultsMedia] = useState([])

  // Save search
  function saveHistory(text) {
    if (!text.trim()) return

    let items = JSON.parse(localStorage.getItem("search_history")) || []

    items = [text, ...items.filter(i => i !== text)].slice(0, 10)

    localStorage.setItem("search_history", JSON.stringify(items))
  }

  // Delete search
  function deleteHistory(text) {
    let items = JSON.parse(localStorage.getItem("search_history")) || []

    items = items.filter(i => i !== text)
    localStorage.setItem("search_history", JSON.stringify(items))
  }

  // Trigger search
  async function handleSearch(e, customQuery) {
    if (e) e.preventDefault()

    const searchText = customQuery || query;
    if (!searchText.trim()) return

    saveHistory(searchText)

    const data = await fetchSearchResults(searchText)
    setResultsMedia(data)
  }
  
  return (
    <div className="min-h-screen bg-black text-white px-4 py-3">

      {/* Header */}
      <Header 
        onRouteClick={() => navigate("/")}
        icon={HomeIcon}
      />

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-center mb-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies or shows..."
          className="w-full bg-zinc-900 px-3 py-2 text-sm outline-none"
        />
        <button className="bg-yellow-400 text-black px-3 py-2">
          <SearchIcon size={18} />
        </button>
      </form>

      {/* Results Section */}
      <SearchResults 
        mediaResults={resultsMedia}
        onHistorySelect={(text) => {
          setQuery(text)
          handleSearch(null, text)
        }}
        onHistoryDelete={deleteHistory} />
    </div>
  )
}
