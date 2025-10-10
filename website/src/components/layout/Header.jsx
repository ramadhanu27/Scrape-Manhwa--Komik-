import { Link } from 'react-router-dom'
import { Search, Menu, BookOpen, Star, TrendingUp, X } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass border-b border-dark-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">
              ManhwaReader
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link 
              to="/browse" 
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse</span>
            </Link>
            <Link 
              to="/browse?filter=top-rated" 
              className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 transition-colors"
            >
              <Star className="w-4 h-4" />
              <span>Top Rated</span>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
              <input
                type="text"
                placeholder="Search manhwa..."
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-dark-100 placeholder-dark-400"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-dark-300 hover:text-primary-400"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-dark-700/50 animate-slide-down">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search manhwa..."
                  className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-dark-100 placeholder-dark-400"
                />
              </div>

              {/* Mobile Nav Links */}
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Home</span>
              </Link>
              <Link 
                to="/browse" 
                className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BookOpen className="w-5 h-5" />
                <span>Browse</span>
              </Link>
              <Link 
                to="/browse?filter=top-rated" 
                className="flex items-center space-x-2 text-dark-300 hover:text-primary-400 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Star className="w-5 h-5" />
                <span>Top Rated</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
