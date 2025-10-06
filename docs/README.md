# 🎨 Manhwa Scraper - Shinigami Edition

Web scraper untuk mengekstrak data manhwa dari website **Shinigami (07.shinigami.asia)** dan menyimpannya dalam format JSON.

## 🌟 3 Metode Scraping

### 1. ✅ **HTML Manual** (RECOMMENDED)
File: `shinigami-scraper-html.js`
- ✅ Ringan & cepat
- ✅ Tidak perlu install Chrome
- ✅ Copy HTML dari browser → Parse → JSON
- 📖 Baca: `README-SOLUSI.md`

### 2. 🤖 **Puppeteer** (Otomatis)
File: `shinigami-scraper-puppeteer.js`
- ✅ Otomatis scraping
- ✅ Support pagination
- ❌ Perlu install Chrome (~300MB)
- 📖 Baca: `README-PUPPETEER.md`

### 3. 📦 **Axios + Cheerio** (Untuk website static)
File: `scraper.js`
- ✅ Ringan & cepat
- ❌ Tidak bisa scrape Shinigami (JS rendering)
- ✅ Cocok untuk website static
- 📖 Baca: `README-SHINIGAMI.md`

## 📋 Fitur

- ✅ Scrape daftar manhwa (title, rating, views, bookmarks, status)
- ✅ Scrape detail manhwa (author, genres, chapters, description)
- ✅ Scrape URL gambar dari chapter
- ✅ Export ke JSON dengan struktur rapi
- ✅ Generate summary dan statistik
- ✅ Filter data (by rating, status, views)
- ✅ Support pagination

## 🚀 Instalasi

### 1. Pastikan Node.js Terinstall

Cek versi Node.js:
```bash
node --version
```

Jika belum terinstall, download dari: https://nodejs.org/

### 2. Install Dependencies

```bash
npm install
```

Atau install manual:
```bash
npm install axios cheerio fs-extra
```

## 🚀 Quick Start (RECOMMENDED)

### Metode HTML Manual - Paling Mudah!

```bash
# Jalankan scraper dengan sample data
node shinigami-scraper-html.js
```

**Hasil**: File JSON tersimpan di folder `data/`

### Untuk Data Lengkap:

1. **Buka browser** → https://07.shinigami.asia/search
2. **Tekan F12** → Tab Elements
3. **Cari element** `<div class="grid mb-24 lg:grid-cols-2 grid-cols-1 gap-24">`
4. **Klik kanan** → Copy → Copy outerHTML
5. **Buka file** `shinigami-scraper-html.js`
6. **Paste HTML** ke variable `sampleHTML`
7. **Jalankan**: `node shinigami-scraper-html.js`

✅ **Selesai!** Data tersimpan di `data/manhwa-from-html.json`

## 📖 Cara Penggunaan Lanjutan

### A. Scraper HTML (Manual)

```javascript
import ShinigamiScraperHTML from './shinigami-scraper-html.js';

const scraper = new ShinigamiScraperHTML();

// Scrape dari HTML string
const html = `<div class="grid">...</div>`;
const manhwaList = await scraper.scrapeFromHTML(html);

// Atau dari file
const manhwaList = await scraper.scrapeFromFile('page.html');

// Simpan ke JSON
await scraper.saveToJSON(manhwaList, 'result.json');
```

### B. Scraper Puppeteer (Otomatis)

**Install Chrome dulu:**
```bash
npx puppeteer browsers install chrome
```

**Jalankan:**
```javascript
import ShinigamiScraperPuppeteer from './shinigami-scraper-puppeteer.js';

const scraper = new ShinigamiScraperPuppeteer();
await scraper.init();

const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');
await scraper.saveToJSON(manhwaList, 'result.json');

await scraper.close();
```

### C. Scraper Generic (Website Static)

Edit file `scraper.js` dan ganti URL:

```javascript
const baseUrl = 'https://your-manhwa-site.com';
const manhwaUrl = 'https://your-manhwa-site.com/manga/solo-leveling';
const manhwaTitle = 'Solo Leveling';
```

### Langkah 2: Sesuaikan CSS Selector

Setiap website memiliki struktur HTML berbeda. Anda perlu menyesuaikan CSS selector di dua fungsi utama:

**A. Fungsi `getChapterList()` - untuk mengambil daftar chapter:**
```javascript
$('.chapter-list a, .chapter-item a, .wp-manga-chapter a').each((i, elem) => {
  // Sesuaikan selector dengan website target
});
```

