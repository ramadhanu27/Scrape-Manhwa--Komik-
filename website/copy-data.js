import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyData() {
    console.log('📦 Copying data files...\n');

    try {
        // Create public/data directory
        const publicDataDir = path.join(__dirname, 'public', 'data');
        await fs.ensureDir(publicDataDir);

        // Copy manhwa-list.json
        const sourceFile = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list.json');
        const destFile = path.join(publicDataDir, 'manhwa-list.json');

        if (await fs.pathExists(sourceFile)) {
            await fs.copy(sourceFile, destFile);
            console.log('✅ Copied manhwa-list.json');
            
            // Show stats
            const data = await fs.readJSON(destFile);
            const count = data.manhwa ? data.manhwa.length : data.length;
            console.log(`   📊 Total manhwa: ${count}\n`);
        } else {
            console.log('❌ Source file not found:', sourceFile);
            console.log('   Please run scraper first!\n');
        }

        // Copy chapters folder (optional)
        const sourceChaptersDir = path.join(__dirname, '..', 'chapters', 'manhwaindo');
        const destChaptersDir = path.join(publicDataDir, 'chapters', 'manhwaindo');

        if (await fs.pathExists(sourceChaptersDir)) {
            await fs.ensureDir(destChaptersDir);
            await fs.copy(sourceChaptersDir, destChaptersDir);
            
            const files = await fs.readdir(destChaptersDir);
            const jsonFiles = files.filter(f => f.endsWith('.json'));
            console.log('✅ Copied chapters folder');
            console.log(`   📚 Total chapter files: ${jsonFiles.length}\n`);
        } else {
            console.log('⚠️  Chapters folder not found (optional)');
            console.log('   You can copy it later if needed\n');
        }

        console.log('✅ Data copy complete!');
        console.log('\n📁 Files location:');
        console.log(`   ${publicDataDir}\n`);
        console.log('🚀 Now run: npm run dev');

    } catch (error) {
        console.error('❌ Error copying data:', error.message);
    }
}

copyData();
