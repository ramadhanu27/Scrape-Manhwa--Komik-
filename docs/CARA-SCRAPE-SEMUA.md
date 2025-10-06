# 🚀 Cara Scrape Semua Data & Chapter Manhwa dari Shinigami

## 📋 Metode Scraping (Pagination)

Website Shinigami menggunakan **pagination** (halaman 1, 2, 3, dst), bukan infinite scroll.

```bash
# Scrape 10 halaman (default) - sekitar 240 manhwa
node scrape-real-images.js

# Scrape 20 halaman - sekitar 480 manhwa
node scrape-real-images.js 20

# Scrape 50 halaman - sekitar 1200 manhwa
node scrape-real-images.js 50
```

### 2️⃣ **Scrape SEMUA Manhwa**

```bash
# Scrape sampai habis (999 halaman max)
node scrape-real-images.js 999
```

⚠️ **Warning**: Scraping semua manhwa bisa memakan waktu **10-30 menit** tergantung jumlah manhwa di website!

---

## 🎯 Cara Kerja

1. **Browser Otomatis Dibuka**
   - Puppeteer membuka Chrome/Chromium
   - Navigasi ke https://07.shinigami.asia/search

2. **Loop Pagination**
   - Buka halaman 1, 2, 3, dst secara otomatis
   - Extract manhwa dari setiap halaman
   - Berhenti saat tidak ada halaman berikutnya

3. **Extract Data**
   - Ambil semua manhwa dari setiap halaman
   - Extract: title, image URL, views, chapter, dll

4. **Save to JSON**
   - `data/manhwa-real-images.json` - Array manhwa
   - `data/manhwa-all.json` - Dengan metadata

---

## 📊 Estimasi Waktu & Data

| Pages | Manhwa | Waktu  | Ukuran File |
|-------|--------|--------|-------------|
| 10    | ~240   | 1-2 min| ~50 KB      |
| 20    | ~480   | 2-4 min| ~100 KB     |
| 50    | ~1200  | 5-10 min| ~250 KB    |
| 100   | ~2400  | 10-20 min| ~500 KB   |
| 999   | Semua  | 20-40 min| ~1 MB+    |

---

## 🔧 Setelah Scraping

### Build Website

```bash
# Build website dengan data terbaru
node build-website.js

# Buka website
start index.html
```

### Update Data

Jika ingin update data manhwa terbaru:

```bash
# 1. Scrape lagi
node scrape-real-images.js 20

# 2. Build ulang website
node build-website.js

# 3. Refresh browser
```

---

## 💡 Tips

### Scraping Cepat (Recommended)
```bash
# 10-20 halaman sudah cukup untuk melihat manhwa populer
node scrape-real-images.js 15
```

### Scraping Lengkap
```bash
# Untuk database lengkap (semua halaman)
node scrape-real-images.js 999
```

### Background Mode
Edit `scrape-real-images.js` line 18:
```javascript
headless: true, // Ubah dari false ke true
```

Lalu jalankan:
```bash
node scrape-real-images.js 50
```

---

## ⚡ Troubleshooting

### Browser Tidak Muncul
- Pastikan Puppeteer sudah terinstall: `npm install puppeteer`
- Coba install Chrome: `npx puppeteer browsers install chrome`

### Scraping Lambat
- Kurangi jumlah scroll
- Gunakan headless mode
- Pastikan koneksi internet stabil

### Data Tidak Lengkap
- Tunggu beberapa detik setelah scroll
- Coba jalankan ulang dengan scroll lebih banyak

---

## 📝 Contoh Lengkap

```bash
# 1. Scrape 30 scroll (sekitar 720 manhwa)
node scrape-real-images.js 30

# Output:
# ✅ Found 720 manhwa with real images!
# 💾 Data saved to: data/manhwa-all.json

# 2. Build website
node build-website.js

# Output:
# ✅ Loaded 720 manhwa from JSON
# ✅ Created index.html

# 3. Buka website
start index.html
```

---

---

## 📖 Scrape SEMUA Chapter (NEW!)

### Mode "all" - Download Semua Chapter

```bash
cd scrapers

# 1 manhwa, SEMUA chapter
node scrape-chapters.js 1 all

# 10 manhwa, SEMUA chapter each
node scrape-chapters.js 10 all

# SEMUA manhwa (120), SEMUA chapter
node scrape-chapters.js 120 all
```

### Estimasi Waktu & Storage

| Manhwa | Chapters | Waktu Estimasi | Storage |
|--------|----------|----------------|---------|
| 1      | ~50-150  | 30-90 menit    | 250-750 MB |
| 10     | ~500-1500| 5-15 jam       | 2.5-7.5 GB |
| 120    | ~6000+   | 60-180 jam     | 30-90 GB |

⚠️ **Warning**: 
- Scraping semua chapter memakan waktu SANGAT LAMA
- Pastikan disk space cukup
- Koneksi internet stabil
- Bisa dibagi jadi beberapa sesi

### Strategi Scraping

**Bertahap (Recommended):**
```bash
# Hari 1: 10 manhwa pertama
node scrape-chapters.js 10 all

# Hari 2: 10 manhwa berikutnya (edit scraper untuk skip 10 pertama)
# Atau manual pilih manhwa tertentu
```

**Selective:**
```bash
# Hanya manhwa populer (5-10 chapter each)
node scrape-chapters.js 20 10

# Manhwa favorit (semua chapter)
node scrape-chapters.js 5 all
```

---

## 🎉 Selesai!

Website Anda sekarang menampilkan **semua manhwa** dengan gambar asli dari Shinigami! 🚀

Untuk chapter, gunakan mode `all` untuk download semua chapter yang tersedia!
