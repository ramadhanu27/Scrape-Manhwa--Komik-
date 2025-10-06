import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildWebsite() {
    console.log('🔨 Building ARManhwa website (simple method)...\n');

    try {
        // Read JSON data
        const jsonPath = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list.json');
        const jsonData = await fs.readJSON(jsonPath);
        
        console.log(`✅ Loaded ${jsonData.manhwa.length} manhwa from JSON`);

        // Create complete HTML with embedded data
        const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARManhwa - Baca Manhwa Gratis</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #0f0f0f;
            color: #fff;
            min-height: 100vh;
        }
        
        /* Navbar */
        .navbar {
            background: rgba(26, 26, 26, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 15px 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 1.8em;
            font-weight: bold;
            color: #fff;
        }
        .nav-links {
            display: flex;
            gap: 30px;
            align-items: center;
        }
        .nav-link {
            color: #999;
            text-decoration: none;
            font-weight: 500;
            transition: color 0.3s;
        }
        .nav-link:hover {
            color: #fff;
        }
        .nav-link.active {
            color: #ff6b6b;
        }
        
        /* Hero Banner */
        .hero-banner {
            position: relative;
            height: 400px;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border-radius: 20px;
            overflow: hidden;
            margin: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        .hero-content {
            position: relative;
            z-index: 2;
            padding: 60px;
            max-width: 600px;
        }
        .hero-title {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #fff;
        }
        .hero-rating {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        .rating-star {
            color: #ffd700;
            font-size: 1.2em;
        }
        .rating-value {
            font-size: 1.3em;
            font-weight: bold;
            color: #fff;
        }
        .rating-badge {
            background: #ff6b6b;
            color: #fff;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
        }
        .hero-description {
            color: #ccc;
            font-size: 1.1em;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .hero-image {
            position: absolute;
            right: 0;
            top: 0;
            height: 100%;
            width: 50%;
            object-fit: cover;
            opacity: 0.3;
            mask-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
        }
        .hero-dots {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 3;
        }
        .hero-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            cursor: pointer;
            transition: all 0.3s;
        }
        .hero-dot.active {
            background: #ff6b6b;
            width: 30px;
            border-radius: 5px;
        }
        
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        
        /* Search & Filter */
        .search-section {
            background: #1a1a1a;
            padding: 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        }
        .search-bar {
            position: relative;
            margin-bottom: 20px;
        }
        .search-bar input {
            width: 100%;
            padding: 15px 50px 15px 20px;
            background: #2a2a2a;
            border: 2px solid #333;
            border-radius: 10px;
            color: #fff;
            font-size: 1.1em;
            outline: none;
            transition: all 0.3s;
        }
        .search-bar input:focus {
            border-color: #ff6b6b;
            box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
        }
        .search-icon {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: #666;
            font-size: 1.2em;
        }
        
        .filters {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .filter-btn {
            padding: 10px 25px;
            background: #2a2a2a;
            border: 2px solid #333;
            color: #999;
            border-radius: 25px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s;
            font-size: 0.95em;
        }
        .filter-btn:hover {
            border-color: #ff6b6b;
            color: #ff6b6b;
        }
        .filter-btn.active {
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            border-color: transparent;
            color: white;
        }
        
        /* Grid */
        .manhwa-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        /* Card */
        .manhwa-card {
            background: #1a1a1a;
            border-radius: 12px;
            overflow: hidden;
            transition: all 0.3s;
            cursor: pointer;
            position: relative;
        }
        .manhwa-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
        }
        .manhwa-card:hover .manhwa-image {
            transform: scale(1.05);
        }
        
        .image-wrapper {
            position: relative;
            width: 100%;
            padding-top: 140%;
            overflow: hidden;
            background: #2a2a2a;
        }
        .manhwa-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s;
        }
        
        .manhwa-type {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .manhwa-rating {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 215, 0, 0.95);
            color: #000;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .manhwa-info {
            padding: 15px;
        }
        .manhwa-title {
            font-weight: 600;
            font-size: 0.95em;
            margin-bottom: 8px;
            color: #fff;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.4;
            min-height: 2.8em;
        }
        .manhwa-chapter {
            color: #ff6b6b;
            font-size: 0.85em;
            font-weight: 600;
        }
        
        /* Pagination */
        .pagination {
            grid-column: 1/-1;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin-top: 30px;
            padding: 20px;
        }
        .pagination button {
            padding: 12px 25px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        .pagination button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
        }
        .pagination button:disabled {
            background: #333;
            cursor: not-allowed;
            opacity: 0.5;
        }
        .page-info {
            padding: 12px 25px;
            background: #1a1a1a;
            border-radius: 8px;
            font-weight: 600;
            color: #999;
        }
        
        /* Footer */
        footer {
            background: #1a1a1a;
            padding: 30px;
            text-align: center;
            color: #666;
            margin-top: 50px;
            border-top: 2px solid #ff6b6b;
        }
        footer p { margin: 5px 0; }
        
        /* Responsive */
        @media (max-width: 768px) {
            .logo { font-size: 1.5em; }
            .stats-mini { display: none; }
            .manhwa-grid {
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                gap: 15px;
            }
            .search-section { padding: 20px; }
        }
    </style>
    <script>
        // Embedded data - MUST be before body to ensure it loads first
        const MANHWA_DATA = ${JSON.stringify(jsonData.manhwa)};
    </script>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo">🎭 ARManhwa</div>
            <div class="nav-links">
                <a href="#" class="nav-link active">Home</a>
                <a href="#" class="nav-link">Popular</a>
                <a href="#" class="nav-link">Latest</a>
                <a href="#" class="nav-link">Genres</a>
            </div>
        </div>
    </nav>

    <!-- Hero Banner -->
    <div class="hero-banner" id="hero-banner">
        <div class="hero-content">
            <h1 class="hero-title" id="hero-title">Loading...</h1>
            <div class="hero-rating">
                <span class="rating-star">⭐</span>
                <span class="rating-value" id="hero-rating">0</span>
                <span class="rating-badge" id="hero-genre">Loading...</span>
            </div>
            <p class="hero-description" id="hero-description">Loading...</p>
        </div>
        <img class="hero-image" id="hero-image" src="" alt="Hero">
        <div class="hero-dots">
            <div class="hero-dot active"></div>
            <div class="hero-dot"></div>
            <div class="hero-dot"></div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container">
        <!-- Search & Filter Section -->
        <div class="search-section">
            <div class="search-bar">
                <input type="text" id="search-input" placeholder="Cari manhwa favorit kamu...">
                <span class="search-icon">🔍</span>
            </div>
            <div class="filters">
                <button class="filter-btn active" data-filter="all">Semua</button>
                <button class="filter-btn" data-filter="ongoing">Ongoing</button>
                <button class="filter-btn" data-filter="completed">Completed</button>
                <button class="filter-btn" data-filter="popular">Populer ⭐</button>
            </div>
        </div>

        <!-- Manhwa Grid -->
        <div id="manhwa-container" class="manhwa-grid"></div>
    </div>

    <!-- Footer -->
    <footer>
        <p><strong>ARManhwa</strong> - Baca Manhwa Gratis</p>
        <p>${jsonData.manhwa.length} Manhwa Available • Update Setiap Hari</p>
        <p style="margin-top: 10px; color: #444;">© 2025 All Rights Reserved</p>
    </footer>

    <script>
        // Show loading indicator
        document.getElementById('manhwa-container').innerHTML = '<div style="text-align:center;padding:100px;color:#999;font-size:1.5em;">⏳ Loading manhwa...</div>';
        
        // Use embedded data with delay to prevent freezing
        let allManhwa = [];
        let filteredManhwa = [];
        let currentPage = 1;
        const itemsPerPage = 50;
        
        // Load data after a brief delay
        setTimeout(() => {
            console.log('Loading MANHWA_DATA...');
            allManhwa = MANHWA_DATA;
            filteredManhwa = [...allManhwa];
            console.log('✅ Loaded', allManhwa.length, 'manhwa');
            
            // Initialize everything
            init();
        }, 100);

        // Render manhwa with pagination
        function renderManhwa() {
            const container = document.getElementById('manhwa-container');
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageData = filteredManhwa.slice(startIndex, endIndex);
            
            container.innerHTML = pageData.map((m, index) => {
                const slug = m.url.split('/').filter(Boolean).pop();
                return \`
                <div class="manhwa-card" onclick="openManhwa(\${startIndex + index})">
                    <div class="image-wrapper">
                        <img class="manhwa-image" src="\${m.image}" alt="\${m.title}" loading="lazy"
                             onerror="this.src='https://via.placeholder.com/200x280/2a2a2a/666?text=No+Image'">
                        <div class="manhwa-type">\${(m.type || 'Manhwa').split(' ')[0]}</div>
                        <div class="manhwa-rating">⭐ \${m.rating || 'N/A'}</div>
                    </div>
                    <div class="manhwa-info">
                        <div class="manhwa-title">\${m.title}</div>
                        <div class="manhwa-chapter">\${m.latestChapter || 'N/A'}</div>
                    </div>
                </div>
                \`;
            }).join('');
            
            renderPagination();
        }
        
        // Render pagination
        function renderPagination() {
            const totalPages = Math.ceil(filteredManhwa.length / itemsPerPage);
            const container = document.getElementById('manhwa-container');
            
            if (totalPages <= 1) return;
            
            let paginationHTML = '<div class="pagination">';
            
            paginationHTML += \`<button onclick="changePage(\${currentPage - 1})" \${currentPage === 1 ? 'disabled' : ''}>← Prev</button>\`;
            paginationHTML += \`<span class="page-info">Page \${currentPage} of \${totalPages}</span>\`;
            paginationHTML += \`<button onclick="changePage(\${currentPage + 1})" \${currentPage === totalPages ? 'disabled' : ''}>Next →</button>\`;
            
            paginationHTML += '</div>';
            container.innerHTML += paginationHTML;
        }
        
        // Change page
        function changePage(page) {
            currentPage = page;
            renderManhwa();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Open manhwa detail page
        function openManhwa(index) {
            const manhwa = filteredManhwa[index];
            const slug = manhwa.url.split('/').filter(Boolean).pop();
            
            // Save manhwa data to localStorage
            localStorage.setItem('current-manhwa', JSON.stringify(manhwa));
            
            // Navigate to detail page (lite version - only manhwa with chapters)
            window.location.href = \`detail-lite.html?slug=\${slug}\`;
        }

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            filteredManhwa = allManhwa.filter(m => 
                m.title.toLowerCase().includes(term) ||
                (m.genres && m.genres.some(g => g.toLowerCase().includes(term)))
            );
            currentPage = 1; // Reset to page 1
            renderManhwa();
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                switch(filter) {
                    case 'all':
                        filteredManhwa = [...allManhwa];
                        break;
                    case 'ongoing':
                        filteredManhwa = allManhwa.filter(m => m.status === 'Ongoing');
                        break;
                    case 'completed':
                        filteredManhwa = allManhwa.filter(m => m.status === 'Completed');
                        break;
                    case 'popular':
                        filteredManhwa = [...allManhwa].sort((a, b) => 
                            parseFloat(b.rating || 0) - parseFloat(a.rating || 0)
                        );
                        break;
                }
                currentPage = 1; // Reset to page 1
                renderManhwa();
            });
        });

        // Hero Banner Carousel
        let heroManhwa = [];
        let currentHeroIndex = 0;
        
        function initHeroBanner() {
            try {
                // Get top rated manhwa for hero
                heroManhwa = [...allManhwa]
                    .filter(m => m.rating && parseFloat(m.rating) > 7)
                    .sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0))
                    .slice(0, 3);
                
                if (heroManhwa.length === 0) {
                    heroManhwa = allManhwa.slice(0, 3);
                }
                
                if (heroManhwa.length > 0) {
                    displayHero(0);
                    setupHeroDots();
                    setupHeroNavigation();
                }
            } catch (error) {
                console.error('Hero banner error:', error);
                document.getElementById('hero-banner').style.display = 'none';
            }
        }
        
        function displayHero(index) {
            if (!heroManhwa[index]) return;
            
            currentHeroIndex = index;
            const manhwa = heroManhwa[index];
            
            document.getElementById('hero-title').textContent = manhwa.title || 'ARManhwa';
            document.getElementById('hero-rating').textContent = manhwa.rating || 'N/A';
            document.getElementById('hero-genre').textContent = manhwa.genres?.[0] || manhwa.type || 'Manhwa';
            
            const description = manhwa.synopsis || 'Baca manhwa terbaru dan terpopuler di ARManhwa. Ribuan judul tersedia dengan update setiap hari!';
            document.getElementById('hero-description').textContent = 
                description.length > 150 ? description.substring(0, 150) + '...' : description;
            
            if (manhwa.image) {
                const img = document.getElementById('hero-image');
                img.src = manhwa.image;
                img.style.display = 'block';
                img.onerror = function() {
                    this.style.display = 'none';
                };
            }
            
            // Update dots
            document.querySelectorAll('.hero-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            // Make banner clickable
            document.getElementById('hero-banner').style.cursor = 'pointer';
            document.getElementById('hero-banner').onclick = (e) => {
                // Don't navigate if clicking dots
                if (e.target.classList.contains('hero-dot')) return;
                
                const slug = manhwa.url.split('/').filter(Boolean).pop();
                localStorage.setItem('current-manhwa', JSON.stringify(manhwa));
                window.location.href = \`detail-lite.html?slug=\${slug}\`;
            };
        }
        
        function setupHeroDots() {
            const dots = document.querySelectorAll('.hero-dot');
            dots.forEach((dot, index) => {
                dot.onclick = (e) => {
                    e.stopPropagation();
                    displayHero(index);
                };
            });
        }
        
        function setupHeroNavigation() {
            // Auto-slide every 5 seconds
            setInterval(() => {
                const nextIndex = (currentHeroIndex + 1) % heroManhwa.length;
                displayHero(nextIndex);
            }, 5000);
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    const prevIndex = (currentHeroIndex - 1 + heroManhwa.length) % heroManhwa.length;
                    displayHero(prevIndex);
                } else if (e.key === 'ArrowRight') {
                    const nextIndex = (currentHeroIndex + 1) % heroManhwa.length;
                    displayHero(nextIndex);
                }
            });
        }
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
        
        function init() {
            initHeroBanner();
            renderManhwa();
            console.log('✅ Loaded', allManhwa.length, 'manhwa');
        }
    </script>
</body>
</html>`;

        // Save
        const outputPath = path.join(__dirname, 'standalone.html');
        await fs.writeFile(outputPath, html, 'utf-8');

        console.log(`\n✅ Website built successfully!`);
        console.log(`📁 Output: ${outputPath}`);
        console.log(`📊 Embedded: ${jsonData.manhwa.length} manhwa`);
        console.log(`\n🎉 Open standalone.html in browser - it will work immediately!`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

buildWebsite();
