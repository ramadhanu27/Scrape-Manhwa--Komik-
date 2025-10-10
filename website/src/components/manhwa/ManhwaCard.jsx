import { Link } from 'react-router-dom'
import { Star, Eye, Clock, BookOpen } from 'lucide-react'

export default function ManhwaCard({ manhwa, viewMode = 'grid' }) {
  const slug = manhwa.slug || manhwa.url.split('/').filter(Boolean).pop()

  // Grid View (default)
  if (viewMode === 'grid') {
    return (
      <Link
        to={`/manhwa/${slug}`}
        className="group block"
      >
        <div className="relative overflow-hidden rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20">
          {/* Cover Image */}
          <div className="relative aspect-[2/3] overflow-hidden">
            <img
              src={manhwa.image}
              alt={manhwa.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Rating Badge */}
            {manhwa.rating && (
              <div className="absolute top-2 right-2 flex items-center space-x-1 bg-dark-900/90 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-white">
                  {manhwa.rating}
                </span>
              </div>
            )}

            {/* Latest Chapter Badge */}
            {manhwa.latestChapter && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary-500/90 text-white">
                  {manhwa.latestChapter}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            {/* Title */}
            <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1 group-hover:text-primary-400 transition-colors">
              {manhwa.title}
            </h3>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-dark-400">
              {manhwa.latestChapter && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{manhwa.latestChapter}</span>
                </div>
              )}

              {manhwa.views && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{manhwa.views}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  // List View
  return (
    <Link
      to={`/manhwa/${slug}`}
      className="group block"
    >
      <div className="flex gap-4 bg-dark-800 border border-dark-700 hover:border-primary-500 rounded-lg p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20">
        {/* Cover Image */}
        <div className="flex-shrink-0 w-24 sm:w-32">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <img
              src={manhwa.image}
              alt={manhwa.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
            
            {/* Latest Chapter Badge */}
            {manhwa.latestChapter && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-primary-500/90 text-white">
                  UP
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="font-bold text-white text-lg mb-2 group-hover:text-primary-400 transition-colors line-clamp-1">
            {manhwa.title}
          </h3>

          {/* Latest Chapter */}
          {manhwa.latestChapter && (
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-primary-400">{manhwa.latestChapter}</span>
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-semibold">
                Ongoing
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center space-x-4 mb-3">
            {manhwa.rating && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-semibold text-white">{manhwa.rating}</span>
              </div>
            )}

            {manhwa.views && (
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-dark-300">{manhwa.views}</span>
              </div>
            )}

            {manhwa.totalChapters && (
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-dark-300">{manhwa.totalChapters}</span>
              </div>
            )}
          </div>

          {/* Synopsis */}
          {manhwa.synopsis && (
            <p className="text-sm text-dark-400 line-clamp-2 mb-3">
              {manhwa.synopsis}
            </p>
          )}

          {/* Genres */}
          {manhwa.genres && manhwa.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {manhwa.genres.slice(0, 4).map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-dark-700 text-dark-300 rounded text-xs"
                >
                  {genre}
                </span>
              ))}
              {manhwa.genres.length > 4 && (
                <span className="px-2 py-1 bg-dark-700 text-dark-300 rounded text-xs">
                  +{manhwa.genres.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
