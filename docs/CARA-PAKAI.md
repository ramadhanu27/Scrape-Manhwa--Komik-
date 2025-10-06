# 🚀 Cara Scrape Semua Manhwa dari Shinigami

## ✅ Langkah-Langkah (MUDAH!)

### Step 1: Buka Website di Browser
```
https://07.shinigami.asia
```

### Step 2: Save Halaman HTML
1. **Klik kanan** di halaman → **Save As** (atau Ctrl+S)
2. **Save as type**: pilih **"Webpage, Complete"** atau **"HTML Only"**
3. **File name**: `page.html`
4. **Simpan** di folder: `C:\Users\User\Desktop\File HTML\scraper web\`

### Step 3: Jalankan Scraper
```bash
node scrape-from-file.js page.html
```

### Step 4: Lihat Hasil
File JSON akan tersimpan di:
- `data/manhwa-all.json` - Data semua manhwa
- `data/manhwa-all-summary.json` - Summary & statistik

---

## 📋 Alternatif: Copy HTML Manual

Jika tidak mau save file, bisa copy HTML langsung:

### Step 1: Buka Developer Tools
1. Buka https://07.shinigami.asia
2. Tekan **F12** → Tab **Elements**

### Step 2: Copy HTML
1. Cari element: `<div class="grid mb-24 xl:grid-cols-6 lg:grid-cols-4 grid-cols-3 gap-4">`
2. **Klik kanan** → **Copy** → **Copy outerHTML**

### Step 3: Paste ke File
1. Buat file baru: `page.html`
2. Paste HTML yang sudah di-copy
3. Save

### Step 4: Run Scraper
```bash
node scrape-from-file.js page.html
```

---

## 🎯 Contoh Output

```
============================================================
SHINIGAMI SCRAPER - Scrape dari File HTML
============================================================

📂 Membaca file: page.html
✅ File berhasil dibaca (245678 karakter)

📥 Parsing HTML...
✅ Berhasil scrape 24 manhwa!

📊 Hasil Scraping:

1. The Strongest Assassin Gets Transferred to Another World With His Whole Class
   Views: 676.5k | Chapter: CH.96 | Updated: 3h ago
2. Cerberus
   Views: 12.4k | Chapter: CH.10 | Updated: 3h ago
3. Mr. Zombie
   Views: 1.7m | Chapter: CH.133 | Updated: 3h ago
...
24. Return Of The Martial Arts Genius
   Views: 1.4m | Chapter: CH.97 | Updated: 13h ago

============================================================
✅ Selesai! 24 manhwa tersimpan di:
   📁 data/manhwa-all.json
   📁 data/manhwa-all-summary.json
============================================================
```

---

## 💡 Tips

### Scrape Multiple Pages
Untuk scrape halaman 2, 3, dst:

```bash
# Halaman 1
node scrape-from-file.js page1.html

# Halaman 2
node scrape-from-file.js page2.html

# Halaman 3
node scrape-from-file.js page3.html
```

### Gabungkan Semua Data
Setelah scrape beberapa halaman, gabungkan dengan script ini:

```javascript
import fs from 'fs-extra';

const page1 = await fs.readJSON('data/manhwa-all.json');
const page2 = await fs.readJSON('data/manhwa-page2.json');
const page3 = await fs.readJSON('data/manhwa-page3.json');

const allManhwa = [...page1, ...page2, ...page3];

await fs.writeJSON('data/manhwa-complete.json', allManhwa, { spaces: 2 });

console.log(`✅ Total: ${allManhwa.length} manhwa`);
```

---

## 🔧 Troubleshooting

### Q: Tidak ada manhwa yang ditemukan?
**A:** Pastikan file HTML berisi element `<div class="grid">` dengan tag `<a href="/series/">` di dalamnya.

### Q: File tidak ditemukan?
**A:** Pastikan file `page.html` ada di folder yang sama dengan `scrape-from-file.js`.

### Q: Hanya dapat beberapa manhwa?
**A:** Scroll dulu di browser untuk load semua manhwa, baru save HTML.

---

## ✅ Selesai!

Sekarang Anda bisa scrape **semua manhwa** dari Shinigami dengan mudah! 🎉
