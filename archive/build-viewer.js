import fs from 'fs-extra';

async function buildViewer() {
    console.log('🔨 Building viewer with embedded JSON...\n');

    try {
        // Read JSON data
        const jsonData = await fs.readJSON('data/manhwa-all.json');
        console.log(`✅ Loaded ${jsonData.length} manhwa from JSON`);

        // Read HTML template
        let htmlContent = await fs.readFile('viewer.html', 'utf-8');
        console.log('✅ Loaded HTML template');

        // Embed JSON data
        const jsonString = JSON.stringify(jsonData);
        htmlContent = htmlContent.replace(
            'const EMBEDDED_DATA = null;',
            `const EMBEDDED_DATA = ${jsonString};`
        );

        // Write to new file
        await fs.writeFile('viewer-standalone.html', htmlContent);
        console.log('✅ Created viewer-standalone.html');

        console.log('\n' + '='.repeat(60));
        console.log('✅ Build complete!');
        console.log('📁 File: viewer-standalone.html');
        console.log('💡 File ini bisa dibuka langsung tanpa server!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

buildViewer();
