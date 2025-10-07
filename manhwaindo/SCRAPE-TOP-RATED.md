# ⭐ Scrape Top Rated Manhwa Only

Script khusus untuk scrape manhwa dengan rating tinggi saja.

---

## 🚀 Quick Start

### Command Format:
```bash
node scrape-top-rated.js <minRating> <maxChapters> <parallelCount>
```

### Examples:

**Scrape rating >= 8.0, ALL chapters:**
```bash
node scrape-top-rated.js 8.0 null 8
```

**Scrape rating >= 8.5, 50 chapters:**
```bash
node scrape-top-rated.js 8.5 50 8
```

**Scrape rating >= 9.0, 20 chapters:**
```bash
node scrape-top-rated.js 9.0 20 8
```

---

## 📊 Rating Distribution

Dari 2379 manhwa:

| Rating | Count | % |
|--------|-------|---|
| >= 9.0 | ~50   | 2% |
| >= 8.5 | ~150  | 6% |
| >= 8.0 | ~300  | 13% |
| >= 7.5 | ~600  | 25% |
| >= 7.0 | ~1000 | 42% |

---

## 🎯 Recommended Settings

### Ultra Quality (Rating >= 9.0):
```bash
node scrape-top-rated.js 9.0 null 8
```
- ~50 manhwa
- Best of the best
- Time: ~40 hours

### High Quality (Rating >= 8.5):
```bash
node scrape-top-rated.js 8.5 null 8
```
- ~150 manhwa
- Excellent manhwa
- Time: ~120 hours

### Good Quality (Rating >= 8.0):
```bash
node scrape-top-rated.js 8.0 null 8
```
- ~300 manhwa
- Very good manhwa
- Time: ~240 hours

### Quick Test (Rating >= 8.0, Latest 20):
```bash
node scrape-top-rated.js 8.0 20 8
```
- ~300 manhwa
- Only latest 20 chapters each
- Time: ~15-20 hours

---

## 💡 Smart Strategies

### 1. Start with Ultra Quality
```bash
# Scrape top 50 manhwa first
node scrape-top-rated.js 9.0 null 8
```

### 2. Then High Quality
```bash
# After top 50 done, scrape next tier
node scrape-top-rated.js 8.5 null 8
```

### 3. Latest Chapters Only
```bash
# Quick scan of all good manhwa
node scrape-top-rated.js 8.0 20 8
```

---

## 📋 What It Does

1. **Filters** manhwa by rating from `manhwa-list.json`
2. **Sorts** by rating (highest first)
3. **Creates** `manhwa-list-filtered.json` for reference
4. **Scrapes** chapters for each manhwa
5. **Shows** progress and summary

---

## 📊 Output

### Console Output:
```
============================================================
📖 TOP RATED MANHWA SCRAPER
============================================================

⭐ Min Rating: 8.0
📚 Max Chapters: ALL
🔄 Parallel: 8x

✅ Found 287 manhwa with rating >= 8.0
📊 Total manhwa in database: 2379

🏆 Top 10 Manhwa:
   1. Solo Leveling (⭐ 9.8)
   2. The Beginning After The End (⭐ 9.5)
   3. Omniscient Reader (⭐ 9.3)
   ...

📋 Will scrape 287 manhwa
⏱️  Estimated time: 215 hours

✅ Created filtered list: manhwa-list-filtered.json
```

### Files Created:
```
../data/manhwaindo/
└── manhwa-list-filtered.json  # Filtered list for reference

../chapters/manhwaindo/
├── solo-leveling.json
├── the-beginning-after-the-end.json
└── ...

../images/chapters/manhwaindo/
├── solo-leveling/
├── the-beginning-after-the-end/
└── ...
```

---

## ⏱️ Time Estimates

### Rating >= 9.0 (~50 manhwa):
- **Chapters:** ~5000
- **Time:** ~40 hours
- **Storage:** ~50 GB

### Rating >= 8.5 (~150 manhwa):
- **Chapters:** ~15000
- **Time:** ~120 hours (5 days)
- **Storage:** ~150 GB

### Rating >= 8.0 (~300 manhwa):
- **Chapters:** ~30000
- **Time:** ~240 hours (10 days)
- **Storage:** ~300 GB

### Rating >= 8.0, Latest 20 only:
- **Chapters:** ~6000
- **Time:** ~15-20 hours
- **Storage:** ~60 GB

---

## 💡 Pro Tips

### 1. Run Overnight
```bash
# Start before sleep
node scrape-top-rated.js 9.0 null 8

# Will run for ~8 hours (scrape ~10 manhwa)
```

### 2. Use 3 Terminals
```bash
# Terminal 1: Rating 9.0+
node scrape-top-rated.js 9.0 null 8

# Terminal 2: Rating 8.5-8.9
node scrape-top-rated.js 8.5 null 8

# Terminal 3: Rating 8.0-8.4
node scrape-top-rated.js 8.0 null 8
```

### 3. Latest Chapters First
```bash
# Quick scan to get latest content
node scrape-top-rated.js 8.0 20 8

# Then full scrape later
node scrape-top-rated.js 8.0 null 8
```

---

## 🎯 Recommended Workflow

### Day 1: Ultra Quality
```bash
node scrape-top-rated.js 9.0 null 8
```
**Result:** Top 50 manhwa, ~5000 chapters

### Day 2-3: High Quality  
```bash
node scrape-top-rated.js 8.5 null 8
```
**Result:** Next 150 manhwa, ~15000 chapters

### Day 4-5: Good Quality
```bash
node scrape-top-rated.js 8.0 null 8
```
**Result:** Next 300 manhwa, ~30000 chapters

---

## ✅ Advantages

✅ **Quality over Quantity** - Only good manhwa  
✅ **Faster** - Fewer manhwa to scrape  
✅ **Better ROI** - Worth the time & storage  
✅ **Organized** - Sorted by rating  
✅ **Flexible** - Adjust min rating anytime  

---

## 📈 Comparison

| Method | Manhwa | Time | Quality |
|--------|--------|------|---------|
| **All manhwa** | 2379 | ~2000h | Mixed |
| **Rating >= 8.0** | ~300 | ~240h | Good |
| **Rating >= 8.5** | ~150 | ~120h | Excellent |
| **Rating >= 9.0** | ~50 | ~40h | Best |

---

## 🚀 Start Now!

**Recommended for beginners:**
```bash
node scrape-top-rated.js 9.0 null 8
```

**Recommended for speed:**
```bash
node scrape-top-rated.js 8.0 20 8
```

**Recommended for quality:**
```bash
node scrape-top-rated.js 8.5 null 8
```

---

**Scrape smart, not hard!** ⭐
