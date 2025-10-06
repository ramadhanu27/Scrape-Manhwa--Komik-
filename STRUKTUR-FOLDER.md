# 📁 Struktur Folder Project

## 🎯 Organisasi Berdasarkan Website

Project ini mengorganisir data berdasarkan sumber website untuk memudahkan management.

---

## 📂 Struktur Lengkap

```
scraper web/
│
├── 📁 scrapers/                    # Script scraping
│   ├── scrape-real-images.js      # Scrape manhwa list (Shinigami)
│   └── scrape-chapters.js         # Scrape chapters (Shinigami)
│
├── 📁 manhwaindo/                  # Script scraping ManhwaIndo
│   ├── scrape-manhwaindo.js       # Scrape manhwa list
│   ├── scrape-chapters-manhwaindo.js  # Scrape chapters
│   └── README.md
│
├── 📁 data/                        # Data manhwa list
│   ├── 📁 shinigami/              # Data dari 07.shinigami.asia
│   │   ├── manhwa-all.json        # List 744 manhwa
│   │   └── manhwa-real-images.json
│   │
│   └── 📁 manhwaindo/             # Data dari manhwaindo.app
│       └── manhwa-list.json       # List 150+ manhwa
│
├── 📁 chapters/                    # Chapter metadata (JSON)
│   ├── 📁 shinigami/              # Chapter dari Shinigami
│   │   ├── [manhwa-slug].json     # Chapter list per manhwa
│   │   └── ...
│   │
│   └── 📁 manhwaindo/             # Chapter dari ManhwaIndo
│       ├── genius-archers-streaming-id.json
│       └── ...
│
├── 📁 images/                      # Downloaded images
│   └── 📁 chapters/
│       ├── 📁 shinigami/          # Images dari Shinigami
│       │   ├── I-am-Self-disciplined-And-Invincible/
│       │   │   ├── chapter-131/
│       │   │   │   ├── page-001.jpg
│       │   │   │   ├── page-002.jpg
│       │   │   │   └── ...
│       │   │   └── chapter-130/
│       │   └── [Other-Manhwa]/
│       │
│       └── 📁 manhwaindo/         # Images dari ManhwaIndo
│           ├── Genius-Archer's-Streaming-ID/
│           │   ├── chapter-83/
│           │   │   ├── page-001.jpg
│           │   │   └── ...
│           │   └── chapter-82/
│           └── [Other-Manhwa]/
│
└── 📁 docs/                        # Documentation
    ├── CARA-SCRAPE-SEMUA.md
    └── ...
```

---

## 🗂️ Penjelasan Folder

### 1. **data/** - Manhwa List
Menyimpan list manhwa dari setiap website.

**Shinigami:**
- `data/shinigami/manhwa-all.json` - 744 manhwa
- Format: title, url, image, views, chapter, status

**ManhwaIndo:**
- `data/manhwaindo/manhwa-list.json` - 150+ manhwa
- Format: title, url, image, type, chapter, rating

---

### 2. **chapters/** - Chapter Metadata
Menyimpan informasi chapter dalam format JSON.

**Format JSON:**
```json
{
  "manhwaSlug": "genius-archers-streaming-id",
  "manhwaTitle": "Genius Archer's Streaming ID",
  "totalChapters": 83,
  "chapters": [
    {
      "number": "83",
      "title": "Chapter 83",
      "url": "https://...",
      "totalPages": 19,
      "images": [...]
    }
  ]
}
```

**Lokasi:**
- Shinigami: `chapters/shinigami/[slug].json`
- ManhwaIndo: `chapters/manhwaindo/[slug].json`

---

### 3. **images/chapters/** - Downloaded Images
Menyimpan gambar chapter yang sudah di-download.

**Struktur:**
```
images/chapters/[website]/[Manhwa-Name]/chapter-X/page-XXX.jpg
```

**Contoh:**
```
images/chapters/shinigami/I-am-Self-disciplined/chapter-131/page-001.jpg
images/chapters/manhwaindo/Genius-Archers-Streaming-ID/chapter-83/page-001.jpg
```

