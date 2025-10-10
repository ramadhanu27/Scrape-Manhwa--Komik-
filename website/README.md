# 📖 Manhwa Website - Visual Framework

## 🎯 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router v6 (already implemented)
- **State**: React Context API / Zustand
- **Data**: JSON files from scraper

---

## 📁 Project Structure

```
website/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Layout.jsx
│   │   ├── manhwa/
│   │   │   ├── ManhwaCard.jsx
│   │   │   ├── ManhwaGrid.jsx
│   │   │   ├── ManhwaDetail.jsx
│   │   │   └── ChapterList.jsx
│   │   ├── reader/
│   │   │   ├── ImageReader.jsx
│   │   │   ├── ReaderControls.jsx
│   │   │   └── ChapterNav.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Badge.jsx
│   │       └── Input.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Browse.jsx
│   │   ├── ManhwaDetail.jsx
│   │   ├── Reader.jsx
│   │   └── Search.jsx
│   ├── hooks/
│   │   ├── useManhwa.js
│   │   └── useChapters.js
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── data/
│       ├── manhwa-list.json
│       └── chapters/
├── package.json
└── tailwind.config.js
```

---

## 🎨 Design System

### **Colors:**
- Primary: Blue (#3B82F6)
- Secondary: Purple (#8B5CF6)
- Accent: Pink (#EC4899)
- Dark: #0F172A
- Light: #F8FAFC

### **Typography:**
- Heading: Inter (Bold)
- Body: Inter (Regular)
- Code: JetBrains Mono

---

## 📱 Pages Overview

### 1. **Home Page**
- Hero section with featured manhwa
- Top rated carousel
- Latest updates grid
- Popular genres

### 2. **Browse Page**
- Filter sidebar (genre, rating, status)
- Sort options (latest, popular, rating)
- Grid/List view toggle
- Pagination

### 3. **Manhwa Detail Page**
- Cover image + info
- Synopsis
- Chapter list
- Related manhwa

### 4. **Reader Page**
- Full-screen image viewer
- Chapter navigation
- Settings (reading mode, zoom)
- Progress tracker

### 5. **Search Page**
- Search bar
- Filters
- Results grid

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "vite": "^5.0.0"
  }
}
```

---

## 🎯 Next Steps

1. Setup Vite + React project
2. Install TailwindCSS + shadcn/ui
3. Create component library
4. Build pages
5. Connect to JSON data
6. Deploy

---

**Ready to build!** 🎉
