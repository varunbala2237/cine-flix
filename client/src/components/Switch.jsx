export default function Switch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-9 h-5 relative transition ${
        checked ? "bg-yellow-500" : "bg-zinc-800"
      }`}
    >
      <span
        className={`w-4 h-4 absolute top-0.5 transition ${
          checked ? "left-4 bg-black" : "left-1 bg-white"
        }`}
      />
    </button>
  )
}