---

## 📊 Ukuran Storage

### Per Manhwa (estimasi):
- **Manhwa list JSON**: ~1-5 KB
- **Chapter metadata JSON**: ~10-50 KB (tergantung jumlah chapter)
- **Images per chapter**: ~5-20 MB (10-30 images)

### Total (estimasi):
| Item | Shinigami | ManhwaIndo | Total |
|------|-----------|------------|-------|
| Manhwa list | 744 | 150 | 894 |
| Data size | ~100 KB | ~50 KB | ~150 KB |
| Chapters (if all) | ~6000 | ~2400 | ~8400 |
| Images (if all) | ~30-90 GB | ~12-36 GB | ~42-126 GB |

---

## 🔄 Workflow

### Scraping Shinigami:
```bash
# 1. Scrape manhwa list
cd scrapers
node scrape-real-images.js 10

# 2. Scrape chapters
node scrape-chapters.js 5 all

# Output:
# - data/shinigami/manhwa-all.json
# - chapters/shinigami/*.json
# - images/chapters/shinigami/[Manhwa]/
```

### Scraping ManhwaIndo:
```bash
# 1. Scrape manhwa list
cd manhwaindo
node scrape-manhwaindo.js 10

# 2. Scrape chapters
node scrape-chapters-manhwaindo.js 5 all

# Output:
# - data/manhwaindo/manhwa-list.json
# - chapters/manhwaindo/*.json
# - images/chapters/manhwaindo/[Manhwa]/
```

---

## 🎯 Keuntungan Struktur Ini

### ✅ Organized by Source
- Mudah identify data dari website mana
- Tidak tercampur antara sumber berbeda

### ✅ Scalable
- Mudah tambah website baru
- Tinggal buat folder baru: `data/[website]`, `chapters/[website]`, dll

### ✅ Maintainable
- Update data per website tidak affect yang lain
- Mudah backup/restore per website

### ✅ Clear Separation
- Data (JSON) terpisah dari Images
- Metadata terpisah dari content

---

## 📝 Naming Convention

### Folder Names:
- **Lowercase**: `shinigami`, `manhwaindo`
- **No spaces**: Use dash `-` if needed

### File Names:
- **Manhwa slug**: `genius-archers-streaming-id.json`
- **Images**: `page-001.jpg`, `page-002.jpg`
- **Padded numbers**: 001, 002, 003 (for sorting)

### Manhwa Folder Names:
- **Clean title**: Remove special chars
- **Spaces to dash**: "Genius Archer's" → "Genius-Archer's"
- **Max 100 chars**: Truncate if too long

---

## 🔧 Maintenance

### Cleanup Old Data:
```bash
# Remove old shinigami data
Remove-Item -Recurse "chapters/shinigami/*"
Remove-Item -Recurse "images/chapters/shinigami/*"

# Remove old manhwaindo data
Remove-Item -Recurse "chapters/manhwaindo/*"
Remove-Item -Recurse "images/chapters/manhwaindo/*"
```

### Backup:
```bash
# Backup specific website
Compress-Archive -Path "data/shinigami", "chapters/shinigami" -DestinationPath "backup-shinigami.zip"

# Backup all
Compress-Archive -Path "data", "chapters", "images" -DestinationPath "backup-all.zip"
```

---

## 📈 Future Expansion

Untuk menambah website baru:

1. **Buat folder**:
   ```bash
   mkdir data/[website]
   mkdir chapters/[website]
   mkdir images/chapters/[website]
   ```

2. **Buat scraper**:
   ```bash
   mkdir [website]
   # Create scraper scripts
   ```

3. **Follow naming convention**:
   - Use lowercase folder names
   - Consistent JSON structure
   - Same image naming pattern

---

**Last Updated**: 2025-10-04
**Total Websites**: 2 (Shinigami, ManhwaIndo)
**Status**: ✅ Organized & Ready
