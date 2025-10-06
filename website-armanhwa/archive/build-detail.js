import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildDetailPage() {
    console.log('🔨 Building detail page with embedded chapters...\n');

    try {
        // Read all chapter files
        const chaptersDir = path.join(__dirname, '..', 'chapters', 'manhwaindo');
        const chapterFiles = await fs.readdir(chaptersDir);
        
        const allChaptersData = {};
        
        for (const file of chapterFiles) {
            if (file.endsWith('.json')) {
                const slug = file.replace('.json', '');
                const filePath = path.join(chaptersDir, file);
                const data = await fs.readJSON(filePath);
                allChaptersData[slug] = data;
                console.log(`✅ Loaded: ${slug} (${data.chapters.length} chapters)`);
            }
        }

        console.log(`\n📊 Total: ${Object.keys(allChaptersData).length} manhwa with chapters`);

        // Read detail.html template
        const templatePath = path.join(__dirname, 'detail.html');
        let html = await fs.readFile(templatePath, 'utf-8');

        // Load manhwa data
        const manhwaDataPath = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list.json');
        const manhwaData = await fs.readJSON(manhwaDataPath);
        
        // Create manhwa lookup by slug
        const manhwaLookup = {};
        manhwaData.manhwa.forEach(m => {
            const slug = m.url.split('/').filter(Boolean).pop();
            manhwaLookup[slug] = m;
        });

        // Embed chapters data and manhwa data
        const embedScript = `
    <script>
        // Embedded chapters data
        const CHAPTERS_DATA = ${JSON.stringify(allChaptersData, null, 2)};
        
        // Embedded manhwa data (lookup by slug)
        const MANHWA_DATA = ${JSON.stringify(manhwaLookup, null, 2)};
    </script>`;

        // Insert before closing </head>
        html = html.replace('</head>', `${embedScript}\n</head>`);

        // Replace loadChapters function to use embedded data
        const newLoadFunction = `
        async function loadChapters(slug) {
            try {
                const data = CHAPTERS_DATA[slug];
                
                if (data && data.chapters) {
                    displayChapters(data.chapters);
                } else {
                    document.getElementById('chapters-container').innerHTML = \`
                        <div class="no-chapters">
                            📭 Chapters belum di-scrape.<br>
                            <small>Manhwa: \${slug}</small><br>
                            <small>Gunakan: node scrape-chapters-manhwaindo.js</small>
                        </div>
                    \`;
                }
            } catch (error) {
                console.error('Error loading chapters:', error);
                document.getElementById('chapters-container').innerHTML = \`
                    <div class="no-chapters">
                        ⚠️ Error loading chapters
                    </div>
                \`;
            }
        }`;

        // Replace the loadChapters function
        html = html.replace(/async function loadChapters\(slug\) \{[\s\S]*?^\s*\}/m, newLoadFunction);
        
        // Replace the manhwa data loading logic
        const newManhwaLoadLogic = `
        // Load manhwa data from embedded data
        const manhwaData = MANHWA_DATA[manhwaSlug];

        if (manhwaData) {
            displayManhwaInfo(manhwaData);
        } else {
            // Fallback: try localStorage
            const localData = JSON.parse(localStorage.getItem('current-manhwa'));
            if (localData) {
                displayManhwaInfo(localData);
            } else {
                alert('Manhwa not found!');
                window.location.href = 'standalone.html';
            }
        }`;
        
        // Replace the data loading section
        html = html.replace(
            /\/\/ Load manhwa data from localStorage[\s\S]*?window\.location\.href = 'standalone\.html';[\s\S]*?}/m,
            newManhwaLoadLogic
        );

        // Save as detail-standalone.html
        const outputPath = path.join(__dirname, 'detail-standalone.html');
        await fs.writeFile(outputPath, html, 'utf-8');

        console.log(`\n✅ Detail page built successfully!`);
        console.log(`📁 Output: ${outputPath}`);
        console.log(`📊 Embedded: ${Object.keys(allChaptersData).length} manhwa chapters`);
        console.log(`\n🎉 Use detail-standalone.html for offline chapter list!`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

buildDetailPage();
