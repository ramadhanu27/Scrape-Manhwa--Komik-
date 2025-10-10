import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Star, Clock, Flame } from 'lucide-react'
import ManhwaCard from '../components/manhwa/ManhwaCard'
import { useState, useEffect } from 'react'

export default function Home() {
  const [featuredManhwa, setFeaturedManhwa] = useState([])
  const [topRated, setTopRated] = useState([])
  const [latest, setLatest] = useState([])
  const [popularGenres, setPopularGenres] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load manhwa data from JSON
    fetch('/data/manhwa-list.json')
      .then(res => res.json())
      .then(data => {
        const manhwaList = data.manhwa || data
        
        // Featured: Top 5 by rating
        const featured = [...manhwaList]
          .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
          .slice(0, 5)
        
        // Top Rated: Top 12 by rating
        const rated = [...manhwaList]
          .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
          .slice(0, 12)
        
        // Latest: Top 12 by update time
        const latestUpdates = [...manhwaList].slice(0, 12)
        
        // Extract popular genres (count occurrences)
        const genreCount = {}
        manhwaList.forEach(manhwa => {
          if (manhwa.genres && Array.isArray(manhwa.genres)) {
            manhwa.genres.forEach(genre => {
              genreCount[genre] = (genreCount[genre] || 0) + 1
            })
          }
        })
        
        // Sort by count and get top 12
        const sortedGenres = Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([genre]) => genre)
        
        setFeaturedManhwa(featured)
        setTopRated(rated)
        setLatest(latestUpdates)
        setPopularGenres(sortedGenres)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading manhwa:', error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-dark-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Background Image */}
        {featuredManhwa[0] && (
          <div className="absolute inset-0">
            <img
              src={featuredManhwa[0].image}
              alt={featuredManhwa[0].title}
              className="w-full h-full object-cover blur-xl scale-110 opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-dark-900/40" />
          </div>
        )}

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-2">
              <Flame className="w-5 h-5 text-primary-400" />
              <span className="text-primary-400 font-semibold">Featured Manhwa</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Read Your Favorite
              <span className="gradient-text block">Manhwa Online</span>
            </h1>

            <p className="text-xl text-dark-300">
              Discover thousands of manhwa with high quality images and fast updates. Start reading now!
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/browse"
                className="inline-flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                <span>Browse All</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/browse?filter=top-rated"
                className="inline-flex items-center space-x-2 bg-dark-800 hover:bg-dark-700 text-white px-8 py-3 rounded-lg font-semibold border border-dark-700 transition-colors"
              >
                <Star className="w-5 h-5" />
                <span>Top Rated</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Top Rated</h2>
              <p className="text-dark-400 text-sm">Highest rated manhwa</p>
            </div>
          </div>
          <Link
            to="/browse?filter=top-rated"
            className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 font-semibold"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {topRated.map((manhwa, index) => (
            <ManhwaCard key={index} manhwa={manhwa} />
          ))}
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Latest Updates</h2>
              <p className="text-dark-400 text-sm">Recently updated manhwa</p>
            </div>
          </div>
          <Link
            to="/browse?filter=latest"
            className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 font-semibold"
          >
            <span>View All</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {latest.map((manhwa, index) => (
            <ManhwaCard key={index} manhwa={manhwa} />
          ))}
        </div>
      </section>

      {/* Popular Genres */}
      <section className="container mx-auto px-4">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Popular Genres</h2>
            <p className="text-dark-400 text-sm">Explore by genre</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularGenres.map((genre) => (
            <Link
              key={genre}
              to={`/browse?genre=${genre.toLowerCase()}`}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-dark-800 to-dark-700 border border-dark-600 hover:border-primary-500 p-6 text-center transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-purple-500/0 group-hover:from-primary-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
              <h3 className="relative text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                {genre}
              </h3>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
