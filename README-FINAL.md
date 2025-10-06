# 🚀 Multi-Website Manhwa Scraper

Scraper untuk mengambil data manhwa dan chapter dari multiple website dengan struktur terorganisir.

## 📊 Supported Websites

| Website | Manhwa | Status | Features |
|---------|--------|--------|----------|
| **07.shinigami.asia** | 744 | ✅ Active | List, Chapters, Images, Pagination |
| **manhwaindo.app** | 150+ | ✅ Active | List, Chapters, Images, Scroll |

---

## 📁 Struktur Folder

```
scraper web/
├── data/
│   ├── shinigami/          # Data dari Shinigami
│   └── manhwaindo/         # Data dari ManhwaIndo
│
├── chapters/
│   ├── shinigami/          # Chapter JSON Shinigami
│   └── manhwaindo/         # Chapter JSON ManhwaIndo
│
├── images/chapters/
│   ├── shinigami/          # Images Shinigami
│   └── manhwaindo/         # Images ManhwaIndo
│
├── scrapers/               # Scraper Shinigami
└── manhwaindo/             # Scraper ManhwaIndo
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Scrape Shinigami
```bash
cd scrapers

# Scrape manhwa list (10 pages = ~240 manhwa)
node scrape-real-images.js 10

# Scrape chapters (5 manhwa, all chapters)
node scrape-chapters.js 5 all
```

### 3. Scrape ManhwaIndo
```bash
cd manhwaindo

# Scrape manhwa list (10 pages = ~300 manhwa)
node scrape-manhwaindo.js 10

# Scrape chapters (5 manhwa, all chapters)
node scrape-chapters-manhwaindo.js 5 all
```

---

## 📖 Detailed Usage

### Shinigami (07.shinigami.asia)

**Scrape Manhwa List:**
```bash
cd scrapers
node scrape-real-images.js [pages]

# Examples:
node scrape-real-images.js 5    # 5 pages (~120 manhwa)
node scrape-real-images.js 10   # 10 pages (~240 manhwa)
node scrape-real-images.js 999  # All pages (~744 manhwa)
```

**Scrape Chapters:**
```bash
node scrape-chapters.js [manhwa] [chapters]

# Examples:
node scrape-chapters.js 1 5     # 1 manhwa, 5 chapters
node scrape-chapters.js 10 10   # 10 manhwa, 10 chapters each
node scrape-chapters.js 5 all   # 5 manhwa, ALL chapters
node scrape-chapters.js 744 all # ALL manhwa, ALL chapters
```

**Output:**
- `data/shinigami/manhwa-all.json`
- `chapters/shinigami/[slug].json`
- `images/chapters/shinigami/[Manhwa]/chapter-X/`

---

### ManhwaIndo (manhwaindo.app)

**Scrape Manhwa List:**
```bash
cd manhwaindo
node scrape-manhwaindo.js [pages]

# Examples:
node scrape-manhwaindo.js 5    # 5 pages (~150 manhwa)
node scrape-manhwaindo.js 10   # 10 pages (~300 manhwa)
node scrape-manhwaindo.js 80   # All pages (~2400 manhwa)
```

**Scrape Chapters:**
```bash
node scrape-chapters-manhwaindo.js [manhwa] [chapters]

# Examples:
node scrape-chapters-manhwaindo.js 1 5     # 1 manhwa, 5 chapters
node scrape-chapters-manhwaindo.js 10 10   # 10 manhwa, 10 chapters each
node scrape-chapters-manhwaindo.js 5 all   # 5 manhwa, ALL chapters
```

**Output:**
- `data/manhwaindo/manhwa-list.json`
- `chapters/manhwaindo/[slug].json`
- `images/chapters/manhwaindo/[Manhwa]/chapter-X/`

---

## ⚡ Optimizations

### Shinigami Scraper Features:
- ✅ **Batch Download** (10 images parallel) - 5x faster
- ✅ **Direct URLs Mode** - 15x faster
- ✅ **Request Interception** - Skip page rendering
- ✅ **Smart Fallback** - Auto switch to browser mode if needed
- ✅ **Ad Filtering** - Skip .gif ads automatically

### ManhwaIndo Scraper Features:
- ✅ **Scroll Loading** - Auto scroll untuk load semua chapter
- ✅ **Batch Download** (10 images parallel)
- ✅ **URL Pagination** - Direct navigate tanpa click
- ✅ **Multiple Selectors** - Fallback jika struktur berubah

---

## 📊 Performance

### Shinigami:
| Task | Time (Before) | Time (After) | Speedup |
|------|---------------|--------------|---------|
| 1 chapter | 8 sec | 2 sec | **4x** |
| 24 chapters | 3 min | 48 sec | **3.75x** |
| 100 chapters | 13 min | 3.5 min | **3.7x** |

### ManhwaIndo:
| Task | Manhwa | Time |
|------|--------|------|
| List (10 pages) | ~300 | 2-4 min |
| Chapters (5 manhwa, all) | ~400 ch | 20-40 min |

---

## 📝 Data Format

### Manhwa List JSON:
```json
{
  "source": "shinigami.asia",
  "totalManhwa": 744,
  "manhwa": [
    {
      "title": "I am Self-disciplined And Invincible",
      "url": "https://...",
      "image": "https://...",
      "latestChapter": "CH.131",
      "status": "Ongoing",
      "views": "496.3k"
    }
  ]
}
```

### Chapter JSON:
```json
{
  "manhwaSlug": "genius-archers-streaming-id",
  "manhwaTitle": "Genius Archer's Streaming ID",
  "totalChapters": 83,
  "chapters": [
    {
      "number": "83",
      "title": "Chapter 83",
      "url": "https://...",
      "totalPages": 19,
      "images": [
        {
          "page": 1,
          "filename": "page-001.jpg",
          "localPath": "images/chapters/manhwaindo/.../page-001.jpg",
          "originalUrl": "https://..."
        }
      ]
    }
  ]
}
```

---

## 🔧 Configuration

### Batch Size (Speed vs Stability):
Edit scraper files:

```javascript
// Fast (good connection)
this.batchSize = 15;

