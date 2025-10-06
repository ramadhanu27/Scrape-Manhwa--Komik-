# 📚 ManhwaIndo.app Scraper

Scraper untuk mengambil data manhwa dari https://manhwaindo.app

## 🎯 Fitur

- ✅ Scrape list manhwa dengan pagination
- ✅ Extract: title, image, chapter, rating
- ✅ Auto pagination navigation
- ✅ Save to JSON
- ✅ Clean & organized data

## 🚀 Cara Pakai

### Install Dependencies (jika belum)
```bash
cd ..
npm install
```

### Run Scraper
```bash
cd manhwaindo

node scrape-manhwaindo.js 5

# Scrape 10 pages (basic info)
node scrape-manhwaindo.js 10

# Scrape 5 pages WITH DETAILS (5x parallel - default)
node scrape-manhwaindo.js 5 details

# Scrape 10 pages WITH DETAILS (10x parallel - FASTER!)
node scrape-manhwaindo.js 10 details 10

# Scrape 10 pages WITH DETAILS (20x parallel - VERY FAST!)
node scrape-manhwaindo.js 10 details 20
  "manhwa": [
    {
      "title": "Genius Archer's Streaming ID",
      "url": "https://...",
      "image": "https://...",
      "type": "Manhwa Color",
      "latestChapter": "Chapter 83",
      "rating": "7.90"
    }
  ]
}
```

### Format Data (WITH DETAILS):
```json
{
  "manhwa": [
    {
      "title": "Genius Archer's Streaming ID",
      "url": "https://...",
      "image": "https://...",
      "type": "Manhwa Color",
      "latestChapter": "Chapter 83",
      "rating": "7.90",
      "status": "Ongoing",
      "released": "2024",
      "author": "Mung Mung Kim",
      "postedBy": "illitayasa",
      "postedOn": "Mei 1, 2024",
      "updatedOn": "Oktober 4, 2025",
      "views": "204.8K",
      "genres": ["Action", "Adventure", "Shounen"],
      "synopsis": "Yoo Sanghyun, anak muda yang dulunya juara..."
    }
  ]
}

Website menggunakan struktur:
```html
<div class="listupd">
  <div class="bs">
    <a href="/series/...">
      <img src="..." />
      <div class="tt">Title</div>
      <div class="limit">MANHWA</div>
      <div class="epx">Chapter 83</div>
      <div class="rating">7.8</div>
    </a>
  </div>
</div>
```

## 📝 Selectors Used

- **Container**: `.listupd .bs`
- **Link**: `a[href*="/series/"]`
- **Title**: `.tt`
- **Image**: `img`
- **Type**: `.limit`
- **Chapter**: `.epx`
- **Rating**: `.rating`
- **Pagination**: `.pagination .next`

## ⚙️ Configuration

Edit `scrape-manhwaindo.js`:

```javascript
// Base URL
this.baseUrl = 'https://manhwaindo.app/series/?status=&type=manhwa&order=update';

// Headless mode (faster)
headless: true

// Wait time
setTimeout(resolve, 2000) // Adjust if needed
```

## 📊 Estimasi

| Pages | Manhwa | Time |
|-------|--------|------|
| 5     | ~150   | 1-2 min |
| 10    | ~300   | 2-4 min |
| 20    | ~600   | 4-8 min |
| 50    | ~1500  | 10-20 min |
| 80    | ~2400  | 16-32 min |

**Total Pages Available**: 80 pages (~2400 manhwa)

## 🔧 Troubleshooting

### No manhwa found
- Check selectors (website might have changed)
- Increase wait time
- Check internet connection

### Pagination not working
- Check `.pagination .next` selector
- Increase delay between pages

### Images not loading
- Check `img` src or data-src attribute
- Website might use lazy loading

## 💡 Tips

1. **Start small**: Test with 1-2 pages first
2. **Check data**: Verify JSON output
3. **Adjust delays**: If data incomplete, increase wait time
4. **Headless mode**: Set to `true` for faster scraping

## 🎉 Next Steps

After scraping:
1. Build website to display data
2. Scrape chapter details
3. Download chapter images
4. Create reader interface

---

**Status**: ✅ Ready to use
**Last Updated**: 2025-10-04