**B. Fungsi `getChapterImages()` - untuk mengambil gambar:**
```javascript
$('.reading-content img, .chapter-content img, #readerarea img').each((i, elem) => {
  // Sesuaikan selector dengan website target
});
```

### Langkah 3: Test Scraper

Jalankan test untuk memastikan selector bekerja:

```bash
npm test
```

Atau:
```bash
node test-scraper.js
```

### Langkah 4: Jalankan Scraper

Uncomment kode di fungsi `main()` dalam `scraper.js`, lalu jalankan:

```bash
npm start
```

Atau:
```bash
node scraper.js
```

## 💻 Contoh Kode

### Download Chapter 1-5

```javascript
import ManhwaScraper from './scraper.js';

const scraper = new ManhwaScraper('https://manhwa-site.com');
await scraper.downloadManhwa(
  'https://manhwa-site.com/manga/solo-leveling',
  'Solo Leveling',
  1,  // chapter awal
  5   // chapter akhir
);
```

### Download Semua Chapter

```javascript
await scraper.downloadManhwa(
  'https://manhwa-site.com/manga/solo-leveling',
  'Solo Leveling'
);
```

### Ambil Info Manhwa

```javascript
const info = await scraper.getManhwaInfo(manhwaUrl);
console.log(info.title);
console.log(info.author);
console.log(info.genres);
```

### Ambil Daftar Chapter

```javascript
const chapters = await scraper.getChapterList(manhwaUrl);
console.log(`Total chapter: ${chapters.length}`);
```

## 📁 Struktur Folder

```
scraper web/
├── downloads/              # Folder hasil download
│   └── Solo Leveling/      # Folder per manhwa
│       ├── Chapter 1/      # Folder per chapter
│       │   ├── page_001.jpg
│       │   ├── page_002.jpg
│       │   └── ...
│       └── Chapter 2/
│           └── ...
├── scraper.js              # File utama scraper
├── test-scraper.js         # File untuk testing
├── package.json            # Dependencies
└── README.md               # Dokumentasi
```

## 🔧 Troubleshooting

### 1. Tidak Ada Chapter/Gambar Ditemukan

**Penyebab:** CSS selector tidak sesuai dengan struktur HTML website.

**Solusi:**
- Buka website target di browser
- Klik kanan → Inspect Element
- Lihat struktur HTML untuk daftar chapter dan gambar
- Sesuaikan selector di `getChapterList()` dan `getChapterImages()`

### 2. Error 403 Forbidden

**Penyebab:** Website memblokir request dari bot.

**Solusi:**
- Ubah User-Agent di `this.headers`
- Tambahkan delay lebih lama antar request
- Gunakan proxy jika diperlukan

### 3. Gambar Tidak Bisa Didownload

**Penyebab:** Website menggunakan lazy loading atau proteksi gambar.

**Solusi:**
- Periksa atribut gambar: `data-src`, `data-lazy-src`, dll
- Tambahkan atribut tersebut di fungsi `getChapterImages()`

### 4. Error ECONNRESET / Timeout

**Penyebab:** Koneksi terputus atau website lambat.

**Solusi:**
- Tingkatkan timeout di axios config
- Tambahkan retry logic
- Periksa koneksi internet

## ⚠️ Disclaimer

- Gunakan scraper ini dengan bijak dan hormati Terms of Service website target
- Jangan overload server dengan terlalu banyak request
- Beberapa website melarang scraping - periksa robots.txt
- Untuk penggunaan pribadi saja, jangan untuk komersial
- Hormati hak cipta konten

## 📚 Dependencies

- **axios** (^1.6.0) - HTTP client untuk request
- **cheerio** (^1.0.0-rc.12) - jQuery-like HTML parser
- **fs-extra** (^11.1.1) - File system operations

## 🛠️ Customisasi Lanjutan

### Menambah Delay

Edit fungsi `delay()` atau ubah nilai delay:

```javascript
await this.delay(3000); // 3 detik
```

### Mengubah User-Agent

Edit di constructor:

```javascript
this.headers = {
  'User-Agent': 'Your Custom User Agent'
};
```

### Menambah Referer

Beberapa website memerlukan referer:

```javascript
this.headers = {
  ...this.headers,
  'Referer': 'https://specific-page.com'
};
```

### Download dengan Proxy

Tambahkan proxy config di axios:

```javascript
const response = await axios.get(url, {
  headers: this.headers,
  proxy: {
    host: 'proxy-server.com',
    port: 8080
  }
});
```

## 📝 License

MIT License - Bebas digunakan dan dimodifikasi.

## 🤝 Kontribusi

Silakan fork dan submit pull request untuk improvement!

---

**Happy Scraping! 🎉**
