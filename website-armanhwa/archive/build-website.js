import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildWebsite() {
    console.log('🔨 Building ARManhwa website...\n');

    try {
        // Read JSON data
        const jsonPath = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list.json');
        const jsonData = await fs.readJSON(jsonPath);
        
        console.log(`✅ Loaded ${jsonData.manhwa.length} manhwa from JSON`);

        // Read HTML template
        const templatePath = path.join(__dirname, 'index.html');
        let html = await fs.readFile(templatePath, 'utf-8');

        // Embed data into HTML
        const dataScript = `
        <script>
        // Embedded data - no need to fetch
        const EMBEDDED_DATA = ${JSON.stringify(jsonData, null, 2)};
        </script>
        `;

        // Replace the loadManhwa function
        const newLoadFunction = `
        // Load data from embedded JSON
        async function loadManhwa() {
            try {
                const data = EMBEDDED_DATA;
                allManhwa = data.manhwa || [];
                filteredManhwa = [...allManhwa];
                
                if (allManhwa.length === 0) {
                    throw new Error('Data manhwa kosong');
                }
                
                document.getElementById('total-manhwa').textContent = allManhwa.length;
                
                // Calculate total chapters
                const totalChapters = allManhwa.reduce((sum, m) => {
                    const match = m.latestChapter?.match(/\\d+/);
                    return sum + (match ? parseInt(match[0]) : 0);
                }, 0);
                document.getElementById('total-chapters').textContent = totalChapters.toLocaleString();
                
                renderManhwa();
                console.log('✅ Loaded', allManhwa.length, 'manhwa');
            } catch (error) {
                console.error('Error:', error);
                document.getElementById('manhwa-container').innerHTML = \`
                    <div class="no-results">
                        ❌ Error loading data: \${error.message}
                    </div>
                \`;
            }
        }`;

        // Insert embedded data before closing </head>
        html = html.replace('</head>', `${dataScript}\n</head>`);

        // Replace the entire loadManhwa function more precisely
        const loadFunctionRegex = /async function loadManhwa\(\) \{[\s\S]*?^\s*\}/m;
        html = html.replace(loadFunctionRegex, newLoadFunction);

        // Save as standalone.html
        const outputPath = path.join(__dirname, 'standalone.html');
        await fs.writeFile(outputPath, html, 'utf-8');

        console.log(`\n✅ Website built successfully!`);
        console.log(`📁 Output: ${outputPath}`);
        console.log(`\n🎉 You can now open standalone.html directly in browser!`);
        console.log(`   No server needed - data is embedded.`);

    } catch (error) {
        console.error('❌ Error building website:', error.message);
    }
}

buildWebsite();
