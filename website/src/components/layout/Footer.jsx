import { Link } from 'react-router-dom'
import { BookOpen, Github, Twitter, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">
                ManhwaReader
              </span>
            </div>
            <p className="text-dark-400 text-sm">
              Read your favorite manhwa online for free. High quality images and fast updates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-dark-100 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-dark-400 hover:text-primary-400 text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/browse" className="text-dark-400 hover:text-primary-400 text-sm">
                  Browse
                </Link>
              </li>
              <li>
                <Link to="/browse?filter=top-rated" className="text-dark-400 hover:text-primary-400 text-sm">
                  Top Rated
                </Link>
              </li>
              <li>
                <Link to="/browse?filter=latest" className="text-dark-400 hover:text-primary-400 text-sm">
                  Latest Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold text-dark-100 mb-4">Popular Genres</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/browse?genre=action" className="text-dark-400 hover:text-primary-400 text-sm">
                  Action
                </Link>
              </li>
              <li>
                <Link to="/browse?genre=fantasy" className="text-dark-400 hover:text-primary-400 text-sm">
                  Fantasy
                </Link>
              </li>
              <li>
                <Link to="/browse?genre=romance" className="text-dark-400 hover:text-primary-400 text-sm">
                  Romance
                </Link>
              </li>
              <li>
                <Link to="/browse?genre=adventure" className="text-dark-400 hover:text-primary-400 text-sm">
                  Adventure
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-dark-100 mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-dark-700"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:text-primary-400 hover:bg-dark-700"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-dark-400 text-sm">
            © 2025 ManhwaReader. All rights reserved.
          </p>
          <p className="text-dark-400 text-sm flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>for manhwa lovers</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
