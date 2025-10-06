# 🎨 Shinigami Manhwa Scraper

Scraper khusus untuk website **Shinigami (07.shinigami.asia)** yang mengekstrak data manhwa dan menyimpannya dalam format JSON.

## 🌟 Fitur

- ✅ Scrape daftar manhwa dari halaman search/home
- ✅ Scrape detail manhwa (judul, author, rating, views, dll)
- ✅ Scrape daftar chapter dari setiap manhwa
- ✅ Scrape URL gambar dari setiap chapter
- ✅ Support pagination (scrape multiple pages)
- ✅ Export ke JSON dengan struktur rapi
- ✅ Generate summary dan statistik
- ✅ Filter data (by rating, status, views)
- ✅ Rate limiting untuk menghindari banned

## 📦 Instalasi

Dependencies sudah terinstall. Jika belum, jalankan:

```bash
npm install
```

## 🚀 Cara Penggunaan

### Quick Start

Jalankan contoh dasar:

```bash
node shinigami-example.js
```

Atau jalankan scraper langsung:

```bash
node shinigami-scraper.js
```

### Contoh 1: Scrape Daftar Manhwa

```javascript
import ShinigamiScraper from './shinigami-scraper.js';

const scraper = new ShinigamiScraper();

// Scrape satu halaman
const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');

// Simpan ke JSON
await scraper.saveToJSON(manhwaList, 'manhwa-list.json');
```

### Contoh 2: Scrape dengan Pagination

```javascript
// Scrape 3 halaman sekaligus
const allManhwa = await scraper.scrapeWithPagination(
  'https://07.shinigami.asia/search',
  3  // jumlah halaman
);

await scraper.saveToJSON(allManhwa, 'manhwa-all-pages.json');
```

### Contoh 3: Scrape Detail Manhwa

```javascript
// Scrape detail dari URL manhwa
const detail = await scraper.scrapeManhwaDetail(
  'https://07.shinigami.asia/series/05bbcbc4-56a6-47e6-ac36-1d482339a322/'
);

await scraper.saveToJSON(detail, 'manhwa-detail.json');
```

### Contoh 4: Scrape Gambar Chapter

```javascript
// Scrape gambar dari chapter
const images = await scraper.scrapeChapterImages(
  'https://07.shinigami.asia/series/xxx/chapter/1/'
);

await scraper.saveToJSON(images, 'chapter-images.json');
```

### Contoh 5: Generate Summary

```javascript
const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');

// Generate summary statistik
const summary = scraper.generateSummary(manhwaList);

await scraper.saveToJSON(summary, 'summary.json');
```

### Contoh 6: Filter Data

```javascript
const allManhwa = await scraper.scrapeWithPagination('https://07.shinigami.asia/search', 2);

// Filter manhwa dengan rating > 8
const highRated = allManhwa.filter(m => parseFloat(m.rating) > 8);
await scraper.saveToJSON(highRated, 'high-rated.json');

// Filter manhwa Ongoing
const ongoing = allManhwa.filter(m => m.status === 'Ongoing');
await scraper.saveToJSON(ongoing, 'ongoing.json');

// Filter manhwa populer (views > 1M)
const popular = allManhwa.filter(m => {
  const views = scraper.parseViews(m.views);
  return views > 1000000;
});
await scraper.saveToJSON(popular, 'popular.json');
```

## 📊 Format Data JSON

### Manhwa List

```json
[
  {
    "title": "Solo Leveling",
    "url": "https://07.shinigami.asia/series/xxx/",
    "slug": "xxx",
    "image": "https://storage.shngm.id/...",
    "latestChapter": "Chapter 200",
    "status": "Ongoing",
    "rating": "9.4",
    "views": "21.3m",
    "bookmarks": "37.5k",
    "description": "...",
    "scrapedAt": "2025-10-01T14:06:56.000Z"
  }
]
```

### Manhwa Detail

```json
{
  "title": "Solo Leveling",
  "url": "https://07.shinigami.asia/series/xxx/",
  "image": "https://storage.shngm.id/...",
  "description": "...",
  "author": "Chugong",
  "status": "Ongoing",
  "rating": "9.4",
  "views": "21.3m",
  "bookmarks": "37.5k",
  "genres": ["Action", "Fantasy", "Adventure"],
  "totalChapters": 200,
  "chapters": [
    {
      "title": "Chapter 1",
      "url": "https://07.shinigami.asia/series/xxx/chapter/1/",
      "number": 1
    }
  ],
  "scrapedAt": "2025-10-01T14:06:56.000Z"
}
```

### Chapter Images

