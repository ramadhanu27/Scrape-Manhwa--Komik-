# ⚡ Quick Start - Shinigami Scraper

## 🎯 Tujuan
Scrape data manhwa dari **https://07.shinigami.asia** dan simpan ke JSON.

## ✅ Solusi Tercepat (5 Menit)

### Step 1: Test dengan Sample Data

```bash
node shinigami-scraper-html.js
```

✅ **Hasil**: 2 manhwa tersimpan di `data/manhwa-from-html.json`

### Step 2: Scrape Data Lengkap

#### A. Buka Website di Browser
```
https://07.shinigami.asia/search
```

#### B. Copy HTML
1. Tekan **F12** (atau Ctrl+Shift+I)
2. Tab **Elements**
3. Cari element: `<div class="grid mb-24 lg:grid-cols-2 grid-cols-1 gap-24">`
4. Klik kanan → **Copy** → **Copy outerHTML**

#### C. Paste ke Scraper
1. Buka file: `shinigami-scraper-html.js`
2. Cari baris ~140: `const sampleHTML = ...`
3. Replace dengan HTML yang Anda copy
4. Save file

#### D. Jalankan Scraper
```bash
node shinigami-scraper-html.js
```

✅ **Selesai!** Semua manhwa tersimpan di `data/manhwa-from-html.json`

## 📊 Hasil Output

### manhwa-from-html.json
```json
[
  {
    "title": "Solo Leveling",
    "url": "https://07.shinigami.asia/series/xxx/",
    "image": "https://storage.shngm.id/...",
    "latestChapter": "Chapter 200",
    "status": "Ongoing",
    "rating": "9.4",
    "views": "21.3m",
    "bookmarks": "37.5k",
    "description": "..."
  }
]
```

### manhwa-summary-html.json
```json
{
  "totalManhwa": 24,
  "byStatus": {
    "Ongoing": 20,
    "Completed": 4
  },
  "topRated": [...],
  "mostViewed": [...]
}
```

## 🎨 Visualisasi Proses

```
Browser (Shinigami.asia)
    ↓
Copy HTML (F12 → Elements)
    ↓
Paste ke shinigami-scraper-html.js
    ↓
Run: node shinigami-scraper-html.js
    ↓
JSON Output (data/manhwa-from-html.json)
```

## 💡 Tips

### Scrape Multiple Pages

**Halaman 1:**
1. Copy HTML → Paste → Run
2. Rename output: `manhwa-page1.json`

**Halaman 2:**
1. Klik "Next Page" di website
2. Copy HTML → Paste → Run
3. Rename output: `manhwa-page2.json`

**Gabungkan:**
```javascript
const page1 = require('./data/manhwa-page1.json');
const page2 = require('./data/manhwa-page2.json');
const all = [...page1, ...page2];
fs.writeFileSync('manhwa-all.json', JSON.stringify(all, null, 2));
```

### Filter Data

```javascript
import ShinigamiScraperHTML from './shinigami-scraper-html.js';

const scraper = new ShinigamiScraperHTML();
const manhwaList = await scraper.scrapeFromFile('data/manhwa-from-html.json');

// Filter rating > 8
const highRated = manhwaList.filter(m => parseFloat(m.rating) > 8);

// Filter Ongoing
const ongoing = manhwaList.filter(m => m.status === 'Ongoing');

// Filter views > 1M
const popular = manhwaList.filter(m => 
  scraper.parseViews(m.views) > 1000000
);
```

## 🔧 Troubleshooting

### Q: Tidak ada data / 0 manhwa?
**A:** Pastikan copy element `<div class="grid">` yang benar. Scroll dulu untuk load semua manhwa.

### Q: Error saat parse HTML?
**A:** Cek apakah HTML lengkap. Pastikan ada tag penutup `</div>`.

### Q: Ingin scrape otomatis tanpa copy manual?
**A:** Gunakan Puppeteer:
```bash
npx puppeteer browsers install chrome
node shinigami-scraper-puppeteer.js
```

## 📚 Dokumentasi Lengkap

- **README.md** - Overview semua metode
- **README-SOLUSI.md** - Detail metode HTML manual
- **README-PUPPETEER.md** - Detail metode Puppeteer
- **README-SHINIGAMI.md** - Detail metode Axios (website static)

## ✅ Checklist

- [x] Node.js terinstall
- [x] Dependencies terinstall (`npm install`)
- [x] Test dengan sample data
- [ ] Copy HTML dari browser
- [ ] Paste ke scraper
- [ ] Run scraper
- [ ] Cek hasil JSON

---

**Selamat Scraping! 🎉**

Jika ada pertanyaan, baca dokumentasi lengkap di file README lainnya.
