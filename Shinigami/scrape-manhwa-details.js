import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManhwaDetailScraper {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'data');
    }

    async init() {
        console.log('🚀 Launching browser...');
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });
        console.log('✅ Browser ready!\n');
    }

    async scrapeDetail(url) {
        try {
            console.log(`   📡 Navigating to: ${url}`);
            await this.page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            const details = await this.page.evaluate(() => {
                const data = {};

                // Title
                const titleElement = document.querySelector('h1, .text-2xl, .text-3xl');
                data.title = titleElement ? titleElement.textContent.trim() : '';

                // Alternative title
                const altTitleElement = document.querySelector('.text-sm.text-gray-400, .text-base-white\\/60');
                data.alternativeTitle = altTitleElement ? altTitleElement.textContent.trim() : '';

                // Cover image
                const coverImg = document.querySelector('img[alt*="cover"], img[src*="cover"], .rounded-lg img, img.object-cover');
                data.coverImage = coverImg ? (coverImg.src || coverImg.dataset.src || '') : '';

                // Synopsis/Description
                const synopsisElement = document.querySelector('.text-justify, .synopsis, [class*="description"]');
                data.synopsis = synopsisElement ? synopsisElement.textContent.trim() : '';

                // Stats (views, bookmarks, etc)
                const statsElements = document.querySelectorAll('[class*="stat"], .flex.items-center.gap-2');
                data.stats = {
                    views: '0',
                    bookmarks: '0',
                    rating: '0',
                    followers: '0'
                };

                statsElements.forEach(elem => {
                    const text = elem.textContent.trim();
                    if (text.match(/\d+[km]?/i)) {
                        if (elem.querySelector('svg[class*="eye"]') || text.toLowerCase().includes('view')) {
                            data.stats.views = text.match(/[\d.]+[km]?/i)?.[0] || '0';
                        } else if (elem.querySelector('svg[class*="bookmark"]') || text.toLowerCase().includes('bookmark')) {
                            data.stats.bookmarks = text.match(/[\d.]+[km]?/i)?.[0] || '0';
                        } else if (elem.querySelector('svg[class*="star"]') || text.toLowerCase().includes('rating')) {
                            data.stats.rating = text.match(/[\d.]+/)?.[0] || '0';
                        }
                    }
                });

                // Genre
                const genreElements = document.querySelectorAll('[class*="genre"] button, [class*="Genre"] a, button[class*="badge"]');
                data.genres = Array.from(genreElements).map(el => el.textContent.trim()).filter(g => g.length > 0);

                // Author
                const authorElement = document.querySelector('[class*="Author"] + div, [class*="author"]');
                data.author = authorElement ? authorElement.textContent.trim() : '';

                // Artist
                const artistElement = document.querySelector('[class*="Artist"] + div, [class*="artist"]');
                data.artist = artistElement ? artistElement.textContent.trim() : '';

                // Type (Manhwa/Manga/Manhua)
                const typeElement = document.querySelector('[class*="Type"] + div, [class*="type"]');
                data.type = typeElement ? typeElement.textContent.trim() : 'Manhwa';

                // Format
                const formatElement = document.querySelector('[class*="Format"] + div, [class*="format"]');
                data.format = formatElement ? formatElement.textContent.trim() : '';

                // Status
                const statusElement = document.querySelector('[class*="status"], .badge');
                data.status = statusElement ? statusElement.textContent.trim() : 'Ongoing';

                // Chapters list
                const chapterElements = document.querySelectorAll('a[href*="/chapter/"], [class*="chapter"] a');
                data.chapters = Array.from(chapterElements).slice(0, 10).map(el => ({
                    title: el.textContent.trim(),
                    url: el.href,
                    uploadTime: el.querySelector('.text-sm, .text-xs')?.textContent.trim() || ''
                }));

                data.totalChapters = chapterElements.length;

                return data;
            });

            return details;

        } catch (error) {
            console.log(`   ❌ Error scraping ${url}: ${error.message}`);
            return null;
        }
    }

    async scrapeAllDetails(maxManhwa = 10) {
        console.log('📖 Loading manhwa list from JSON...\n');
        
        // Load manhwa list
        let manhwaList = await fs.readJSON(path.join(this.outputDir, 'manhwa-all.json'));
        
        // Handle wrapper format
        if (manhwaList.manhwa && Array.isArray(manhwaList.manhwa)) {
            manhwaList = manhwaList.manhwa;
        }

        console.log(`✅ Found ${manhwaList.length} manhwa in list`);
        console.log(`📊 Will scrape details for ${Math.min(maxManhwa, manhwaList.length)} manhwa\n`);

        const detailedManhwa = [];
        const limit = Math.min(maxManhwa, manhwaList.length);

        for (let i = 0; i < limit; i++) {
            const manhwa = manhwaList[i];
            console.log(`\n📚 [${i + 1}/${limit}] ${manhwa.title}`);
            
            const details = await this.scrapeDetail(manhwa.url);
            
            if (details) {
                // Merge basic info with details
                const fullData = {
                    ...manhwa,
                    ...details,
                    detailScrapedAt: new Date().toISOString()
                };
                
                detailedManhwa.push(fullData);
                console.log(`   ✅ Success! Genres: ${details.genres.join(', ')}`);
                console.log(`   📊 Chapters: ${details.totalChapters}, Views: ${details.stats.views}`);
            } else {
                // Keep basic info if detail scraping failed
                detailedManhwa.push(manhwa);
                console.log(`   ⚠️  Failed to get details, using basic info`);
            }

            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return detailedManhwa;
    }

    async saveToJSON(data, filename) {
        await fs.ensureDir(this.outputDir);
        const filepath = path.join(this.outputDir, filename);
        await fs.writeJSON(filepath, data, { spaces: 2 });
        console.log(`\n💾 Data saved to: ${filepath}`);
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

// Main execution
async function main() {
    console.log('='.repeat(60));
    console.log('📖 SHINIGAMI DETAIL SCRAPER - Scrape Manhwa Details');
    console.log('='.repeat(60));
    console.log('');

    // Get max manhwa from command line (default: 10)
    const args = process.argv.slice(2);
    const maxManhwa = args[0] ? parseInt(args[0]) : 10;

    const scraper = new ManhwaDetailScraper();

    try {
        await scraper.init();
        
        const detailedManhwa = await scraper.scrapeAllDetails(maxManhwa);
        
        // Save detailed data
        await scraper.saveToJSON(detailedManhwa, 'manhwa-detailed.json');
        
        // Also update manhwa-all.json
        const summary = {
            totalManhwa: detailedManhwa.length,
            scrapedAt: new Date().toISOString(),
            source: 'https://07.shinigami.asia',
            hasDetails: true,
            manhwa: detailedManhwa
        };
        
        await scraper.saveToJSON(summary, 'manhwa-all-detailed.json');
        
        console.log('');
        console.log('='.repeat(60));
        console.log('✅ Detail scraping complete!');
        console.log(`📊 Total: ${detailedManhwa.length} manhwa with full details`);
        console.log('📁 Files:');
        console.log('   - data/manhwa-detailed.json');
        console.log('   - data/manhwa-all-detailed.json');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await scraper.close();
    }
}

main();
