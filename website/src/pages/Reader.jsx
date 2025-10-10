import { useParams, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  Settings,
  Maximize,
  X,
  Play,
  Pause
} from 'lucide-react'

export default function Reader() {
  const { slug, chapter } = useParams()
  const navigate = useNavigate()
  const [manhwa, setManhwa] = useState(null)
  const [currentChapter, setCurrentChapter] = useState(null)
  const [allChapters, setAllChapters] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showChapterList, setShowChapterList] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    readingMode: 'vertical', // 'vertical' or 'horizontal'
    imageWidth: 'fit', // 'fit', 'full', or percentage number
    fullscreen: false,
    autoScroll: false,
    scrollSpeed: 1 // pixels per frame
  })
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    loadChapter()
  }, [slug, chapter])

  // Auto scroll effect
  useEffect(() => {
    let scrollInterval
    
    if (settings.autoScroll && isScrolling) {
      scrollInterval = setInterval(() => {
        window.scrollBy({
          top: settings.scrollSpeed,
          behavior: 'auto'
        })
        
        // Stop at bottom
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
          setIsScrolling(false)
        }
      }, 16) // ~60fps
    }
    
    return () => {
      if (scrollInterval) clearInterval(scrollInterval)
    }
  }, [settings.autoScroll, isScrolling, settings.scrollSpeed])

  const loadChapter = async () => {
    try {
      setLoading(true)

      // Load manhwa data
      const manhwaRes = await fetch('/data/manhwa-list.json')
      const manhwaData = await manhwaRes.json()
      const manhwaList = manhwaData.manhwa || manhwaData
      const foundManhwa = manhwaList.find(m => {
        const manhwaSlug = m.slug || m.url.split('/').filter(Boolean).pop()
        return manhwaSlug === slug
      })

      if (!foundManhwa) {
        setLoading(false)
        return
      }

      setManhwa(foundManhwa)

      // Load chapters
      const chapterSlug = foundManhwa.slug || foundManhwa.url.split('/').filter(Boolean).pop()
      const chaptersRes = await fetch(`/data/chapters/manhwaindo/${chapterSlug}.json`)
      const chaptersData = await chaptersRes.json()
      const chapters = chaptersData.chapters || []

      setAllChapters(chapters)

      // Find current chapter
      const found = chapters.find(ch => ch.number === chapter)
      if (found) {
        setCurrentChapter(found)
        setImages(found.images || [])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading chapter:', error)
      setLoading(false)
    }
  }

  const goToChapter = (chapterNumber) => {
    navigate(`/read/${slug}/${chapterNumber}`)
    setShowChapterList(false)
    window.scrollTo(0, 0)
  }

  const goToPrevChapter = () => {
    const currentIndex = allChapters.findIndex(ch => ch.number === chapter)
    if (currentIndex < allChapters.length - 1) {
      goToChapter(allChapters[currentIndex + 1].number)
    }
  }

  const goToNextChapter = () => {
    const currentIndex = allChapters.findIndex(ch => ch.number === chapter)
    if (currentIndex > 0) {
      goToChapter(allChapters[currentIndex - 1].number)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setSettings({ ...settings, fullscreen: true })
    } else {
      document.exitFullscreen()
      setSettings({ ...settings, fullscreen: false })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading chapter...</p>
        </div>
      </div>
    )
  }

  if (!manhwa || !currentChapter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Chapter Not Found</h1>
          <Link to={`/manhwa/${slug}`} className="text-primary-400 hover:text-primary-300">
            ← Back to Manhwa
          </Link>
        </div>
      </div>
    )
  }

  const currentIndex = allChapters.findIndex(ch => ch.number === chapter)
  const hasPrev = currentIndex < allChapters.length - 1
  const hasNext = currentIndex > 0

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-dark-900/95 backdrop-blur-sm border-b border-dark-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button */}
            <Link
              to={`/manhwa/${slug}`}
              className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>

            {/* Center: Chapter Info */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-white font-semibold truncate">
                {manhwa.title}
              </h1>
              <p className="text-sm text-dark-400">
                {currentChapter.title || `Chapter ${currentChapter.number}`}
              </p>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowChapterList(!showChapterList)}
                className="p-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                title="Chapter List"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List Sidebar */}
      {showChapterList && (
        <div className="fixed inset-0 z-40 flex">
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowChapterList(false)}
          />
          <div className="w-80 bg-dark-900 border-l border-dark-800 overflow-y-auto">
            <div className="sticky top-0 bg-dark-900 border-b border-dark-800 p-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">Chapters</h2>
              <button
                onClick={() => setShowChapterList(false)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>
            <div className="p-2">
              {allChapters.map((ch, index) => (
                <button
                  key={index}
                  onClick={() => goToChapter(ch.number)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    ch.number === chapter
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">
                    {ch.title || `Chapter ${ch.number}`}
                  </div>
                  {ch.date && (
                    <div className="text-xs opacity-75 mt-1">{ch.date}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-start justify-center pt-20">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <div className="relative bg-dark-900 border border-dark-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Reader Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-dark-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Image Width Mode */}
              <div>
                <label className="block text-sm font-semibold text-dark-400 mb-3">
                  Image Width
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSettings({...settings, imageWidth: 'fit'})}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      settings.imageWidth === 'fit'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                    }`}
                  >
                    <span className="font-semibold">Fit to Screen</span>
                    <span className="text-sm opacity-75">(Max 900px)</span>
                  </button>
                  <button
                    onClick={() => setSettings({...settings, imageWidth: 'full'})}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      settings.imageWidth === 'full'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                    }`}
                  >
                    <span className="font-semibold">Full Width</span>
                    <span className="text-sm opacity-75">(100%)</span>
                  </button>
                </div>
              </div>

              {/* Auto Scroll */}
              <div>
                <label className="block text-sm font-semibold text-dark-400 mb-3">
                  Auto Scroll
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setSettings({...settings, autoScroll: !settings.autoScroll})
                      if (!settings.autoScroll) {
                        setIsScrolling(true)
                      } else {
                        setIsScrolling(false)
                      }
                    }}
                    className={`w-full p-3 rounded-lg font-semibold transition-colors ${
                      settings.autoScroll
                        ? 'bg-green-500 text-white'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                    }`}
                  >
                    {settings.autoScroll ? '✓ Auto Scroll ON' : 'Auto Scroll OFF'}
                  </button>
                  
                  {settings.autoScroll && (
                    <div>
                      <label className="block text-xs text-dark-400 mb-2">
                        Speed: {settings.scrollSpeed}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.5"
                        value={settings.scrollSpeed}
                        onChange={(e) => setSettings({...settings, scrollSpeed: parseFloat(e.target.value)})}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-dark-500 mt-1">
                        <span>Slow</span>
                        <span>Fast</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fullscreen */}
              <div>
                <button
                  onClick={toggleFullscreen}
                  className="w-full flex items-center justify-between p-4 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                >
                  <span className="text-white font-semibold">Fullscreen Mode</span>
                  <Maximize className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Images */}
      <div className="w-full py-4">
        {images.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-dark-400 text-lg">No images found for this chapter</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {images.map((image, index) => {
              const imageUrl = image.url || image.originalUrl
              return (
                <div key={index} className="w-full flex justify-center bg-black">
                  <img
                    src={imageUrl}
                    alt={`Page ${image.page}`}
                    className="w-full h-auto object-contain"
                    style={{ 
                      maxWidth: settings.imageWidth === 'fit' ? '900px' : '100%',
                      width: '100%'
                    }}
                    loading={index < 3 ? 'eager' : 'lazy'}
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl)
                      e.target.parentElement.innerHTML = `
                        <div class="bg-dark-800 border border-dark-700 rounded-lg p-8 text-center w-full max-w-4xl">
                          <p class="text-dark-400">Failed to load page ${image.page}</p>
                          <p class="text-xs text-dark-500 mt-2 break-all">${imageUrl}</p>
                        </div>
                      `
                    }}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-4 mt-8 mb-16">
          <button
            onClick={goToPrevChapter}
            disabled={!hasPrev}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              hasPrev
                ? 'bg-dark-800 hover:bg-dark-700 text-white'
                : 'bg-dark-800/50 text-dark-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Previous Chapter</span>
          </button>

          <button
            onClick={goToNextChapter}
            disabled={!hasNext}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
              hasNext
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-dark-800/50 text-dark-600 cursor-not-allowed'
            }`}
          >
            <span>Next Chapter</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Navigation Buttons */}
      <div className="fixed top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none z-40">
        <div className="container mx-auto px-4 flex justify-between">
          {/* Previous Chapter Button */}
          {hasPrev && (
            <button
              onClick={goToPrevChapter}
              className="pointer-events-auto w-12 h-12 bg-dark-800/90 hover:bg-primary-500 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all group"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          
          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Next Chapter Button */}
          {hasNext && (
            <button
              onClick={goToNextChapter}
              className="pointer-events-auto w-12 h-12 bg-dark-800/90 hover:bg-primary-500 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center transition-all group"
              title="Next Chapter"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Auto Scroll Button */}
      {settings.autoScroll && (
        <button
          onClick={() => setIsScrolling(!isScrolling)}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-50 ${
            isScrolling
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-primary-500 hover:bg-primary-600'
          }`}
          title={isScrolling ? 'Pause Auto Scroll' : 'Play Auto Scroll'}
        >
          {isScrolling ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </button>
      )}
    </div>
  )
}
