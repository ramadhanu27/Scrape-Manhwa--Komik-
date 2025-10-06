import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function buildAll() {
    console.log('🔨 Building ARManhwa Website...\n');
    console.log('='.repeat(60));

    try {
        // Build main page
        console.log('\n📄 Step 1: Building main page...');
        await execAsync('node build-simple.js');
        
        // Build detail page
        console.log('\n📄 Step 2: Building detail page...');
        await execAsync('node build-detail.js');
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ All pages built successfully!\n');
        
        console.log('📁 Files created:');
        console.log('   - standalone.html (main page)');
        console.log('   - detail-standalone.html (detail page)');
        console.log('   - reader.html (chapter reader)\n');
        
        console.log('🎉 Website ready to use!');
        console.log('   Open: standalone.html\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

buildAll();
