import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const CONFIG = {
    // Check interval in hours
    checkInterval: 6, // Check every 6 hours
    
    // Scraper parameters
    manhwaCount: 75,
    maxChapters: null,
    parallelChapters: 2
};

async function runScraper() {
    console.log('\n' + '='.repeat(60));
    console.log(`🔄 Auto-update started: ${new Date().toLocaleString()}`);
    console.log('='.repeat(60) + '\n');

    try {
        const command = `node scrape-chapters-url-only.js ${CONFIG.manhwaCount} null ${CONFIG.parallelChapters}`;
        
        console.log(`Running: ${command}\n`);
        
        const { stdout, stderr } = await execAsync(command);
        
        if (stdout) console.log(stdout);
        if (stderr) console.error('Errors:', stderr);
        
        console.log('\n✅ Update completed successfully!');
        
    } catch (error) {
        console.error('❌ Update failed:', error.message);
    }
    
    console.log(`\n⏰ Next update in ${CONFIG.checkInterval} hours`);
    console.log('='.repeat(60) + '\n');
}

async function startAutoUpdate() {
    console.log('============================================================');
    console.log('🤖 MANHWAINDO AUTO-UPDATE SERVICE');
    console.log('============================================================\n');
    console.log(`⏰ Check interval: Every ${CONFIG.checkInterval} hours`);
    console.log(`📊 Target: ${CONFIG.manhwaCount} manhwa`);
    console.log(`⚡ Parallel: ${CONFIG.parallelChapters} chapters\n`);
    console.log('Press Ctrl+C to stop\n');
    console.log('='.repeat(60));

    // Run immediately on start
    await runScraper();

    // Then run every X hours
    const intervalMs = CONFIG.checkInterval * 60 * 60 * 1000;
    setInterval(runScraper, intervalMs);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Auto-update service stopped');
    process.exit(0);
});

startAutoUpdate();
