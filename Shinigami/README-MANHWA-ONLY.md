# 📖 Shinigami Scraper - Manhwa Only Mode

## 🎯 Cara Scrape Manhwa Saja (Bukan Manga/Manhua)

### **Step 1: Scrape List Manhwa**

Scrape daftar manhwa dengan filter "Manhwa" saja:

```bash
cd Shinigami
node scrape-manhwa-only.js
```

**Output:** `data/shinigami/manhwa-only.json`

---

### **Step 2: Scrape Chapters (Manhwa Only)**

Scrape chapters dari manhwa yang sudah di-filter:

```bash
# Scrape 5 manhwa, 10 chapters each (Manhwa only)
node scrape-chapters-url-only.js 5 10 manhwa-only

# Scrape 10 manhwa, ALL chapters (Manhwa only)
node scrape-chapters-url-only.js 10 all manhwa-only

# Scrape 1 manhwa, 50 chapters (Manhwa only)
node scrape-chapters-url-only.js 1 50 manhwa-only
```

**Parameter:**
- `5` = Jumlah manhwa yang akan di-scrape
- `10` = Jumlah chapters per manhwa (`all` = semua)
- `manhwa-only` = Filter manhwa saja (opsional)

---

## 📊 Perbedaan Mode

### **Mode Normal (Semua: Manga + Manhwa + Manhua)**

```bash
node scrape-chapters-url-only.js 5 10
```

- Load dari: `manhwa-real-images.json`
- Total: ~744 series (semua format)

### **Mode Manhwa-Only**

```bash
node scrape-chapters-url-only.js 5 10 manhwa-only
```

- Load dari: `manhwa-only.json`
- Total: ~500 series (hanya manhwa)
- **Lebih cepat** karena skip manga/manhua

---

## 🔄 Workflow Lengkap

### **1. Scrape Manhwa List (Sekali Saja)**

```bash
node scrape-manhwa-only.js
```

Output:
```
✅ Found 500 manhwa
💾 Data saved to: manhwa-only.json
```

---

### **2. Scrape Chapters (Bisa Diulang)**

```bash
# Test dengan 1 manhwa dulu
node scrape-chapters-url-only.js 1 10 manhwa-only

# Kalau berhasil, scrape lebih banyak
node scrape-chapters-url-only.js 10 all manhwa-only

# Scrape semua manhwa (batch)
node scrape-chapters-url-only.js 50 all manhwa-only
```

---

## 📁 Output Files

### **Manhwa List:**
```
data/shinigami/manhwa-only.json
```

Format:
```json
{
  "source": "07.shinigami.asia",
  "filter": "Manhwa only",
  "totalManhwa": 500,
  "manhwa": [...]
}
```

### **Chapters:**
```
chapters/shinigami/{slug}.json
```

Format:
```json
{
  "manhwaSlug": "8d05a538-1530-40fe-bc90-b1761ddbe98e",
  "manhwaTitle": "Breakers",
  "manhwaUrl": "https://07.shinigami.asia/series/...",
  "totalChapters": 20,
  "chapters": [
    {
      "number": "20",
      "title": "Chapter 20",
      "url": "https://...",
      "totalPages": 17,
      "images": [
        {
          "page": 1,
          "url": "https://delivery.shngm.id/...",
          "originalUrl": "https://delivery.shngm.id/..."
        }
      ]
    }
  ]
}
```

---

## ✅ Features

✅ **Filter Manhwa only** (skip manga/manhua)  
✅ **Auto-save every 5 chapters** (tidak kehilangan progress)  
✅ **Skip existing chapters** (resume scraping)  
✅ **Retry mechanism** (3x retry jika error)  
✅ **URL-only** (tidak download images)  
✅ **File JSON per manhwa** (mudah di-manage)  

---

## 🚀 Quick Start

```bash
# 1. Scrape manhwa list (sekali saja)
node scrape-manhwa-only.js

# 2. Scrape chapters (manhwa only)
node scrape-chapters-url-only.js 10 all manhwa-only
```

---

## 💡 Tips

1. **Scrape manhwa list dulu** sebelum scrape chapters
2. **Gunakan `manhwa-only`** parameter untuk skip manga/manhua
3. **Auto-save setiap 5 chapters** jadi aman kalau error
4. **Resume scraping** otomatis skip chapters yang sudah ada
5. **Test dengan 1 manhwa** dulu sebelum scrape banyak

---

## 📝 Notes

- **manhwa-only.json** harus di-generate dulu dengan `scrape-manhwa-only.js`
- Kalau file tidak ada, akan fallback ke `manhwa-real-images.json` (semua format)
- Scraper otomatis skip chapters yang sudah di-scrape sebelumnya
- Auto-save setiap 5 chapters untuk prevent data loss

---

**Happy Scraping!** 🎉