// Balanced (default)
this.batchSize = 10;

// Safe (slow connection)
this.batchSize = 5;
```

### Headless Mode (Faster):
```javascript
headless: true  // Change from false
```

### Wait Time:
```javascript
setTimeout(resolve, 1000)  // Reduce from 2000 if stable
```

---

## 📈 Storage Requirements

### Per Manhwa (Average):
- Manhwa list: ~2 KB
- Chapter metadata: ~20 KB
- Images (50 chapters): ~500 MB - 1 GB

### Total Estimates:
| Scenario | Manhwa | Chapters | Storage |
|----------|--------|----------|---------|
| Small | 10 | 100 | ~5 GB |
| Medium | 50 | 500 | ~25 GB |
| Large | 100 | 1000 | ~50 GB |
| Full (Shinigami) | 744 | ~6000 | ~300 GB |
| Full (ManhwaIndo) | 150 | ~2400 | ~120 GB |

---

## 🎯 Use Cases

### 1. Personal Archive
```bash
# Scrape favorite manhwa
node scrape-chapters.js 10 all
```

### 2. Database Building
```bash
# Get all manhwa metadata
node scrape-real-images.js 999
node scrape-manhwaindo.js 80
```

### 3. Specific Manhwa
```bash
# Edit manhwa list to keep only specific ones
# Then scrape chapters
node scrape-chapters.js 5 all
```

### 4. Latest Updates
```bash
# Scrape first few pages (latest updates)
node scrape-real-images.js 5
node scrape-chapters.js 5 10  # Latest 10 chapters
```

---

## 🔄 Maintenance

### Update Data:
```bash
# Re-scrape to get latest
cd scrapers
node scrape-real-images.js 10

cd ../manhwaindo
node scrape-manhwaindo.js 10
```

### Cleanup:
```bash
# Remove old data
Remove-Item -Recurse "chapters/shinigami/*"
Remove-Item -Recurse "images/chapters/shinigami/*"
```

### Backup:
```bash
# Backup specific website
Compress-Archive -Path "data/shinigami", "chapters/shinigami" -DestinationPath "backup-shinigami.zip"
```

---

## 📚 Documentation

- `STRUKTUR-FOLDER.md` - Detailed folder structure
- `OPTIMASI-SCRAPER.md` - Performance optimizations
- `QUICK-START.txt` - Quick reference
- `scrapers/README.md` - Shinigami scraper docs
- `manhwaindo/README.md` - ManhwaIndo scraper docs

---

## 🐛 Troubleshooting

### No manhwa found:
- Check internet connection
- Verify website is accessible
- Check if selectors changed (website update)

### Chapter not loading:
- Increase wait time
- Check pagination/scroll logic
- Verify chapter URL format

### Images not downloading:
- Check image URLs
- Reduce batch size
- Check disk space

### Rate limiting:
- Reduce batch size
- Add delays between requests
- Use headless mode

---

## 🎉 Features Summary

### ✅ Implemented:
- Multi-website support (Shinigami, ManhwaIndo)
- Organized folder structure
- Batch parallel downloads (10x)
- Direct URL mode (15x faster)
- Auto pagination/scroll
- Ad filtering
- Error handling
- Progress tracking
- Resume capability

### 📝 Future Enhancements:
- More websites support
- Web UI for browsing
- Auto-update scheduler
- Database integration
- Search functionality
- Reading interface

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Verify folder structure
3. Check console output for errors
4. Review scraper logs

---

**Version**: 2.0.0
**Last Updated**: 2025-10-04
**Status**: ✅ Production Ready
**Total Websites**: 2
**Total Potential Manhwa**: 900+
