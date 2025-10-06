# 🎨 Shinigami Scraper dengan Puppeteer

Scraper untuk website **Shinigami (07.shinigami.asia)** menggunakan **Puppeteer** untuk handle JavaScript rendering.

## ⚠️ Mengapa Puppeteer?

Website Shinigami menggunakan **JavaScript framework** (kemungkinan Svelte/React) untuk render konten. Artinya:
- HTML yang diambil dengan `axios` masih kosong
- Konten dimuat setelah JavaScript dijalankan di browser
- Perlu browser automation untuk scraping

**Puppeteer** adalah headless browser yang bisa menjalankan JavaScript dan mengambil HTML setelah konten dimuat.

## 📦 Instalasi

Puppeteer sudah ditambahkan ke `package.json`. Install dengan:

```bash
npm install
```

**Note**: Puppeteer akan download Chromium (~300MB), jadi proses instalasi bisa memakan waktu.

## 🚀 Cara Penggunaan

### Quick Start

```bash
node shinigami-scraper-puppeteer.js
```

### Contoh Kode

```javascript
import ShinigamiScraperPuppeteer from './shinigami-scraper-puppeteer.js';

const scraper = new ShinigamiScraperPuppeteer();

// Inisialisasi browser
await scraper.init();

try {
  // Scrape daftar manhwa
  const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');
  
  // Simpan ke JSON
  await scraper.saveToJSON(manhwaList, 'manhwa-list.json');
  
  // Generate summary
  const summary = scraper.generateSummary(manhwaList);
  await scraper.saveToJSON(summary, 'manhwa-summary.json');
  
} finally {
  // Tutup browser
  await scraper.close();
}
```

## 🔧 Fitur

- ✅ **Puppeteer Integration** - Handle JavaScript rendering
- ✅ **Headless Browser** - Scraping tanpa tampilan GUI
- ✅ **Auto Wait** - Tunggu konten dimuat sebelum scraping
- ✅ **JSON Export** - Simpan hasil ke JSON
- ✅ **Pagination Support** - Scrape multiple pages
- ✅ **Summary Generation** - Statistik dan ranking

## 📊 Format Output

Sama seperti versi axios, output disimpan dalam format JSON:

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
    "scrapedAt": "2025-10-01T14:11:52.000Z"
  }
]
```

## ⚙️ Konfigurasi

### Ubah Wait Time

Default wait time adalah 3 detik. Ubah jika perlu:

```javascript
const html = await this.fetchPage(url, 5000); // 5 detik
```

### Headless Mode

Untuk melihat browser saat scraping (debugging):

```javascript
this.browser = await puppeteer.launch({
  headless: false, // Tampilkan browser
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### Custom Viewport

```javascript
await this.page.setViewport({ 
  width: 1920, 
  height: 1080 
});
```

## 🆚 Perbedaan dengan Axios Version

| Feature | Axios | Puppeteer |
|---------|-------|-----------|
| Speed | ⚡ Cepat | 🐢 Lebih lambat |
| Memory | 💾 Ringan | 🔥 Berat (~300MB) |
| JavaScript | ❌ Tidak support | ✅ Full support |
| Website Static | ✅ Cocok | ⚠️ Overkill |
| Website SPA/React | ❌ Tidak bisa | ✅ Bisa |
| Shinigami | ❌ Tidak bisa | ✅ Bisa |

## 💡 Tips

1. **Tutup Browser**: Selalu panggil `await scraper.close()` setelah selesai
2. **Memory**: Puppeteer memakan banyak memory, jangan scrape terlalu banyak halaman sekaligus
3. **Wait Time**: Sesuaikan wait time berdasarkan kecepatan internet
4. **Headless**: Gunakan headless mode untuk production
5. **Error Handling**: Wrap dalam try-finally untuk memastikan browser tertutup

## 🐛 Troubleshooting

### Error: Browser not found

**Solusi**: Install ulang puppeteer
```bash
npm install puppeteer --force
```

### Error: Timeout

**Penyebab**: Koneksi lambat atau website down

**Solusi**: Tingkatkan timeout
```javascript
await this.page.goto(url, { 
  waitUntil: 'networkidle2', 
  timeout: 120000 // 2 menit
});
```

### Memory Error

**Penyebab**: Scraping terlalu banyak halaman

**Solusi**: 
- Batasi jumlah halaman per run
- Restart browser setiap beberapa halaman
- Tingkatkan RAM

### Scraping Lambat

**Penyebab**: Puppeteer lebih lambat dari axios

**Solusi**:
- Kurangi wait time jika koneksi cepat
- Gunakan `waitUntil: 'domcontentloaded'` instead of `'networkidle2'`
- Disable images untuk speed up:
```javascript
await this.page.setRequestInterception(true);
this.page.on('request', (req) => {
  if (req.resourceType() === 'image') {
    req.abort();
  } else {
    req.continue();
  }
});
```

## 📝 Contoh Use Cases

### 1. Scrape Single Page

```javascript
const scraper = new ShinigamiScraperPuppeteer();
await scraper.init();

const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');
await scraper.saveToJSON(manhwaList, 'manhwa-list.json');

await scraper.close();
```

### 2. Scrape Multiple Pages

```javascript
const scraper = new ShinigamiScraperPuppeteer();
await scraper.init();

const allManhwa = await scraper.scrapeWithPagination('https://07.shinigami.asia/search', 3);
await scraper.saveToJSON(allManhwa, 'manhwa-all-pages.json');

await scraper.close();
```

### 3. Scrape Detail Manhwa

```javascript
const scraper = new ShinigamiScraperPuppeteer();
await scraper.init();

const detail = await scraper.scrapeManhwaDetail('https://07.shinigami.asia/series/xxx/');
await scraper.saveToJSON(detail, 'manhwa-detail.json');

await scraper.close();
```

### 4. Scrape Chapter Images

```javascript
const scraper = new ShinigamiScraperPuppeteer();
await scraper.init();

const images = await scraper.scrapeChapterImages('https://07.shinigami.asia/series/xxx/chapter/1/');
await scraper.saveToJSON(images, 'chapter-images.json');

await scraper.close();
```

## 🔄 Migration dari Axios

Jika Anda sudah menggunakan versi axios, migrasi ke puppeteer sangat mudah:

```javascript
// Sebelum (Axios)
import ShinigamiScraper from './shinigami-scraper.js';
const scraper = new ShinigamiScraper();
const manhwaList = await scraper.scrapeManhwaList(url);

// Sesudah (Puppeteer)
import ShinigamiScraperPuppeteer from './shinigami-scraper-puppeteer.js';
const scraper = new ShinigamiScraperPuppeteer();
await scraper.init(); // Tambahkan ini
const manhwaList = await scraper.scrapeManhwaList(url);
await scraper.close(); // Tambahkan ini
```

## ⚖️ Disclaimer

- Puppeteer memakan banyak resource (CPU & Memory)
- Scraping lebih lambat dibanding axios
- Gunakan dengan bijak, jangan overload server
- Hormati Terms of Service website

## 📞 Support

Jika ada issue atau pertanyaan, silakan buat issue di repository.

---

**Happy Scraping with Puppeteer! 🎉**
