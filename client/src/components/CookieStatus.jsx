import { useState, useEffect } from 'react'

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/`
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
}

export default function CookieStatus() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getCookie('cookie_status')) setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-4 bg-zinc-900 text-white flex justify-between items-center shadow-lg z-50">
      <p className="text-sm">This site uses cookies to save preferences.</p>
      <button
        className="ml-4 px-3 py-1 bg-yellow-400 text-black text-xs hover:brightness-90"
        onClick={() => {
          setCookie('cookie_status', 'false', 365)
          setVisible(false)
        }}
      >
        OK
      </button>
    </div>
  )
}
