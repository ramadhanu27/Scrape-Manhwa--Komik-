# 📖 ARManhwa Website - Usage Guide

## 🎯 Complete Internal Website

Website sekarang 100% internal - tidak ada redirect ke website lain!

---

## 📁 File Structure

```
website-armanhwa/
├── standalone.html     ← Main page (manhwa list)
├── detail.html         ← Detail page (manhwa info)
├── reader.html         ← Chapter reader (NEW!)
└── build-simple.js     ← Build script
```

---

## 🎬 User Flow

```
1. standalone.html
   ↓ Click manhwa card
   
2. detail.html
   - Lihat info lengkap
   - Lihat chapter list
   ↓ Click chapter
   
3. reader.html
   - Baca chapter
   - Navigate prev/next
   - Keyboard navigation
```

---

## 🚀 Setup & Usage

### 1. Scrape Data

**Scrape Manhwa List:**
```bash
cd manhwaindo
node scrape-manhwaindo.js 10 details 10
```

**Scrape Chapters:**
```bash
node scrape-chapters-manhwaindo.js 5 10 10
# 5 manhwa, 10 chapters each, 10x parallel
```

### 2. Build Website

```bash
cd website-armanhwa
node build-simple.js
```

### 3. Open Website

```bash
# Double click standalone.html
# Atau drag ke browser
```

---

## 📊 Features

### Main Page (standalone.html)

**✅ Features:**
- 2379 manhwa cards
- Search by title/genre
- Filter: All, Ongoing, Completed, Popular
- Pagination (50 per page)
- Dark theme
- Responsive

**✅ Actions:**
- Click card → Detail page
- Search → Filter results
- Filter → Sort/filter
- Pagination → Navigate pages

---

### Detail Page (detail.html)

**✅ Display:**
- Cover image (sticky)
- Title, Rating, Type, Status
- Author, Latest Chapter
- Genres tags
- Synopsis
- Chapter list (if scraped)

**✅ Actions:**
- Back button → Main page
- Click chapter → Reader page
- Logo → Main page

**✅ Chapter List:**
- Shows if chapters scraped
- Display: Chapter number, pages count
- Click → Open reader

---

### Reader Page (reader.html)

**✅ Display:**
- Chapter images (vertical scroll)
- Navigation bar (sticky top)
- Navigation footer (sticky bottom)
- Prev/Next buttons

**✅ Navigation:**
- Top buttons: Prev/Next chapter
- Bottom buttons: Prev/Next chapter
- Keyboard: ← → arrows
- Back button → Detail page

**✅ Features:**
- Lazy loading images
- Auto page count
- Chapter info in navbar
- Smooth scrolling

---

## 🎯 Chapter Reader Details

### How It Works:

**1. Load Chapter Data:**
```javascript
fetch('../chapters/manhwaindo/[slug].json')
```

**2. Display Images:**
```javascript
// Load from local path
<img src="../images/chapters/manhwaindo/[Manhwa]/chapter-X/page-001.jpg">
```

**3. Navigation:**
- Prev: Load previous chapter
- Next: Load next chapter
- Keyboard: Arrow keys

### Requirements:

**✅ Chapter harus sudah di-scrape:**
```bash
node scrape-chapters-manhwaindo.js 1 10 5
```

**✅ Images harus ada di:**
```
images/chapters/manhwaindo/[Manhwa-Name]/chapter-X/
```

**✅ JSON harus ada di:**
```
chapters/manhwaindo/[slug].json
```

---

## 📝 Example Usage

### Scenario 1: Baca Manhwa yang Sudah Di-scrape

**Manhwa Available:**
- genius-archers-streaming-id (83 chapters)
- not-over (10 chapters)
- the-player-who-returned-10000-years-later (5 chapters)

**Steps:**
1. Buka `standalone.html`
2. Search: "Genius Archer"
3. Click card → Detail page
4. Scroll ke chapter list
5. Click "Chapter 83" → Reader
6. Baca chapter
7. Click "Next" untuk chapter berikutnya

---

### Scenario 2: Scrape & Read New Manhwa

**Steps:**
```bash
# 1. Scrape manhwa list (if not yet)
cd manhwaindo
node scrape-manhwaindo.js 10 details 10

# 2. Scrape chapters untuk manhwa tertentu
node scrape-chapters-manhwaindo.js 1 20 10
# Akan scrape manhwa pertama, 20 chapters

# 3. Rebuild website
cd ../website-armanhwa
node build-simple.js

# 4. Refresh browser
# 5. Buka manhwa → Detail → Chapter → Read!
```

---

## 🎨 Customization

### Change Items Per Page:

Edit `build-simple.js` line 328:
```javascript
const itemsPerPage = 50; // Change to 30, 100, etc
```

### Change Parallel Count:

Edit `build-simple.js` line 156:
```javascript
const parallelCount = 5; // Change to 10, 20, etc
```

### Change Theme Colors:

Edit CSS in `build-simple.js`:
```css
background: #0f0f0f;  /* Dark background */
color: #ff6b6b;       /* Accent color */
```

---

## 📊 Performance

### Load Times:

| Page | Load Time | Notes |
|------|-----------|-------|
| **Main** | 1-2 sec | 50 manhwa per page |
| **Detail** | < 1 sec | Data from localStorage |
| **Reader** | 1-3 sec | Depends on image count |

### Optimization:

- ✅ Pagination (50/page)
- ✅ Lazy loading images
- ✅ localStorage caching
- ✅ Embedded data (no fetch)

---

## 🐛 Troubleshooting

### Chapter tidak muncul:

**Problem:** Chapter list kosong di detail page

**Solution:**
```bash
# Scrape chapters dulu
cd manhwaindo
node scrape-chapters-manhwaindo.js 1 10 5
```

---

### Images tidak muncul di reader:

**Problem:** Broken images

**Solution:**
1. Check path: `images/chapters/manhwaindo/[Manhwa]/chapter-X/`
2. Verify images downloaded
3. Check JSON localPath

---

### Reader error "Chapter data not found":

**Problem:** JSON tidak ada

**Solution:**
```bash
# Scrape chapters
node scrape-chapters-manhwaindo.js 1 all 10
```

---

## 🎉 Success Checklist

**✅ Website Setup:**
- [x] Data scraped (manhwa list)
- [x] Website built (standalone.html)
- [x] Browser opened

**✅ Chapter Reading:**
- [x] Chapters scraped
- [x] Images downloaded
- [x] JSON files created
- [x] Reader working

**✅ Navigation:**
- [x] Main → Detail works
- [x] Detail → Reader works
- [x] Reader → Prev/Next works
- [x] Back buttons work

---

## 💡 Tips

1. **Scrape Gradually:** Start dengan 5-10 manhwa
2. **Test First:** Test 1 manhwa sebelum scrape banyak
3. **Backup:** Backup folder `chapters/` dan `images/`
4. **Update:** Re-scrape untuk update chapters baru

---

**Enjoy your ARManhwa website!** 🎉
