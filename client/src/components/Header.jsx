import { Home as HomeIcon, Search as SearchIcon, ArrowLeft as BackIcon } from "lucide-react"

export default function Header({ onRouteClick, icon: Icon }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl font-bold text-yellow-400">Cine-Flix</h1>
      <button className="text-white" onClick={onRouteClick}>
        <Icon size={22} />
      </button>
    </div>
  )
}
