import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildDetailPageLite() {
    console.log('🔨 Building lite detail page (only manhwa with chapters)...\n');

    try {
        // Read all chapter files
        const chaptersDir = path.join(__dirname, '..', 'chapters', 'manhwaindo');
        const chapterFiles = await fs.readdir(chaptersDir);
        
        const allChaptersData = {};
        const manhwaWithChapters = {};
        
        // Load manhwa data
        const manhwaDataPath = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list.json');
        const manhwaData = await fs.readJSON(manhwaDataPath);
        
        for (const file of chapterFiles) {
            if (file.endsWith('.json')) {
                const slug = file.replace('.json', '');
                const filePath = path.join(chaptersDir, file);
                const data = await fs.readJSON(filePath);
                allChaptersData[slug] = data;
                
                // Find manhwa info
                const manhwa = manhwaData.manhwa.find(m => {
                    const mSlug = m.url.split('/').filter(Boolean).pop();
                    return mSlug === slug;
                });
                
                if (manhwa) {
                    manhwaWithChapters[slug] = manhwa;
                }
                
                console.log(`✅ ${slug}: ${data.chapters.length} chapters`);
            }
        }

        console.log(`\n📊 Total: ${Object.keys(allChaptersData).length} manhwa with chapters`);

        // Create simple HTML
        const html = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail - ARManhwa</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0f0f0f;
            color: #fff;
            min-height: 100vh;
        }
        .navbar {
            background: #1a1a1a;
            border-bottom: 2px solid #ff6b6b;
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
            font-size: 1.5em;
            font-weight: bold;
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            cursor: pointer;
        }
        .back-btn {
            padding: 10px 20px;
            background: #2a2a2a;
            border: 2px solid #ff6b6b;
            color: #ff6b6b;
            border-radius: 8px;
            cursor: pointer;
            text-decoration: none;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 30px 20px; }
        .detail-section {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 40px;
            margin-bottom: 40px;
        }
        .cover-image {
            width: 100%;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }
        .rating-badge {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 20px;
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            color: #000;
            border-radius: 25px;
            font-weight: bold;
        }
        .info-section {
            background: #1a1a1a;
            padding: 30px;
            border-radius: 15px;
        }
        .manhwa-title {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 20px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            background: #2a2a2a;
            padding: 15px;
            border-radius: 10px;
        }
        .info-label { color: #999; font-size: 0.9em; margin-bottom: 5px; }
        .info-value { color: #fff; font-weight: 600; font-size: 1.1em; }
        .genres {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 30px;
        }
        .genre-tag {
            padding: 8px 16px;
            background: linear-gradient(135deg, #ff6b6b, #ff8e53);
            color: white;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
        }
        .synopsis {
            background: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            line-height: 1.8;
            color: #ccc;
        }
        .synopsis h3 { color: #fff; margin-bottom: 15px; }
        .chapters-section {
            background: #1a1a1a;
            padding: 30px;
            border-radius: 15px;
        }
        .chapters-section h2 { margin-bottom: 20px; color: #ff6b6b; }
        .chapters-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        .chapter-card {
            background: #2a2a2a;
            padding: 15px;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
            border: 2px solid transparent;
        }
        .chapter-card:hover {
            border-color: #ff6b6b;
            transform: translateY(-3px);
        }
        .chapter-title { font-weight: 600; color: #fff; margin-bottom: 5px; }
        .chapter-date { font-size: 0.85em; color: #999; }
        @media (max-width: 768px) {
            .detail-section { grid-template-columns: 1fr; }
        }
    </style>
    <script>
        const MANHWA_DATA = ${JSON.stringify(manhwaWithChapters)};
        const CHAPTERS_DATA = ${JSON.stringify(allChaptersData)};
    </script>
</head>
<body>
    <nav class="navbar">
        <div class="nav-container">
            <div class="logo" onclick="window.location.href='standalone.html'">🎭 ARManhwa</div>
            <a href="standalone.html" class="back-btn">← Kembali</a>
        </div>
    </nav>

    <div class="container">
        <div class="detail-section">
            <div class="cover-section">
                <img id="cover-image" class="cover-image" src="" alt="Cover">
                <div class="rating-badge">⭐ <span id="rating">N/A</span></div>
            </div>

            <div class="info-section">
                <h1 class="manhwa-title" id="title">Loading...</h1>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Type</div>
                        <div class="info-value" id="type">-</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value" id="status">-</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Author</div>
                        <div class="info-value" id="author">-</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Latest Chapter</div>
                        <div class="info-value" id="latest-chapter">-</div>
                    </div>
                </div>

                <div id="genres-container" class="genres"></div>

                <div class="synopsis">
                    <h3>📖 Synopsis</h3>
                    <p id="synopsis">Loading...</p>
                </div>
            </div>
        </div>

        <div class="chapters-section">
            <h2>📚 Chapter List</h2>
            <div id="chapters-container" class="chapters-grid"></div>
        </div>
    </div>

    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        
        console.log('Slug:', slug);
        console.log('Has data:', !!MANHWA_DATA[slug]);
        
        if (!slug || !MANHWA_DATA[slug]) {
            alert('Manhwa not found or chapters not scraped yet!');
            window.location.href = 'standalone.html';
        }
        
        const manhwa = MANHWA_DATA[slug];
        const chapters = CHAPTERS_DATA[slug];
        
        // Display manhwa info
        document.getElementById('title').textContent = manhwa.title;
        document.getElementById('cover-image').src = manhwa.image;
        document.getElementById('rating').textContent = manhwa.rating || 'N/A';
        document.getElementById('type').textContent = manhwa.type || 'Manhwa';
        document.getElementById('status').textContent = manhwa.status || 'Unknown';
        document.getElementById('author').textContent = manhwa.author || 'Unknown';
        document.getElementById('latest-chapter').textContent = manhwa.latestChapter || 'N/A';
        document.getElementById('synopsis').textContent = manhwa.synopsis || 'No synopsis available.';
        
        // Display genres
        if (manhwa.genres && manhwa.genres.length > 0) {
            document.getElementById('genres-container').innerHTML = manhwa.genres.map(g => 
                \`<span class="genre-tag">\${g}</span>\`
            ).join('');
        }
        
        // Display chapters
        if (chapters && chapters.chapters) {
            document.getElementById('chapters-container').innerHTML = chapters.chapters.map(ch => \`
                <div class="chapter-card" onclick="window.location.href='reader-lite.html?slug=\${slug}&chapter=\${ch.number}'">
                    <div class="chapter-title">\${ch.title || 'Chapter ' + ch.number}</div>
                    <div class="chapter-date">\${ch.totalPages ? ch.totalPages + ' pages' : ''}</div>
                </div>
            \`).join('');
        }
    </script>
</body>
</html>`;

        // Save
        const outputPath = path.join(__dirname, 'detail-lite.html');
        await fs.writeFile(outputPath, html, 'utf-8');

        console.log(`\n✅ Lite detail page built!`);
        console.log(`📁 Output: ${outputPath}`);
        console.log(`📊 File size: ${(html.length / 1024).toFixed(2)} KB`);
        
        // Also build reader with embedded data
        await buildReaderWithData(allChaptersData, manhwaWithChapters);
        
        console.log(`\n🎉 Use detail-lite.html and reader-lite.html!`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function buildReaderWithData(chaptersData, manhwaData) {
    console.log('\n📖 Building reader with embedded data...');
    
    // Read reader template
    const readerTemplate = path.join(__dirname, 'reader.html');
    let html = await fs.readFile(readerTemplate, 'utf-8');
    
    // Embed data
    const embedScript = `
    <script>
        const CHAPTERS_DATA = ${JSON.stringify(chaptersData)};
        const MANHWA_DATA = ${JSON.stringify(manhwaData)};
    </script>`;
    
    // Insert before closing </head>
    html = html.replace('</head>', `${embedScript}\n</head>`);
    
    // Replace loadChapter function
    const newLoadFunction = `
        // Load chapter data from embedded data
        async function loadChapter() {
            if (!manhwaSlug || !chapterNumber) {
                showError('Invalid chapter URL');
                return;
            }

            try {
                const data = CHAPTERS_DATA[manhwaSlug];
                if (!data) {
                    throw new Error('Chapter data not found');
                }

                allChapters = data.chapters || [];
                
                // Find current chapter
                currentChapterIndex = allChapters.findIndex(ch => ch.number === chapterNumber);
                if (currentChapterIndex === -1) {
                    throw new Error('Chapter not found');
                }

                currentChapter = allChapters[currentChapterIndex];
                const manhwaTitle = MANHWA_DATA[manhwaSlug]?.title || data.manhwaTitle;

                // Display chapter
                displayChapter(manhwaTitle, currentChapter);

            } catch (error) {
                showError(error.message);
            }
        }`;
    
    // Replace the loadChapter function
    html = html.replace(/async function loadChapter\(\) \{[\s\S]*?catch \(error\) \{[\s\S]*?\}\s*\}/m, newLoadFunction);
    
    // Save
    const outputPath = path.join(__dirname, 'reader-lite.html');
    await fs.writeFile(outputPath, html, 'utf-8');
    
    console.log(`✅ Reader built: reader-lite.html`);
}

buildDetailPageLite();
