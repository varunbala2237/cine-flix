import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export default function CookieStatus() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!Cookies.get('cookie_status')) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-4 bg-zinc-900 text-white flex justify-between items-center shadow-lg z-50">
      <p className="text-sm">This site uses cookies to save preferences.</p>
      <button
        className="ml-4 px-3 py-1 bg-yellow-400 text-black text-xs hover:brightness-90"
        onClick={() => {
          Cookies.set('cookie_status', 'false', { expires: 365 })
          setVisible(false)
        }}
      >
        OK
      </button>
    </div>
  )
}
