# ✅ Solusi Scraper Shinigami - Tanpa Puppeteer

## 🎯 Masalah

Website Shinigami menggunakan JavaScript untuk render konten, sehingga:
- ❌ Axios tidak bisa scrape (HTML masih kosong)
- ❌ Puppeteer perlu install Chrome (~300MB) dan berat

## 💡 Solusi: Scrape dari HTML Manual

Gunakan **`shinigami-scraper-html.js`** yang parse HTML yang Anda copy dari browser.

## 🚀 Cara Menggunakan

### Metode 1: Gunakan Sample HTML (Quick Test)

```bash
node shinigami-scraper-html.js
```

File ini sudah berisi sample HTML dan langsung bisa dijalankan!

### Metode 2: Copy HTML dari Browser (Full Data)

**Step 1**: Buka website di browser
```
https://07.shinigami.asia/search
```

**Step 2**: Buka Developer Tools
- Tekan `F12` atau `Ctrl+Shift+I`
- Atau klik kanan → Inspect

**Step 3**: Copy HTML
1. Di tab Elements, cari element `<div class="grid mb-24 lg:grid-cols-2 grid-cols-1 gap-24">`
2. Klik kanan pada element tersebut
3. Pilih **Copy → Copy outerHTML**

**Step 4**: Paste ke scraper
1. Buka file `shinigami-scraper-html.js`
2. Cari variable `sampleHTML` (sekitar line 140)
3. Replace dengan HTML yang Anda copy
4. Save file

**Step 5**: Jalankan scraper
```bash
node shinigami-scraper-html.js
```

## 📊 Hasil Output

Data disimpan di folder `data/`:

### manhwa-from-html.json
```json
[
  {
    "title": "The Strongest Assassin Gets Transferred to Another World With His Whole Class",
    "url": "https://07.shinigami.asia/series/02d63ee2-df25-4b49-8893-ae8146b1c923/",
    "slug": "02d63ee2-df25-4b49-8893-ae8146b1c923",
    "image": "https://storage.shngm.id/thumbnail/cover/c8a6676ff239.jpeg",
    "latestChapter": "Chapter 96",
    "status": "Ongoing",
    "rating": "0",
    "views": "676.5k",
    "bookmarks": "3.1k",
    "description": "Manga The strongest assassin...",
    "scrapedAt": "2025-10-01T07:17:51.202Z"
  }
]
```

### manhwa-summary-html.json
```json
{
  "totalManhwa": 2,
  "byStatus": {
    "Ongoing": 2
  },
  "topRated": [
    {
      "title": "Cerberus",
      "rating": "7.5",
      "url": "https://07.shinigami.asia/series/..."
    }
  ],
  "mostViewed": [
    {
      "title": "The Strongest Assassin...",
      "views": "676.5k",
      "url": "https://07.shinigami.asia/series/..."
    }
  ],
  "generatedAt": "2025-10-01T07:17:51.209Z"
}
```

## 🎨 Kustomisasi

### Scrape dari File HTML

Jika Anda sudah save HTML ke file:

```javascript
import ShinigamiScraperHTML from './shinigami-scraper-html.js';

const scraper = new ShinigamiScraperHTML();

// Scrape dari file
const manhwaList = await scraper.scrapeFromFile('shinigami-page.html');
await scraper.saveToJSON(manhwaList, 'result.json');
```

### Scrape dari String HTML

```javascript
const scraper = new ShinigamiScraperHTML();

const htmlString = `<div class="grid">...</div>`;
const manhwaList = await scraper.scrapeFromHTML(htmlString);
await scraper.saveToJSON(manhwaList, 'result.json');
```

## 📋 Perbandingan Metode

| Metode | Kelebihan | Kekurangan |
|--------|-----------|------------|
| **HTML Manual** ✅ | • Ringan<br>• Cepat<br>• Tidak perlu install Chrome<br>• Mudah digunakan | • Manual copy HTML<br>• Tidak otomatis |
| **Puppeteer** | • Otomatis<br>• Bisa pagination | • Berat (~300MB)<br>• Lambat<br>• Perlu install Chrome |
| **Axios** | • Ringan<br>• Cepat | • Tidak bisa scrape Shinigami<br>• Tidak support JS rendering |

## 💡 Tips

### 1. Scrape Multiple Pages

Untuk scrape banyak halaman:
1. Buka halaman 1 → Copy HTML → Paste → Run
2. Buka halaman 2 → Copy HTML → Paste → Run
3. Gabungkan semua JSON hasil

### 2. Otomasi dengan Browser Extension

Gunakan browser extension seperti:
- **Web Scraper** (Chrome Extension)
- **Data Miner** (Chrome Extension)
- **Scraper** (Chrome Extension)

### 3. Combine dengan Puppeteer (Optional)

Jika Chrome sudah terinstall, gunakan Puppeteer untuk otomasi:
```bash
# Install Chrome untuk Puppeteer
npx puppeteer browsers install chrome

# Jalankan scraper Puppeteer
node shinigami-scraper-puppeteer.js
```

## 🔧 Troubleshooting

### Data Tidak Lengkap

**Penyebab**: HTML yang di-copy tidak lengkap

**Solusi**: 
- Pastikan copy element `<div class="grid">` yang berisi semua manhwa
- Scroll ke bawah dulu untuk load semua manhwa
- Copy dari parent element yang lebih besar

### Format JSON Error

**Penyebab**: HTML mengandung karakter special

**Solusi**: Sudah di-handle otomatis oleh Cheerio

### Selector Tidak Cocok

**Penyebab**: Website update struktur HTML

**Solusi**: Update selector di file `shinigami-scraper-html.js`

## 📝 Contoh Lengkap

```javascript
import ShinigamiScraperHTML from './shinigami-scraper-html.js';

async function scrapeManual() {
  const scraper = new ShinigamiScraperHTML();
  
  // HTML yang di-copy dari browser
  const htmlFromBrowser = `
    <div class="grid mb-24 lg:grid-cols-2 grid-cols-1 gap-24">
      <!-- Paste HTML di sini -->
    </div>
  `;
  
  // Scrape
  const manhwaList = await scraper.scrapeFromHTML(htmlFromBrowser);
  
  // Simpan
  await scraper.saveToJSON(manhwaList, 'manhwa-list.json');
  
  // Generate summary
  const summary = scraper.generateSummary(manhwaList);
  await scraper.saveToJSON(summary, 'summary.json');
  
  // Tampilkan
  console.log(`Total: ${manhwaList.length} manhwa`);
  manhwaList.forEach(m => {
    console.log(`- ${m.title} (${m.status})`);
  });
}

scrapeManual();
```

## ✅ Kesimpulan

**Rekomendasi**: Gunakan **`shinigami-scraper-html.js`** karena:
- ✅ Tidak perlu install Chrome
- ✅ Ringan dan cepat
- ✅ Mudah digunakan
- ✅ Hasil sama dengan Puppeteer

**Kapan Gunakan Puppeteer**:
- Perlu scrape ratusan halaman otomatis
- Perlu scrape secara berkala (scheduled)
- Tidak masalah dengan resource berat

---

**Happy Scraping! 🎉**
