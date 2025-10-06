import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ShinigamiImageScraper {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'data');
    }

    async init() {
        console.log('🚀 Launching browser...');
        this.browser = await puppeteer.launch({
            headless: false, // Set true untuk background
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });
        console.log('✅ Browser ready!\n');
    }

    async scrapeAllPages(baseUrl = 'https://07.shinigami.asia/search', maxPages = 10) {
        console.log(`📡 Starting pagination scraping (max ${maxPages} pages)...\n`);
        
        let allManhwa = [];
        let emptyPageCount = 0;
        
        // First page - navigate to URL
        console.log(`📄 Page 1/${maxPages}: ${baseUrl}`);
        await this.page.goto(baseUrl, { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });
        
        console.log('   ⏳ Waiting for content...');
        await this.page.waitForSelector('.grid', { timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Extract first page
        let pageData = await this.extractManhwaFromPage();
        console.log(`   ✅ Found ${pageData.length} manhwa on this page`);
        allManhwa = allManhwa.concat(pageData);
        console.log(`   📊 Total unique manhwa: ${allManhwa.length}\n`);
        
        // Loop for remaining pages - use button clicks
        for (let currentPage = 2; currentPage <= maxPages; currentPage++) {
            console.log(`📄 Page ${currentPage}/${maxPages}: Clicking next button...`);
            
            try {
                // Try to click next page button
                const nextClicked = await this.page.evaluate((pageNum) => {
                    // Find all buttons in pagination area
                    const buttons = Array.from(document.querySelectorAll('button'));
                    
                    // Strategy 1: Find button with page number
                    const pageBtn = buttons.find(btn => {
                        const text = btn.textContent.trim();
                        return text === pageNum.toString();
                    });
                    
                    if (pageBtn) {
                        console.log(`Clicking page ${pageNum} button`);
                        pageBtn.click();
                        return true;
                    }
                    
                    // Strategy 2: Find next arrow button (>)
                    const nextBtn = buttons.find(btn => {
                        const text = btn.textContent.trim();
                        const hasArrow = text === '>' || text === '›' || text === '→';
                        const isEnabled = !btn.disabled && 
                                        !btn.classList.contains('disabled') && 
                                        !btn.classList.contains('opacity-50') &&
                                        !btn.hasAttribute('disabled');
                        return hasArrow && isEnabled;
                    });
                    
                    if (nextBtn) {
                        console.log('Clicking next arrow button');
                        nextBtn.click();
                        return true;
                    }
                    
                    return false;
                }, currentPage);
                
                if (!nextClicked) {
                    console.log('   ⚠️  Next button not found or disabled\n');
                    break;
                }
                
                console.log('   ⏳ Waiting for new content...');
                
                // Wait for content to update
                await new Promise(resolve => setTimeout(resolve, 3000));

                // Extract manhwa from current page
                pageData = await this.extractManhwaFromPage();
                
                if (pageData.length === 0) {
                    emptyPageCount++;
                    console.log(`   ⚠️  No manhwa found on this page (${emptyPageCount}/3)\n`);
                    
                    // If 3 consecutive empty pages, stop
                    if (emptyPageCount >= 3) {
                        console.log('   ✅ Reached end (3 consecutive empty pages)\n');
                        break;
                    }
                    continue;
                }
                
                // Reset empty page counter
                emptyPageCount = 0;
                
                console.log(`   ✅ Found ${pageData.length} manhwa on this page`);
                
                // Remove duplicates before adding
                const existingUrls = new Set(allManhwa.map(m => m.url));
                const newManhwa = pageData.filter(m => !existingUrls.has(m.url));
                
                if (newManhwa.length === 0) {
                    console.log(`   ⚠️  All manhwa are duplicates! Reached end.\n`);
                    break;
                }
                
                allManhwa = allManhwa.concat(newManhwa);
                console.log(`   ➕ Added ${newManhwa.length} new manhwa (${pageData.length - newManhwa.length} duplicates)`);
                console.log(`   📊 Total unique manhwa: ${allManhwa.length}\n`);
                
            } catch (error) {
                console.log(`   ⚠️  Error on page ${currentPage}: ${error.message}\n`);
                emptyPageCount++;
                
                if (emptyPageCount >= 3) {
                    console.log('   ✅ Stopping due to repeated errors\n');
                    break;
                }
            }
        }
        
        console.log(`\n✅ Scraping complete! Total: ${allManhwa.length} manhwa\n`);
        return allManhwa;
    }

    async extractManhwaFromPage() {

        const manhwaList = await this.page.evaluate(() => {
            const manhwaCards = [];
            const grid = document.querySelector('.grid.mb-24');
            
            if (!grid) return [];

            const links = grid.querySelectorAll('a[href*="/series/"]');
            
            links.forEach((link, index) => {
                try {
                    const href = link.getAttribute('href');
                    const url = href.startsWith('http') ? href : 'https://07.shinigami.asia' + href;
                    
                    // Get title
                    const titleElement = link.querySelector('h4.text-base-white');
                    const title = titleElement ? titleElement.textContent.trim() : '';
                    
                    if (!title) return;
                    
                    // Get image - REAL URL from src or data-src
                    const img = link.querySelector('img');
                    let imageUrl = '';
                    if (img) {
                        imageUrl = img.getAttribute('src') || 
                                   img.getAttribute('data-src') || 
                                   img.getAttribute('data-lazy-src') || '';
                        
                        // If relative URL, make it absolute
                        if (imageUrl && imageUrl.startsWith('/')) {
                            imageUrl = 'https://07.shinigami.asia' + imageUrl;
                        }
                    }
                    
                    const imageAlt = img ? img.getAttribute('alt') || title : title;
                    
                    // Get stats (views, chapter)
                    const statsElements = link.querySelectorAll('.bg-base-white\\/25, [class*="bg-base-white"]');
                    let views = '0';
                    let latestChapter = '';
                    
                    statsElements.forEach(elem => {
                        const text = elem.textContent.trim();
                        if (text.match(/[0-9.]+[km]/i)) {
                            views = text;
                        } else if (text.match(/CH\.|Chapter/i)) {
                            latestChapter = text;
                        }
                    });
                    
                    // Get update time
                    const timeElements = link.querySelectorAll('.text-10, .text-12');
                    let updateTime = '';
                    timeElements.forEach(elem => {
                        const text = elem.textContent.trim();
                        if (text.match(/\d+[hd]/)) {
                            updateTime = text;
                        }
                    });
                    
                    // Get status
                    const statusElement = link.querySelector('.bg-base-white\\/10, [class*="status"]');
                    const status = statusElement ? statusElement.textContent.trim() : 'Ongoing';
                    
                    manhwaCards.push({
                        title,
                        url,
                        slug: url.replace(/https?:\/\//g, '').replace(/\//g, ''),
                        image: imageUrl,
                        imageAlt,
                        latestChapter: latestChapter || 'N/A',
                        status,
                        views,
                        updateTime: updateTime || 'N/A',
                        scrapedAt: new Date().toISOString()
                    });
                    
                } catch (error) {
                    console.error('Error parsing card:', error);
                }
            });
            
            return manhwaCards;
        });

        return manhwaList;
    }

    async saveToJSON(data, filename) {
        await fs.ensureDir(this.outputDir);
        const filepath = path.join(this.outputDir, filename);
        await fs.writeJSON(filepath, data, { spaces: 2 });
        console.log(`💾 Data saved to: ${filepath}`);
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
    console.log('🎨 SHINIGAMI SCRAPER - Real Images with Puppeteer');
    console.log('='.repeat(60));
    console.log('');

    // Get max pages from command line argument (default: 10)
    const args = process.argv.slice(2);
    const maxPages = args[0] ? parseInt(args[0]) : 10;
    
    console.log(`📊 Settings:`);
    console.log(`   Max Pages: ${maxPages} (set to 999 for all manhwa)`);
    console.log(`   Estimated manhwa: ~${maxPages * 24}`);
    console.log('');

    const scraper = new ShinigamiImageScraper();

    try {
        await scraper.init();
        
        const manhwaList = await scraper.scrapeAllPages('https://07.shinigami.asia/search', maxPages);
        
        if (manhwaList.length === 0) {
            console.log('⚠️  No manhwa found!');
            return;
        }

        // Save to JSON
        await scraper.saveToJSON(manhwaList, 'manhwa-real-images.json');
        
        // Generate summary
        const summary = {
            totalManhwa: manhwaList.length,
            scrapedAt: new Date().toISOString(),
            source: 'https://07.shinigami.asia/search',
            manhwa: manhwaList
        };
        
        await scraper.saveToJSON(summary, 'manhwa-all.json');
        
        console.log('');
        console.log('='.repeat(60));
        console.log('✅ Scraping complete!');
        console.log(`📊 Total: ${manhwaList.length} manhwa`);
        console.log('📁 Files:');
        console.log('   - data/manhwa-real-images.json');
        console.log('   - data/manhwa-all.json');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await scraper.close();
    }
}

main();
