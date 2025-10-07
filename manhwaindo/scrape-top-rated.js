import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const args = process.argv.slice(2);
    const minRating = parseFloat(args[0]) || 8.0;
    const maxChaptersPerManhwa = args[1] === 'null' ? null : parseInt(args[1]) || 50;
    const parallelCount = parseInt(args[2]) || 8;

    console.log('============================================================');
    console.log('📖 TOP RATED MANHWA SCRAPER');
    console.log('============================================================\n');
    console.log(`⭐ Min Rating: ${minRating}`);
    console.log(`📚 Max Chapters: ${maxChaptersPerManhwa || 'ALL'}`);
    console.log(`🔄 Parallel: ${parallelCount}x\n`);

    try {
        // Load manhwa list
        const dataPath = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list.json');
        const jsonData = await fs.readJSON(dataPath);
        
        // Filter by rating
        const topRatedManhwa = jsonData.manhwa.filter(m => {
            const rating = parseFloat(m.rating);
            return !isNaN(rating) && rating >= minRating;
        });

        // Sort by rating (highest first)
        topRatedManhwa.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

        console.log(`✅ Found ${topRatedManhwa.length} manhwa with rating >= ${minRating}`);
        console.log(`📊 Total manhwa in database: ${jsonData.manhwa.length}\n`);

        // Show top 10
        console.log('🏆 Top 10 Manhwa:');
        topRatedManhwa.slice(0, 10).forEach((m, i) => {
            console.log(`   ${i + 1}. ${m.title} (⭐ ${m.rating})`);
        });
        console.log('');

        // Ask for confirmation
        console.log(`📋 Will scrape ${topRatedManhwa.length} manhwa`);
        console.log(`⏱️  Estimated time: ${Math.round(topRatedManhwa.length * 45 / 60)} hours\n`);

        // Create temporary filtered manhwa list
        const tempData = {
            ...jsonData,
            manhwa: topRatedManhwa,
            totalManhwa: topRatedManhwa.length,
            filteredBy: `rating >= ${minRating}`,
            filteredAt: new Date().toISOString()
        };

        const tempPath = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list-filtered.json');
        await fs.writeJSON(tempPath, tempData, { spaces: 2 });
        console.log(`✅ Created filtered list: manhwa-list-filtered.json\n`);

        // Now call the main scraper script for each manhwa
        console.log('🚀 Starting scraper...\n');
        
        // Create a temp file with just the top rated manhwa
        const originalPath = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list.json');
        const backupPath = path.join(__dirname, '..', 'data', 'manhwaindo', 'manhwa-list-backup.json');
        
        // Backup original
        await fs.copy(originalPath, backupPath);
        
        // Replace with filtered
        await fs.writeJSON(originalPath, tempData, { spaces: 2 });
        
        console.log('✅ Temporarily replaced manhwa-list.json with filtered version\n');
        console.log('🎯 Now run the main scraper:\n');
        console.log(`   node scrape-chapters-manhwaindo.js ${topRatedManhwa.length} ${maxChaptersPerManhwa || 'null'} ${parallelCount}\n`);
        console.log('📝 After scraping, restore original with:\n');
        console.log(`   mv manhwa-list-backup.json manhwa-list.json\n`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

main();
