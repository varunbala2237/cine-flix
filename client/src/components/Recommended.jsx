import Card from "./Card"

export default function Recommended({ mediaRecommended }) {
  if (!mediaRecommended || mediaRecommended.length === 0) return null
  
  return (
      <>
      <h2 className="text-lg font-semibold mt-4 mb-2">Recommended for You</h2>
      
      <div className="grid grid-cols-3 gap-3 pb-4">
        {mediaRecommended.map(item => (
          <Card
            id={item.id}
            title={item.title }
            poster={item.poster_path}
            backdrop={item.backdrop_path}
            type={item.media_type}
          />
        ))}
      </div>
      </>
  )
}
