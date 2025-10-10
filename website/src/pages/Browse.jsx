import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, Star, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import ManhwaCard from '../components/manhwa/ManhwaCard'

export default function Browse() {
  const [searchParams] = useSearchParams()
  const [manhwaList, setManhwaList] = useState([])
  const [filteredList, setFilteredList] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24 // 4 rows x 6 columns
  const [filters, setFilters] = useState({
    genre: '',
    status: '',
    rating: '',
    sort: 'latest'
  })

  // Get filter from URL
  const urlFilter = searchParams.get('filter')
  const urlGenre = searchParams.get('genre')

  const [availableGenres, setAvailableGenres] = useState([])

  useEffect(() => {
    fetch('/data/manhwa-list.json')
      .then(res => res.json())
      .then(data => {
        const list = data.manhwa || data
        setManhwaList(list)
        
        // Extract unique genres
        const genresSet = new Set()
        list.forEach(manhwa => {
          if (manhwa.genres && Array.isArray(manhwa.genres)) {
            manhwa.genres.forEach(genre => genresSet.add(genre))
          }
        })
        const sortedGenres = Array.from(genresSet).sort()
        setAvailableGenres(sortedGenres)
        
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading manhwa:', error)
        setLoading(false)
      })
  }, [])

  // Apply URL filters on mount
  useEffect(() => {
    if (urlFilter === 'top-rated') {
      setFilters(prev => ({ ...prev, sort: 'rating', rating: '8' }))
    } else if (urlFilter === 'latest') {
      setFilters(prev => ({ ...prev, sort: 'latest' }))
    }

    if (urlGenre) {
      setFilters(prev => ({ ...prev, genre: urlGenre }))
    }
  }, [urlFilter, urlGenre])

  useEffect(() => {
    let filtered = [...manhwaList]

    // Apply filters
    if (filters.genre) {
      filtered = filtered.filter(m => 
        m.genres && m.genres.some(g => g.toLowerCase().includes(filters.genre.toLowerCase()))
      )
    }

    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status)
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating)
      filtered = filtered.filter(m => parseFloat(m.rating || 0) >= minRating)
    }

    // Apply sorting
    if (filters.sort === 'rating') {
      filtered.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
    } else if (filters.sort === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    }

    setFilteredList(filtered)
    setCurrentPage(1) // Reset to page 1 when filters change
  }, [filters, manhwaList])

  // Calculate pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredList.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  // Get page title based on filter
  const getPageTitle = () => {
    if (urlFilter === 'top-rated') return 'Top Rated Manhwa'
    if (urlFilter === 'latest') return 'Latest Updates'
    if (urlGenre) return `${urlGenre.charAt(0).toUpperCase() + urlGenre.slice(1)} Manhwa`
    return 'Browse Manhwa'
  }

  const getPageIcon = () => {
    if (urlFilter === 'top-rated') return <Star className="w-8 h-8 text-yellow-400" />
    if (urlFilter === 'latest') return <Clock className="w-8 h-8 text-green-400" />
    return <TrendingUp className="w-8 h-8 text-primary-400" />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
            {getPageIcon()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{getPageTitle()}</h1>
            <p className="text-dark-400">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredList.length)} of {filteredList.length} manhwa
            </p>
          </div>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.genre}
            onChange={(e) => setFilters({...filters, genre: e.target.value})}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Genres</option>
            {availableGenres.map((genre, index) => (
              <option key={index} value={genre.toLowerCase()}>
                {genre}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilters({...filters, rating: e.target.value})}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Ratings</option>
            <option value="9">9+ Stars</option>
            <option value="8">8+ Stars</option>
            <option value="7">7+ Stars</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters({...filters, sort: e.target.value})}
            className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="latest">Latest</option>
            <option value="rating">Top Rated</option>
            <option value="title">A-Z</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 text-dark-400 hover:text-white'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Manhwa Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'
          : 'space-y-4'
      }>
        {currentItems.map((manhwa, index) => (
          <ManhwaCard key={index} manhwa={manhwa} viewMode={viewMode} />
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-16">
          <p className="text-dark-400 text-lg">No manhwa found with current filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center space-y-4">
          {/* Page Info */}
          <p className="text-dark-400 text-sm">
            Page {currentPage} of {totalPages}
          </p>

          {/* Pagination Controls */}
          <div className="flex items-center space-x-2">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
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
              {/* First Page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => goToPage(1)}
                    className="w-10 h-10 rounded-lg bg-dark-800 text-white hover:bg-dark-700 transition-colors"
                  >
                    1
                  </button>
                  {currentPage > 4 && (
                    <span className="text-dark-400">...</span>
                  )}
                </>
              )}

              {/* Pages around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === currentPage || 
                         page === currentPage - 1 || 
                         page === currentPage + 1 ||
                         page === currentPage - 2 ||
                         page === currentPage + 2
                })
                .map(page => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                      page === currentPage
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-white hover:bg-dark-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

              {/* Last Page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && (
                    <span className="text-dark-400">...</span>
                  )}
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-10 h-10 rounded-lg bg-dark-800 text-white hover:bg-dark-700 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
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

          {/* Quick Jump */}
          <div className="flex items-center space-x-2">
            <span className="text-dark-400 text-sm">Jump to:</span>
            <select
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="px-3 py-1 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <option key={page} value={page}>
                  Page {page}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}
