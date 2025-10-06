# 🎭 ARManhwa Website

Website untuk menampilkan data manhwa dari ManhwaIndo.app dengan tampilan modern dan user-friendly.

## 🌟 Features

- ✅ **Responsive Design** - Mobile & Desktop friendly
- ✅ **Search Functionality** - Cari manhwa by title atau genre
- ✅ **Filter Options** - All, Ongoing, Completed, Popular, Latest
- ✅ **Beautiful UI** - Modern gradient design
- ✅ **Real-time Stats** - Total manhwa & chapters
- ✅ **Card Hover Effects** - Interactive animations
- ✅ **Direct Link** - Klik card untuk buka manhwa

## 📊 Data Source

Website ini menggunakan data dari:

Data di-scrape menggunakan `manhwaindo/scrape-manhwaindo.js`

## 🚀 Cara Pakai

### Quick Start (3 Steps)

**1. Scrape Data:**
```bash
# Scrape manhwa list
cd manhwaindo
node scrape-manhwaindo.js 10 details 10

# Scrape chapters (optional, untuk chapter reader)
node scrape-chapters-manhwaindo.js 5 10 10
```

**2. Build Website:**
```bash
cd website-armanhwa
node build-all.js
```

**3. Buka Website:**
```bash
# Double click: standalone.html

✅ **Done!** Website siap digunakan.

---

### Build# ARManhwa Website

Website untuk menampilkan daftar manhwa yang telah di-scrape dari ManhwaIndo.

## 📁 File Structure

```
website-armanhwa/
├── standalone.html         # ✅ Main page (2379 manhwa, 2MB)
├── detail-lite.html        # ✅ Detail page (3 manhwa with chapters)
├── reader-lite.html        # ✅ Chapter reader (full features)
├── build-simple.js         # Build script untuk main page
├── build-detail-lite.js    # Build script untuk detail & reader
└── archive/                # Old/unused files
    ├── index.html
    ├── detail.html
    ├── reader.html
    └── ...

## 🎨 Design Features

### Color Scheme:
- **Accent**: Gold (#ffd700) for ratings
- **Background**: White cards with shadows

### Layout:
- **Grid**: Auto-fill responsive grid
- **Cards**: 200px min width
- **Spacing**: 25px gap between cards

### Animations:
- **Hover**: Card lift effect
- **Shadow**: Dynamic shadow on hover
- **Transitions**: Smooth 0.3s animations

## 📱 Responsive Breakpoints

### Desktop (> 768px):
- Grid: 6-7 cards per row
- Font size: Normal

### Mobile (< 768px):
- Grid: 2-3 cards per row
- Font size: Reduced
- Compact layout

## 🔍 Search & Filter

### Search:
- Search by title
- Search by genre
- Real-time filtering

### Filters:
- **Semua**: Show all manhwa
- **Ongoing**: Only ongoing series
- **Completed**: Only completed series
- **Populer**: Sort by rating (high to low)
- **Terbaru**: Latest updates

## 📊 Stats Display

- **Total Manhwa**: Count from JSON
- **Total Chapters**: Sum of all latest chapters
- **Rating Tertinggi**: Highest rated manhwa

## 🎯 Card Information

Each manhwa card shows:
- **Cover Image**: From manhwa.image
- **Title**: manhwa.title
- **Type**: manhwa.type (badge)
- **Latest Chapter**: manhwa.latestChapter
- **Rating**: manhwa.rating (star badge)

## 🔗 External Links

Clicking a manhwa card will:
- Open manhwa URL in new tab
- Direct to ManhwaIndo.app

## 🛠️ Customization

### Change Colors:
Edit CSS variables in `<style>` section:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Change Grid Size:
```css
.manhwa-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
```

### Change Card Height:
```css
.manhwa-image {
    height: 280px;
}
```

## 📈 Performance

- **Load Time**: < 1 second (local)
- **JSON Size**: ~2-5 MB (2400 manhwa)
- **Images**: Lazy loaded from external CDN

## 🐛 Troubleshooting

### Data tidak muncul:
- Check console (F12)
- Verify JSON path: `../data/manhwaindo/manhwa-list.json`
- Ensure JSON file exists

### Images tidak muncul:
- Check internet connection
- CDN might be blocked
- Fallback to placeholder

### Search tidak bekerja:
- Check browser console for errors
- Ensure JSON loaded successfully

## 💡 Tips

1. **Update Data**: Re-scrape untuk update manhwa list
2. **Backup**: Backup JSON sebelum re-scrape
3. **Performance**: Limit manhwa display untuk faster load
4. **Mobile**: Test di mobile browser

## 🎉 Future Enhancements

- [ ] Pagination for better performance
- [ ] Genre filter chips
- [ ] Favorites/Bookmark system
- [ ] Reading history
- [ ] Dark mode toggle
- [ ] Chapter reader integration
- [ ] Advanced search filters

---

**Version**: 1.0  
**Last Updated**: 2025-10-06  
**Status**: ✅ Ready to Use
