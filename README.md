# 📚 Multi-Website Manhwa Scraper

Scraper untuk mengambil data manhwa dan chapter dari multiple website dengan optimasi parallel processing.

## 🌐 Supported Websites

| Website | Manhwa | Features |
|---------|--------|----------|
| **07.shinigami.asia** | 744+ | List, Chapters, Images, Direct URLs |
| **manhwaindo.app** | 2400+ | List, Chapters, Images, Details, Parallel |

---

## 📦 Installation

### 1. Install Dependencies
```bash
npm install
```

**Required packages:**
- `puppeteer` - Browser automation
- `fs-extra` - File operations

---

## 🚀 Quick Start Guide

### A. Scraping dari Shinigami (07.shinigami.asia)

#### 1️⃣ Scrape Manhwa List
```bash
cd scrapers
node scrape-real-images.js 10
```

**Penjelasan:**
- `10` = Jumlah halaman yang akan di-scrape
- Setiap halaman berisi ~24 manhwa
- Total: 10 × 24 = ~240 manhwa
- **Output**: `data/shinigami/manhwa-all.json`

**Variasi:**
```bash
node scrape-real-images.js 5    # 5 pages (~120 manhwa)
node scrape-real-images.js 20   # 20 pages (~480 manhwa)
node scrape-real-images.js 999  # All pages (~744 manhwa)
```

#### 2️⃣ Scrape Chapters & Images
```bash
node scrape-chapters.js 5 10
```

**Penjelasan:**
- `5` = Jumlah manhwa yang akan di-scrape
- `10` = Jumlah chapter per manhwa
- Browser akan terbuka dan scrape otomatis
- **Output**: 
  - `chapters/shinigami/[slug].json` - Chapter metadata
  - `images/chapters/shinigami/[Manhwa]/chapter-X/` - Downloaded images

**Variasi:**
```bash
node scrape-chapters.js 1 5     # Test: 1 manhwa, 5 chapters
node scrape-chapters.js 10 all  # 10 manhwa, SEMUA chapters
node scrape-chapters.js 5 all   # 5 manhwa, SEMUA chapters
```

**Fitur Optimasi:**
- ✅ Batch download (10 images parallel)
- ✅ Direct URLs mode (15x faster)
- ✅ Auto filter ads (.gif)

---

### B. Scraping dari ManhwaIndo (manhwaindo.app)

#### 1️⃣ Scrape Manhwa List (Basic Info)
```bash
cd manhwaindo
node scrape-manhwaindo.js 10
```

**Penjelasan:**
- `10` = Jumlah halaman
- Setiap halaman ~30 manhwa
- Total: 10 × 30 = ~300 manhwa
- **Output**: `data/manhwaindo/manhwa-list.json`
- **Data**: Title, URL, Image, Type, Chapter, Rating

**Variasi:**
```bash
node scrape-manhwaindo.js 5     # 5 pages (~150 manhwa)
node scrape-manhwaindo.js 20    # 20 pages (~600 manhwa)
node scrape-manhwaindo.js 80    # All pages (~2400 manhwa)
```

#### 2️⃣ Scrape Manhwa List (WITH DETAILS)
```bash
node scrape-manhwaindo.js 10 details 10
```

**Penjelasan:**
- `10` = Jumlah halaman
- `details` = Mode scrape detail (Status, Author, Genres, Synopsis)
- `10` = Parallel count (10 manhwa sekaligus)
- Browser akan buka 10 tabs sekaligus
- **Output**: `data/manhwaindo/manhwa-list.json` (dengan detail lengkap)

**Variasi Parallel Count:**
```bash
node scrape-manhwaindo.js 10 details 5   # 5x parallel (safe, ~20 min)
node scrape-manhwaindo.js 10 details 10  # 10x parallel (fast, ~10 min)
node scrape-manhwaindo.js 10 details 20  # 20x parallel (very fast, ~5 min)
```

**Rekomendasi:**
- PC Biasa: `5` parallel
- PC Bagus (8GB+ RAM): `10` parallel
- PC Powerful (16GB+ RAM): `20` parallel

#### 3️⃣ Scrape Chapters & Images
```bash
node scrape-chapters-manhwaindo.js 5 10
```

**Penjelasan:**
- `5` = Jumlah manhwa
- `10` = Jumlah chapter per manhwa
- **Output**:
  - `chapters/manhwaindo/[slug].json`
  - `images/chapters/manhwaindo/[Manhwa]/chapter-X/`

**Variasi:**
```bash
node scrape-chapters-manhwaindo.js 1 5     # Test: 1 manhwa, 5 chapters
node scrape-chapters-manhwaindo.js 5 all   # 5 manhwa, ALL chapters
node scrape-chapters-manhwaindo.js 10 all  # 10 manhwa, ALL chapters
```

---

## 📊 Output Structure

