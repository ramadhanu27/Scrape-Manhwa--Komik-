# 📚 Shinigami Manhwa Scraper & Reader

Scraper dan local reader untuk manhwa dari 07.shinigami.asia

## 📁 Struktur Folder

```
scraper web/
├── scrapers/              # Script scraper
│   ├── scrape-real-images.js       # Scrape list manhwa (pagination)
│   ├── scrape-manhwa-details.js    # Scrape detail manhwa
│   └── scrape-chapters.js          # Download chapter images
├── website/               # Template website
│   ├── manhwa-website.html         # Template utama
│   ├── build-website.js            # Build script
│   ├── index.html                  # Website hasil build
│   ├── chapters.html               # List chapter
│   └── chapter.html                # Chapter reader
├── data/                  # Data hasil scraping
│   ├── manhwa-all.json
│   ├── manhwa-real-images.json
│   └── manhwa-detailed.json
├── chapters/              # Metadata chapter
│   └── [manhwa-slug].json
├── images/                # Gambar yang di-download
│   └── chapters/
│       └── [manhwa-slug]/
│           └── chapter-X/
├── docs/                  # Dokumentasi
├── archive/               # File lama (tidak dipakai)
├── package.json
└── README.md
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Scrape Manhwa List
```bash
cd scrapers
node scrape-real-images.js 10
```
- Scrape 10 halaman (240 manhwa)
- Output: `data/manhwa-all.json`

### 3. Download Chapter Images
```bash
cd scrapers
node scrape-chapters.js 5 3
```
- Scrape 5 manhwa pertama
- Download 3 chapter per manhwa
- Output: `chapters/` dan `images/chapters/`

### 4. Build Website
```bash
cd website
node build-website.js
cd ..
node embed-data.js
```
- Generate `index.html` dengan data embedded
- Embed data ke `manhwa-detail.html`
- Bisa dibuka langsung tanpa server

### 5. Buka Website
```
Buka: index.html (di root folder)
```

**PENTING**: Gunakan `index.html` di root folder, bukan di `website/`!

## 📖 Cara Pakai

### Scrape Manhwa List
```bash
cd scrapers

# Scrape 5 halaman
node scrape-real-images.js 5

# Scrape semua (240 manhwa)
node scrape-real-images.js 10
```

### Scrape Detail Manhwa (Optional)
```bash
cd scrapers

# Scrape detail 10 manhwa
node scrape-manhwa-details.js 10

# Scrape detail semua
node scrape-manhwa-details.js 240
```

### Download Chapter Images
```bash
cd scrapers

# Test: 1 manhwa, 2 chapter
node scrape-chapters.js 1 2

# Normal: 10 manhwa, 5 chapter each
node scrape-chapters.js 10 5

# ALL chapters: 1 manhwa, semua chapter
node scrape-chapters.js 1 all

# ALL chapters: 10 manhwa, semua chapter each
node scrape-chapters.js 10 all

# ALL chapters: Semua manhwa (120), semua chapter
node scrape-chapters.js 120 all
```

### Build Website
```bash
cd website
node build-website.js
```

## 🌐 Navigasi Website

```
index.html (manhwa list)
    ↓ (click title)
manhwa-detail.html (detail manhwa + chapter list)
    ↓ (click chapter)
chapter.html (baca chapter dengan gambar)

ATAU

index.html (manhwa list)
    ↓ (click "Read Chapters")
chapters.html (simple chapter list)
    ↓ (click chapter)
chapter.html (baca chapter dengan gambar)
```

## ⚙️ Konfigurasi

### Ubah Jumlah Manhwa per Halaman
Edit `scrapers/scrape-real-images.js`:
```javascript
// Default: 24 manhwa per halaman
```

### Ubah Headless Mode
Edit scraper files:
```javascript
headless: false  // Browser terlihat
headless: true   // Background (lebih cepat)
```

## 📊 Estimasi

### Waktu:
- **List manhwa** (10 pages): ~2-3 menit
- **Detail manhwa** (100 manhwa): ~5-8 menit
- **Chapter images** (1 chapter): ~30-60 detik
- **Chapter images** (10 manhwa × 5 chapter): ~25-50 menit

### Storage:
- **1 chapter**: ~5-15 MB
- **10 manhwa × 5 chapter**: ~250-750 MB
- **50 manhwa × 10 chapter**: ~2.5-7.5 GB

## 🔧 Troubleshooting

### "Chapters Not Found"
```bash
# Download chapter dulu
cd scrapers
node scrape-chapters.js 1 3
```

### "Failed to fetch"
- Pastikan file JSON ada di folder `chapters/`
- Cek path relatif sudah benar

### Browser tidak muncul
- Set `headless: false` di scraper

### Gambar tidak muncul
- Cek folder `images/chapters/[slug]/`
- Pastikan download selesai

## 📝 File Penting

### Scrapers (jangan dihapus):
- ✅ `scrapers/scrape-real-images.js`
- ✅ `scrapers/scrape-manhwa-details.js`
- ✅ `scrapers/scrape-chapters.js`

### Website (jangan dihapus):
- ✅ `website/manhwa-website.html`
- ✅ `website/build-website.js`
- ✅ `website/index.html`
- ✅ `website/chapters.html`
- ✅ `website/chapter.html`

### Data (hasil scraping):
- ✅ `data/`
- ✅ `chapters/`
- ✅ `images/`

### Archive (boleh dihapus):
- ❌ `archive/` - File lama yang tidak dipakai

## 🎯 Tips

1. **Start Small**: Test dengan 1-2 manhwa dulu
2. **Check Storage**: Monitor disk space
3. **Batch Download**: Download bertahap
4. **Backup**: Backup folder `chapters/` dan `images/`

## 📚 Dokumentasi Lengkap

Lihat folder `docs/` untuk dokumentasi detail:
- `CARA-PAKAI.md`
- `README-CHAPTER-READER.md`
- `README-PUPPETEER.md`

## 🐛 Known Issues

- Pagination bisa gagal jika koneksi lambat
- Beberapa gambar mungkin iklan (bukan chapter)
- Chapter number bisa tidak urut

## 📞 Support

Jika ada masalah:
1. Cek console browser (F12)
2. Cek terminal output
3. Pastikan path folder benar
