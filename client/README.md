# project structure

client/
├─ src/
│  ├─ api/           # All API calls to TMDB
│  │    └─ tmdb.js
│  ├─ components/    # Reusable components (cards, navbar, sliders, etc.)
│  │    ├─ MovieCard.jsx
│  │    ├─ Navbar.jsx
│  │    └─ ...
│  ├─ pages/         # Screens / pages of the app
│  │    ├─ Home.jsx
│  │    ├─ MovieDetails.jsx
│  │    └─ ...
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ App.css
└─ package.json

# player storage structure
{
  "MEDIA_PROGRESS": {
    "12345": {
      "selected_season": 2,
      "selected_episode": 8,
      "episode_scroll": 140,
      "selected_range": "1-50",

      "seasons": {
        "1": {
          "visited": [1, 2, 3]
        },
        "2": {
          "visited": [1, 2, 3, 4, 5, 6, 7]
        }
      }
    }
  }
}