```
scraper web/
├── data/
│   ├── shinigami/
│   │   └── manhwa-all.json          # 744 manhwa dari Shinigami
│   └── manhwaindo/
│       └── manhwa-list.json         # 2400 manhwa dari ManhwaIndo
│
├── chapters/
│   ├── shinigami/
│   │   └── [slug].json              # Chapter metadata
│   └── manhwaindo/
│       └── [slug].json
│
└── images/chapters/
    ├── shinigami/
    │   └── [Manhwa-Name]/
    │       └── chapter-X/
    │           ├── page-001.jpg
    │           ├── page-002.jpg
    │           └── ...
    └── manhwaindo/
        └── [Manhwa-Name]/
            └── chapter-X/
                └── page-XXX.jpg
```

---

## 🎯 Complete Workflow Examples

### Example 1: Quick Test (5 minutes)
```bash
# 1. Scrape 5 pages manhwa list
cd scrapers
node scrape-real-images.js 5

# 2. Scrape 1 manhwa, 3 chapters
node scrape-chapters.js 1 3

# Result: 1 manhwa dengan 3 chapters downloaded
```

### Example 2: Medium Collection (30 minutes)
```bash
# 1. Scrape 10 pages from Shinigami
cd scrapers
node scrape-real-images.js 10

# 2. Scrape 5 manhwa, all chapters
node scrape-chapters.js 5 all

# 3. Scrape 10 pages from ManhwaIndo (basic)
cd ../manhwaindo
node scrape-manhwaindo.js 10

# Result: ~340 manhwa list + 5 manhwa full chapters
```

### Example 3: Full Database (2-3 hours)
```bash
# 1. Scrape ALL from Shinigami
cd scrapers
node scrape-real-images.js 999

# 2. Scrape 20 manhwa, all chapters
node scrape-chapters.js 20 all

# 3. Scrape ALL from ManhwaIndo with details
cd ../manhwaindo
node scrape-manhwaindo.js 80 details 10

# Result: ~3000+ manhwa with details + 20 manhwa full chapters
```

---

## ⚡ Performance Tips

### 1. Headless Mode (Faster)
Untuk mode details ManhwaIndo, tambahkan `headless`:
```bash
node scrape-manhwaindo.js 10 details 10 headless
```
**Benefit**: +30% faster, no browser UI

### 2. Increase Parallel Count
Untuk PC powerful:
```bash
node scrape-manhwaindo.js 10 details 20
```
**Benefit**: 2x faster than default

### 3. Batch Size Adjustment
Edit `scrape-chapters.js` line 16:
```javascript
this.batchSize = 15; // Increase from 10
```

---

## 🔧 Troubleshooting

### Browser tidak muncul
```bash
# Install Puppeteer browser
npx puppeteer browsers install chrome
```

### Error "Cannot find module"
```bash
npm install
```

### Scraping lambat
- Increase parallel count
- Enable headless mode
- Check internet connection

### Data tidak lengkap
- Increase wait time di scraper
- Reduce parallel count
- Run again

---

## 📝 Command Reference

### Shinigami:
```bash
cd scrapers
node scrape-real-images.js [pages]
node scrape-chapters.js [manhwa] [chapters|all]
```

### ManhwaIndo:
```bash
cd manhwaindo
node scrape-manhwaindo.js [pages] [details] [parallel_count] [headless]
node scrape-chapters-manhwaindo.js [manhwa] [chapters|all]
```

---

## 🌐 Website

### ARManhwa Website
Website untuk menampilkan data manhwa dengan UI modern:

```bash
cd website-armanhwa
# Buka index.html di browser
```

**Features:**
- ✅ Responsive design
- ✅ Search & filter
- ✅ Beautiful UI
- ✅ Real-time stats
- ✅ Data from ManhwaIndo

**Preview:**
- Grid layout dengan cards
- Search by title/genre
- Filter: All, Ongoing, Completed, Popular
- Direct link ke manhwa

---

## 📚 Documentation

- `STRUKTUR-FOLDER.md` - Detailed folder structure
- `scrapers/README.md` - Shinigami scraper docs  
- `manhwaindo/README.md` - ManhwaIndo scraper docs
- `website-armanhwa/README.md` - Website documentation

---

## 🎉 Success Indicators

**Scraping berhasil jika:**
- ✅ File JSON terbuat di folder `data/`
- ✅ File JSON berisi array manhwa
- ✅ Folder `images/chapters/` berisi gambar
- ✅ Console menampilkan "✅ Scraping complete!"

**Check hasil:**
```bash
# Check manhwa list
cat data/shinigami/manhwa-all.json
cat data/manhwaindo/manhwa-list.json

# Check chapters
ls chapters/shinigami/
ls chapters/manhwaindo/

# Check images
ls images/chapters/shinigami/
ls images/chapters/manhwaindo/
```

---

**Version**: 2.0  
**Last Updated**: 2025-10-06  
**Status**: ✅ Production Ready
