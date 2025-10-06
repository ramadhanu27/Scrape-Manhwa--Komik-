# 📖 Local Manhwa Chapter Reader

Sistem untuk membaca manhwa secara lokal dengan chapter images yang sudah di-download.

## 🎯 Fitur

- ✅ Download chapter images ke lokal
- ✅ Chapter reader dengan navigation (prev/next)
- ✅ Jump to chapter dropdown
- ✅ Page counter saat scroll
- ✅ Responsive design
- ✅ Integrasi dengan index.html

## 📁 Struktur Folder

```
scraper web/
├── index.html              # Website utama (manhwa list)
├── chapter.html            # Chapter reader page
├── scrape-chapters.js      # Scraper untuk download chapter images
├── chapters/               # Metadata chapter (JSON)
│   └── [manhwa-slug].json
├── images/
│   └── chapters/           # Chapter images yang di-download
│       └── [manhwa-slug]/
│           ├── chapter-1/
│           │   ├── page-001.jpg
│           │   ├── page-002.jpg
│           │   └── ...
│           ├── chapter-2/
│           └── ...
└── data/
    └── manhwa-real-images.json  # List manhwa
```

## 🚀 Cara Penggunaan

### 1. Scrape Chapter Images

```bash
# Scrape 1 manhwa, 3 chapter pertama
node scrape-chapters.js 1 3

# Scrape 5 manhwa, 5 chapter each
node scrape-chapters.js 5 5

# Scrape 10 manhwa, 10 chapter each
node scrape-chapters.js 10 10
```

**Parameter:**
- Argument 1: Jumlah manhwa yang akan di-scrape
- Argument 2: Jumlah chapter per manhwa

**Output:**
- `chapters/[manhwa-slug].json` - Metadata chapter
- `images/chapters/[manhwa-slug]/chapter-X/` - Gambar chapter

### 2. Buka Website

1. Buka `index.html` di browser
2. Hover card manhwa
3. Klik **"Read Chapter 1"** untuk baca chapter lokal
4. Atau klik **"View on Shinigami"** untuk buka website asli

### 3. Navigasi Chapter

Di halaman `chapter.html`:
- **← Previous** - Chapter sebelumnya
- **Next →** - Chapter selanjutnya
- **Dropdown** - Jump ke chapter tertentu
- **Scroll** - Auto-update page counter

## 📊 Estimasi Waktu & Storage

### Waktu Download:
- **1 chapter** = ~20-50 gambar = ~30-60 detik
- **10 manhwa × 5 chapter** = ~25-50 menit
- **50 manhwa × 10 chapter** = ~4-8 jam

### Storage:
- **1 chapter** = ~5-15 MB (tergantung jumlah & kualitas gambar)
- **10 manhwa × 5 chapter** = ~250-750 MB
- **50 manhwa × 10 chapter** = ~2.5-7.5 GB

## 🔗 URL Format

### Chapter Reader URL:
```
chapter.html?manhwa=[slug]&chapter=[number]
```

**Contoh:**
```
chapter.html?manhwa=07.shinigami.asiaseriesa381c3fa-1155-40f8-84af-f90fe51264f3&chapter=1
```

### Parameter:
- `manhwa` - Slug manhwa (dari field `slug` di JSON)
- `chapter` - Nomor chapter (1, 2, 3, dst)

## 📝 Format Data

### chapters/[manhwa-slug].json
```json
{
  "manhwaSlug": "07.shinigami.asiaseries...",
  "totalChapters": 3,
  "lastUpdated": "2025-10-02T04:45:00.000Z",
  "chapters": [
    {
      "url": "https://07.shinigami.asia/series/.../chapter/1",
      "title": "Chapter 1",
      "number": "1",
      "chapterNumber": "1",
      "totalPages": 45,
      "localUrl": "chapter.html?manhwa=...&chapter=1",
      "images": [
        {
          "page": 1,
          "filename": "page-001.jpg",
          "localPath": "images/chapters/.../chapter-1/page-001.jpg",
          "originalUrl": "https://..."
        }
      ],
      "scrapedAt": "2025-10-02T04:45:00.000Z"
    }
  ]
}
```

## 🎨 Fitur Chapter Reader

### UI Features:
- **Sticky Header** - Navigation tetap di atas saat scroll
- **Page Counter** - Floating counter di kanan bawah
- **Smooth Scroll** - Auto-track current page
- **Lazy Loading** - Images load saat dibutuhkan
- **Dark Theme** - Eye-friendly untuk baca lama

### Navigation:
- **Previous/Next Buttons** - Pindah chapter
- **Chapter Dropdown** - Jump ke chapter tertentu
- **Back to List** - Kembali ke index.html

## ⚠️ Troubleshooting

### Chapter tidak muncul:
1. Pastikan sudah run `node scrape-chapters.js`
2. Cek folder `chapters/` ada file JSON-nya
3. Cek folder `images/chapters/` ada gambar-nya

### Gambar tidak muncul:
1. Cek path di `chapters/[slug].json` benar
2. Pastikan file gambar ada di folder yang sesuai
3. Cek console browser untuk error

### "Chapter data not found":
1. Manhwa belum di-scrape chapter-nya
2. Run: `node scrape-chapters.js 1 3` untuk test

## 🔄 Workflow Lengkap

### Setup Awal:
```bash
# 1. Scrape list manhwa (pagination)
node scrape-real-images.js 10

# 2. Scrape detail manhwa (optional)
node scrape-manhwa-details.js 10

# 3. Scrape chapter images
node scrape-chapters.js 10 5

# 4. Build website
node build-website.js
```

### Update Data:
```bash
# Update manhwa list
node scrape-real-images.js 20

# Download chapter baru
node scrape-chapters.js 5 10

# Rebuild website
node build-website.js
```

## 📱 Mobile Support

Chapter reader fully responsive:
- Touch gestures untuk scroll
- Optimized image loading
- Mobile-friendly navigation

## 🎯 Tips

1. **Start Small** - Test dengan 1-2 manhwa dulu
2. **Check Storage** - Monitor disk space
3. **Batch Download** - Download bertahap untuk koneksi lambat
4. **Backup Data** - Backup folder `chapters/` dan `images/`

## 🚧 Limitations

- Hanya chapter yang sudah di-download yang bisa dibaca
- Perlu re-scrape untuk chapter baru
- Storage bisa besar untuk banyak manhwa

## 📞 Support

Jika ada masalah:
1. Cek console browser (F12)
2. Cek terminal output saat scraping
3. Pastikan semua file ada di folder yang benar