```json
{
  "manhwa": "Solo Leveling",
  "chapter": "Chapter 1",
  "url": "https://07.shinigami.asia/series/xxx/chapter/1/",
  "images": [
    {
      "url": "https://storage.shngm.id/image1.jpg",
      "index": 1,
      "alt": "Page 1"
    }
  ],
  "totalImages": 50,
  "scrapedAt": "2025-10-01T14:06:56.000Z"
}
```

### Summary

```json
{
  "totalManhwa": 100,
  "byStatus": {
    "Ongoing": 80,
    "Completed": 20
  },
  "topRated": [
    {
      "title": "Solo Leveling",
      "rating": "9.4",
      "url": "https://..."
    }
  ],
  "mostViewed": [
    {
      "title": "Solo Leveling",
      "views": "21.3m",
      "url": "https://..."
    }
  ],
  "generatedAt": "2025-10-01T14:06:56.000Z"
}
```

## 📁 Struktur Folder

```
scraper web/
├── data/                           # Folder hasil scraping (JSON)
│   ├── manhwa-list.json
│   ├── manhwa-summary.json
│   ├── manhwa-detail-*.json
│   └── chapter-images.json
├── shinigami-scraper.js            # File utama scraper
├── shinigami-example.js            # Contoh penggunaan lengkap
├── package.json
└── README-SHINIGAMI.md
```

## 🎯 Use Cases

### 1. Database Manhwa
Scrape semua manhwa dan buat database lokal:

```bash
node shinigami-example.js
# Uncomment example2_ScrapeMultiplePages()
```

### 2. Monitor Manhwa Favorit
Scrape detail manhwa spesifik untuk cek update chapter:

```bash
node shinigami-example.js
# Uncomment example5_ScrapeSpecificManhwa()
```

### 3. Analisis Popularitas
Generate statistik dan ranking manhwa:

```bash
node shinigami-example.js
# Uncomment example6_FilterAndExport()
```

### 4. Backup Chapter
Scrape dan simpan URL gambar untuk backup:

```bash
node shinigami-example.js
# Uncomment example4_ScrapeChapterImages()
```

## 🔧 Kustomisasi

### Ubah Jumlah Halaman Pagination

Edit di `shinigami-example.js`:

```javascript
await scraper.scrapeWithPagination('https://07.shinigami.asia/search', 5); // 5 halaman
```

### Ubah Delay Antar Request

Edit di `shinigami-scraper.js`:

```javascript
await this.delay(3000); // 3 detik
```

### Tambah Filter Custom

```javascript
// Filter manhwa dengan keyword di title
const filtered = allManhwa.filter(m => 
  m.title.toLowerCase().includes('leveling')
);
```

## ⚠️ Tips & Best Practices

1. **Rate Limiting**: Jangan scrape terlalu cepat, gunakan delay yang cukup
2. **Pagination**: Mulai dengan 1-3 halaman dulu untuk testing
3. **Error Handling**: Cek hasil JSON untuk memastikan data lengkap
4. **Storage**: File JSON bisa besar jika scrape banyak data
5. **Updates**: Website bisa berubah struktur HTML-nya, perlu update selector

## 🐛 Troubleshooting

### Data Kosong / Tidak Ada Hasil

**Penyebab**: Selector HTML tidak cocok atau website berubah struktur

**Solusi**:
1. Buka website di browser
2. Inspect element untuk cek struktur HTML terbaru
3. Update selector di `shinigami-scraper.js`

### Error 403 / Blocked

**Penyebab**: Website memblokir scraping

**Solusi**:
1. Tambah delay lebih lama (3-5 detik)
2. Ubah User-Agent di `this.headers`
3. Gunakan proxy jika diperlukan

### JSON Tidak Tersimpan

**Penyebab**: Folder `data/` tidak ada atau permission error

**Solusi**:
1. Folder otomatis dibuat oleh scraper
2. Cek permission folder
3. Cek disk space

## 📝 Changelog

### v1.0.0 (2025-10-01)
- ✅ Initial release
- ✅ Support scraping manhwa list
- ✅ Support scraping manhwa detail
- ✅ Support scraping chapter images
- ✅ JSON export functionality
- ✅ Pagination support
- ✅ Summary generation
- ✅ Filter utilities

## 🤝 Kontribusi

Silakan fork dan submit pull request untuk improvement!

## ⚖️ Disclaimer

- Gunakan scraper ini dengan bijak dan hormati Terms of Service website
- Jangan overload server dengan terlalu banyak request
- Untuk penggunaan pribadi saja, bukan untuk komersial
- Hormati hak cipta konten

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository.

---

**Happy Scraping! 🎉**
