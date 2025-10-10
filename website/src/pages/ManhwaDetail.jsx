import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Star, Eye, Clock, BookOpen, ArrowLeft, Play, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ManhwaDetail() {
  const { slug } = useParams()
  const [manhwa, setManhwa] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const chaptersPerPage = 25

  useEffect(() => {
    // Load manhwa data
    fetch('/data/manhwa-list.json')
      .then(res => res.json())
      .then(data => {
        const manhwaList = data.manhwa || data
        const found = manhwaList.find(m => {
          const manhwaSlug = m.slug || m.url.split('/').filter(Boolean).pop()
          return manhwaSlug === slug
        })
        
        if (found) {
          setManhwa(found)
          
          // Try to load chapters
          const chapterSlug = found.slug || found.url.split('/').filter(Boolean).pop()
          fetch(`/data/chapters/manhwaindo/${chapterSlug}.json`)
            .then(res => res.json())
            .then(chapterData => {
              setChapters(chapterData.chapters || [])
              setLoading(false)
            })
            .catch(() => {
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
      })
      .catch(error => {
        console.error('Error loading manhwa:', error)
        setLoading(false)
      })
  }, [slug])

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

  if (!manhwa) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Manhwa Not Found</h1>
        <Link to="/browse" className="text-primary-400 hover:text-primary-300">
          ← Back to Browse
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link
          to="/browse"
          className="inline-flex items-center space-x-2 text-dark-400 hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Browse</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Background */}
        <div className="absolute inset-0 h-96">
          <img
            src={manhwa.image}
            alt={manhwa.title}
            className="w-full h-full object-cover blur-3xl opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/50 via-dark-900/80 to-dark-900" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-48 sm:w-56 md:w-64 rounded-lg overflow-hidden shadow-2xl border-2 border-dark-700">
                <img
                  src={manhwa.image}
                  alt={manhwa.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 md:space-y-6">
              {/* Title */}
              <div className="text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {manhwa.title}
                </h1>
                <p className="text-dark-400 text-sm md:text-base">{manhwa.type}</p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-2 md:gap-4 justify-center md:justify-start">
                {manhwa.rating && (
                  <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">{manhwa.rating}</span>
                    <span className="text-dark-400 text-sm">Rating</span>
                  </div>
                )}

                {manhwa.status && (
                  <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg">
                    <Clock className="w-5 h-5 text-green-400" />
                    <span className="text-white font-semibold">{manhwa.status}</span>
                  </div>
                )}

                {manhwa.views && (
                  <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-semibold">{manhwa.views}</span>
                    <span className="text-dark-400 text-sm">Views</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 bg-dark-800 px-4 py-2 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">{chapters.length}</span>
                  <span className="text-dark-400 text-sm">Chapters</span>
                </div>
              </div>

              {/* Genres */}
              {manhwa.genres && manhwa.genres.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-dark-400 mb-2">GENRES</h3>
                  <div className="flex flex-wrap gap-2">
                    {manhwa.genres.map((genre, index) => (
                      <Link
                        key={index}
                        to={`/browse?genre=${genre.toLowerCase()}`}
                        className="px-3 py-1 bg-dark-800 hover:bg-primary-500 text-dark-200 hover:text-white rounded-full text-sm transition-colors"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Synopsis */}
              {manhwa.synopsis && (
                <div>
                  <h3 className="text-sm font-semibold text-dark-400 mb-2">SYNOPSIS</h3>
                  <p className="text-dark-200 leading-relaxed">
                    {manhwa.synopsis}
                  </p>
                </div>
              )}

              {/* Read Button */}
              {chapters.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Link
                    to={`/read/${slug}/${chapters[0].number}`}
                    className="inline-flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-6 md:px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Reading</span>
                  </Link>
                  {chapters.length > 1 && (
                    <Link
                      to={`/read/${slug}/${chapters[chapters.length - 1].number}`}
                      className="inline-flex items-center justify-center space-x-2 bg-dark-800 hover:bg-dark-700 text-white px-6 md:px-8 py-3 rounded-lg font-semibold border border-dark-700 transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span className="hidden sm:inline">Read First Chapter</span>
                      <span className="sm:hidden">First Chapter</span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      {chapters.length > 0 && (() => {
        const totalPages = Math.ceil(chapters.length / chaptersPerPage)
        const startIndex = (currentPage - 1) * chaptersPerPage
        const endIndex = startIndex + chaptersPerPage
        const currentChapters = chapters.slice(startIndex, endIndex)
        
        return (
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                All Chapters
              </h2>
              <span className="text-sm md:text-base text-dark-400">
                {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {currentChapters.map((chapter, index) => {
              // Get middle image as thumbnail
              const thumbnail = chapter.images && chapter.images.length > 0 
                ? (() => {
                    const middleIndex = Math.floor(chapter.images.length / 2)
                    const middleImage = chapter.images[middleIndex]
                    return middleImage.url || middleImage.originalUrl
                  })()
                : null
              
              return (
                <Link
                  key={index}
                  to={`/read/${slug}/${chapter.number}`}
                  className="group block"
                >
                  <div className="bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-primary-500 rounded-lg overflow-hidden transition-all">
                    {/* Thumbnail */}
                    {thumbnail ? (
                      <div className="relative w-full aspect-[3/4] overflow-hidden bg-dark-700">
                        <img
                          src={thumbnail}
                          alt={`Chapter ${chapter.number}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="relative w-full aspect-[3/4] bg-dark-700 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-dark-600" />
                      </div>
                    )}
                    
                    {/* Chapter Info */}
                    <div className="p-2">
                      <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors text-xs md:text-sm line-clamp-1">
                        {chapter.title || `Chapter ${chapter.number}`}
                      </h3>
                      {chapter.date && (
                        <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">{chapter.date}</p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center space-y-4">
              <p className="text-dark-400 text-sm">
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage(currentPage - 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === 1
                      ? 'bg-dark-800 text-dark-600 cursor-not-allowed'
                      : 'bg-dark-800 text-white hover:bg-dark-700'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             (page >= currentPage - 1 && page <= currentPage + 1)
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center space-x-2">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-dark-400">...</span>
                        )}
                        <button
                          onClick={() => {
                            setCurrentPage(page)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                            page === currentPage
                              ? 'bg-primary-500 text-white'
                              : 'bg-dark-800 text-white hover:bg-dark-700'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage(currentPage + 1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === totalPages
                      ? 'bg-dark-800 text-dark-600 cursor-not-allowed'
                      : 'bg-primary-500 text-white hover:bg-primary-600'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )
      })()}

      {/* No Chapters */}
      {chapters.length === 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center bg-dark-800 border border-dark-700 rounded-lg p-12">
            <BookOpen className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Chapters Available</h3>
            <p className="text-dark-400">
              Chapters for this manhwa haven't been scraped yet.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
