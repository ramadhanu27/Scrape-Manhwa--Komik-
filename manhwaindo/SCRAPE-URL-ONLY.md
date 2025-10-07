# ⚡ Scrape Chapters (URL Only - No Download)

Script untuk scrape chapter URLs **TANPA download images**. 10x lebih cepat!

---

## 🚀 Quick Start

### Command Format:
```bash
node scrape-chapters-url-only.js <manhwaCount> <maxChapters> <parallelCount>
```

### Examples:

**Scrape 1 manhwa, ALL chapters:**
```bash
node scrape-chapters-url-only.js 1 null 8
```

**Scrape 5 manhwa, 50 chapters each:**
```bash
node scrape-chapters-url-only.js 5 50 8
```

**Scrape 75 manhwa (top rated), ALL chapters:**
```bash
node scrape-chapters-url-only.js 75 null 10
```

---

## ⚡ Speed Comparison

| Method | Time (100 chapters) | Storage | Offline |
|--------|---------------------|---------|---------|
| **URL Only** | ~5 min | ~1 MB | ❌ |
| Download Images | ~50 min | ~1 GB | ✅ |

**10x FASTER!** ⚡

---

## 📊 Output Format

### JSON Structure:
```json
{
  "manhwaTitle": "Be the Actor",
  "manhwaUrl": "https://manhwaindo.app/series/be-the-actor/",
  "totalChapters": 140,
  "scrapedAt": "2025-10-07T12:00:00.000Z",
  "chapters": [
    {
      "number": "140",
      "title": "Chapter 140",
      "url": "https://manhwaindo.app/be-the-actor-chapter-140/",
      "date": "September 10, 2025",
      "totalPages": 13,
      "images": [
        {
          "page": 1,
          "url": "https://img-id.gmbr.pro/id/manga-images/b/be-the-actor/chapter-140/1.jpg",
          "originalUrl": "https://img-id.gmbr.pro/id/manga-images/b/be-the-actor/chapter-140/1.jpg"
        },
        {
          "page": 2,
          "url": "https://img-id.gmbr.pro/id/manga-images/b/be-the-actor/chapter-140/2.jpg",
          "originalUrl": "https://img-id.gmbr.pro/id/manga-images/b/be-the-actor/chapter-140/2.jpg"
        }
      ],
      "scrapedAt": "2025-10-07T12:00:00.000Z"
    }
  ]
}
```

---

## 💡 What It Does

1. ✅ Scrape chapter list
2. ✅ Scrape image URLs
3. ❌ **SKIP download images**
4. ✅ Save URLs to JSON

**Result:** JSON file dengan image URLs, siap untuk reader!

---

## 🎯 Use Cases

### Perfect For:

**1. Quick Testing**
```bash
# Test 1 manhwa in 5 minutes
node scrape-chapters-url-only.js 1 null 8
```

**2. Mass Scraping**
```bash
# Scrape 75 manhwa in ~6 hours (instead of 56 hours!)
node scrape-chapters-url-only.js 75 null 10
```

**3. Online Reader**
- Reader loads images from URL
- No storage needed
- Always up-to-date

**4. Preview Before Download**
- Check chapter availability
- Verify image URLs
- Then download selected chapters

---

## ⏱️ Time Estimates

### URL Only (This Script):
| Manhwa | Chapters | Time |
|--------|----------|------|
| 1      | 100      | ~5 min |
| 5      | 500      | ~25 min |
| 10     | 1000     | ~50 min |
| 75     | 7500     | ~6 hours |

### With Download (Old Script):
| Manhwa | Chapters | Time |
|--------|----------|------|
| 1      | 100      | ~50 min |
| 5      | 500      | ~4 hours |
| 10     | 1000     | ~8 hours |
| 75     | 7500     | ~56 hours |

**10x FASTER!** ⚡

---

## 📁 Output Location

```
chapters/manhwaindo/
├── be-the-actor.json           (URLs only, ~100 KB)
├── the-genius-wants-to-be-ordinary.json
└── ...
```

**No images folder created!**

---

## 🔄 Workflow

### Step 1: Scrape URLs (Fast)
```bash
node scrape-chapters-url-only.js 75 null 10
```
**Time:** ~6 hours  
**Storage:** ~75 MB (JSON only)

### Step 2: Build Website
```bash
cd ../website-armanhwa
node build-detail-lite.js
```

### Step 3: Test Reader
Open `reader-lite.html` → Images load from URL

### Step 4 (Optional): Download Images Later
If you want offline reading:
```bash
cd ../manhwaindo
node scrape-chapters-manhwaindo.js 1 null 8
```
Download only selected manhwa

---

## 💾 Storage Comparison

### 75 Manhwa (~7500 chapters):

**URL Only:**
- JSON files: ~75 MB
- Images: 0 GB
- **Total: 75 MB**

**With Download:**
- JSON files: ~75 MB
- Images: ~75 GB
- **Total: 75 GB**

**1000x less storage!** 💾

---

## 🎯 Recommended Workflow

### For Top 75 Manhwa:

**1. Filter by rating:**
```bash
node scrape-top-rated.js 9.0 null 8
```

**2. Scrape URLs only:**
```bash
node scrape-chapters-url-only.js 75 null 10
```
**Time:** ~6 hours  
**Result:** 75 JSON files with URLs

**3. Build website:**
```bash
cd ../website-armanhwa
node build-detail-lite.js
```

**4. Test reader:**
Open `reader-lite.html` → Works with URLs!

**5. Download selected manhwa (optional):**
```bash
# Download only your favorites
node scrape-chapters-manhwaindo.js 1 null 8
```

---

## ✅ Advantages

✅ **10x faster** - 6 hours vs 56 hours  
✅ **1000x less storage** - 75 MB vs 75 GB  
✅ **Same functionality** - Reader works with URLs  
✅ **Always updated** - Images from source  
✅ **Quick testing** - See results fast  

---

## ❌ Disadvantages

❌ **Requires internet** - Can't read offline  
❌ **Depends on source** - Links might expire  
❌ **Slower loading** - Download from server  

---

## 🚀 Start Now!

**Recommended for beginners:**
```bash
# Test with 1 manhwa first
node scrape-chapters-url-only.js 1 null 8
```

**For mass scraping:**
```bash
# Scrape all top 75 manhwa
node scrape-chapters-url-only.js 75 null 10
```

**For quick preview:**
```bash
# Latest 20 chapters only
node scrape-chapters-url-only.js 10 20 10
```

---

**10x faster, 1000x less storage!** ⚡💾
