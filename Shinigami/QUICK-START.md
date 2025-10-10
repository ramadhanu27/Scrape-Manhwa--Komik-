# 🚀 Quick Start - Scrape Manhwa Only

## ⚠️ IMPORTANT: Run in Order!

### **Step 1: Scrape Manhwa List (WAJIB!)**

```bash
cd Shinigami
node scrape-manhwa-only.js
```

**Ini akan:**
- Buka browser ke search page
- Click filter "Manhwa"
- Scrape semua manhwa (bukan manga/manhua)
- Save ke `manhwa-only.json`

**Expected output:**
```
✅ Manhwa filter applied
✅ Found 500 series
💾 Data saved to: manhwa-only.json
```

---

### **Step 2: Scrape Chapters (Manhwa Only)**

```bash
# Test dengan 1 manhwa dulu
node scrape-chapters-url-only.js 1 10 manhwa-only

# Kalau berhasil, scrape lebih banyak
node scrape-chapters-url-only.js 10 all manhwa-only
```

**Ini akan:**
- Load dari `manhwa-only.json`
- Scrape chapters hanya dari manhwa
- Save per manhwa ke `chapters/shinigami/{title}.json`

---

## 🔧 Troubleshooting

### **Error: "manhwa-only.json not found"**

**Solusi:** Run step 1 dulu!
```bash
node scrape-manhwa-only.js
```

---

### **Error: "Manhwa filter button not found"**

**Penyebab:** Website layout berubah atau popup blocking

**Solusi:**
1. Check screenshot: `data/shinigami/debug-filter-not-found.png`
2. Manual click filter "Manhwa" di browser
3. Atau scrape tanpa filter (akan include manga/manhua)

---

### **Error: "Requesting main frame too early"**

**Penyebab:** Request interception conflict

**Solusi:** Sudah diperbaiki di code terbaru. Re-run:
```bash
node scrape-chapters-url-only.js 1 10 manhwa-only
```

---

## 📊 Workflow

```
1. scrape-manhwa-only.js
   ↓
   manhwa-only.json (500 manhwa)
   ↓
2. scrape-chapters-url-only.js ... manhwa-only
   ↓
   chapters/shinigami/*.json
```

---

## ✅ Verification

**Check manhwa-only.json:**
```bash
# Should have ~500 manhwa
cat data/shinigami/manhwa-only.json
```

**Check chapters:**
```bash
# Should have JSON files with manhwa titles
ls chapters/shinigami/
```

---

## 💡 Tips

1. **Always run scrape-manhwa-only.js first**
2. **Test dengan 1 manhwa** sebelum scrape banyak
3. **Check screenshots** jika filter tidak berhasil
4. **Use manhwa-only parameter** untuk filter

---

**Happy Scraping!** 🎉
