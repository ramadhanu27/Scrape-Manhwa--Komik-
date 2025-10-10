import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateSafeFilename(title) {
    return title
        .toLowerCase()
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 100);
}

async function renameJsonFiles() {
    console.log('🔄 Renaming JSON files from slug to title...\n');

    try {
        const chaptersDir = path.join(__dirname, '..', 'chapters', 'shinigami');
        
        // Check if directory exists
        if (!await fs.pathExists(chaptersDir)) {
            console.log('❌ Chapters directory not found:', chaptersDir);
            return;
        }

        const files = await fs.readdir(chaptersDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        console.log(`📁 Found ${jsonFiles.length} JSON files\n`);

        let renamed = 0;
        let skipped = 0;
        let errors = 0;

        for (const file of jsonFiles) {
            const oldPath = path.join(chaptersDir, file);
            
            try {
                // Read JSON data
                const data = await fs.readJSON(oldPath);
                
                if (!data.manhwaTitle) {
                    console.log(`⚠️  Skipped: ${file} (no title in JSON)`);
                    skipped++;
                    continue;
                }

                // Generate new filename
                const newFilename = generateSafeFilename(data.manhwaTitle) + '.json';
                const newPath = path.join(chaptersDir, newFilename);

                // Check if already renamed
                if (file === newFilename) {
                    console.log(`✅ Already renamed: ${file}`);
                    skipped++;
                    continue;
                }

                // Check if target file already exists
                if (await fs.pathExists(newPath)) {
                    console.log(`⚠️  Target exists: ${newFilename}`);
                    console.log(`   Old: ${file}`);
                    console.log(`   Will merge data...`);
                    
                    // Merge chapters
                    const existingData = await fs.readJSON(newPath);
                    const existingNumbers = new Set(existingData.chapters.map(ch => ch.number));
                    
                    // Add new chapters that don't exist
                    const newChapters = data.chapters.filter(ch => !existingNumbers.has(ch.number));
                    
                    if (newChapters.length > 0) {
                        existingData.chapters = [...existingData.chapters, ...newChapters];
                        existingData.chapters.sort((a, b) => parseInt(b.number) - parseInt(a.number));
                        existingData.totalChapters = existingData.chapters.length;
                        await fs.writeJSON(newPath, existingData, { spaces: 2 });
                        console.log(`   ✅ Merged ${newChapters.length} chapters`);
                    }
                    
                    // Delete old file
                    await fs.remove(oldPath);
                    console.log(`   🗑️  Deleted old file: ${file}\n`);
                    renamed++;
                    continue;
                }

                // Rename file
                await fs.rename(oldPath, newPath);
                console.log(`✅ Renamed:`);
                console.log(`   Old: ${file}`);
                console.log(`   New: ${newFilename}\n`);
                renamed++;

            } catch (error) {
                console.log(`❌ Error processing ${file}: ${error.message}\n`);
                errors++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log(`   ✅ Renamed: ${renamed}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

renameJsonFiles();
