import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManhwaIndoScraper {
    constructor() {
        this.baseUrl = 'https://manhwaindo.app/series/?status=&type=manhwa&order=update';
        this.dataDir = path.join(__dirname, '..', 'data', 'manhwaindo');
    }

    async init(headless = false) {
        console.log('🚀 Launching browser...');
        this.browser = await puppeteer.launch({
            headless: headless,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });
        console.log(`✅ Browser ready (${headless ? 'headless' : 'visible'})!\n`);
    }

    async scrapeManhwaDetails(manhwaUrl, page = null) {
        try {
            const targetPage = page || this.page;
            
            await targetPage.goto(manhwaUrl, { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            const details = await targetPage.evaluate(() => {
                const data = {};
                
                // Get info from .info-right
                const infoItems = document.querySelectorAll('.info-right .info-desc .imptx');
                infoItems.forEach(item => {
                    const label = item.previousElementSibling?.textContent.trim() || '';
                    const value = item.textContent.trim();
                    
                    if (label.includes('Status')) data.status = value;
                    if (label.includes('Type')) data.type = value;
                    if (label.includes('Released')) data.released = value;
                    if (label.includes('Author')) data.author = value;
                    if (label.includes('Posted By')) data.postedBy = value;
                    if (label.includes('Posted On')) data.postedOn = value;
                    if (label.includes('Updated On')) data.updatedOn = value;
                    if (label.includes('Views')) data.views = value;
                });
                
                // Get genres
                const genreElements = document.querySelectorAll('.wd-full .mgen a');
                data.genres = Array.from(genreElements).map(a => a.textContent.trim());
                
                // Get synopsis
                const synopsisElement = document.querySelector('.entry-content.entry-content-single');
                data.synopsis = synopsisElement ? synopsisElement.textContent.trim() : '';
                
                return data;
            });

            return details;

        } catch (error) {
            console.error(`   ⚠️  Error scraping details: ${error.message}`);
            return null;
        }
    }

    async scrapeSinglePage(pageNum) {
        try {
            const pageUrl = `${this.baseUrl}&page=${pageNum}`;
            const page = await this.browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            
            await page.goto(pageUrl, { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Extract manhwa from this page
            const manhwaList = await page.evaluate(() => {
                const manhwaCards = [];
                const cards = document.querySelectorAll('.listupd .bs');
                
                cards.forEach(card => {
                    try {
                        const linkElement = card.querySelector('a[href*="/series/"]');
                        if (!linkElement) return;
                        
                        const url = linkElement.href;
                        const titleElement = card.querySelector('.tt');
                        const title = titleElement ? titleElement.textContent.trim() : '';
                        const imgElement = card.querySelector('img');
                        const image = imgElement ? (imgElement.src || imgElement.dataset.src) : '';
                        const typeElement = card.querySelector('.limit');
                        let type = typeElement ? typeElement.textContent.trim() : 'MANHWA';
                        type = type.replace(/\s+/g, ' ').trim();
                        let latestChapter = '';
                        const chapterElement = card.querySelector('.adds .epx, .epxs');
                        if (chapterElement) {
                            latestChapter = chapterElement.textContent.trim();
                        }
                        const ratingElement = card.querySelector('.rating');
                        const rating = ratingElement ? ratingElement.textContent.trim() : 'N/A';
                        
                        manhwaCards.push({
                            title,
                            url,
                            image,
                            type,
                            latestChapter,
                            rating,
                            scrapedAt: new Date().toISOString()
                        });
                    } catch (error) {
                        console.error('Error parsing card:', error);
                    }
                });
                
                return manhwaCards;
            });

            await page.close();
            return manhwaList;

        } catch (error) {
            console.error(`❌ Error scraping page ${pageNum}: ${error.message}`);
            return [];
        }
    }

    async scrapeManhwaList(maxPages = 5, includeDetails = false, parallelPages = false, parallelCount = 5) {
        try {
            let allManhwa = [];

            if (parallelPages && !includeDetails) {
                // Parallel page scraping (fast for basic info)
                console.log(`📡 Scraping ${maxPages} pages in parallel...\n`);
                
                const pagePromises = [];
                for (let i = 1; i <= maxPages; i++) {
                    pagePromises.push(this.scrapeSinglePage(i));
                }
                
                const results = await Promise.all(pagePromises);
                
                results.forEach((manhwaList, index) => {
                    console.log(`✅ Page ${index + 1}: ${manhwaList.length} manhwa`);
                    allManhwa = allManhwa.concat(manhwaList);
                });
                
                console.log(`\n📊 Total: ${allManhwa.length} manhwa from ${maxPages} pages\n`);
                
            } else {
                // Sequential page scraping (for details mode)
                console.log(`📡 Loading: ${this.baseUrl}\n`);
                await this.page.goto(this.baseUrl, { 
                    waitUntil: 'networkidle2',
                    timeout: 60000 
                });

                await new Promise(resolve => setTimeout(resolve, 2000));

                let currentPage = 1;

                while (currentPage <= maxPages) {
                    console.log(`📄 Scraping page ${currentPage}/${maxPages}...`);

                // Extract manhwa from current page
                const manhwaList = await this.page.evaluate(() => {
                    const manhwaCards = [];
                    
                    // Find all manhwa cards in the grid
                    const cards = document.querySelectorAll('.listupd .bs');
                    
                    cards.forEach(card => {
                        try {
                            // Get link
                            const linkElement = card.querySelector('a[href*="/series/"]');
                            if (!linkElement) return;
                            
                            const url = linkElement.href;
                            
                            // Get title
                            const titleElement = card.querySelector('.tt');
                            const title = titleElement ? titleElement.textContent.trim() : '';
                            
                            // Get image
                            const imgElement = card.querySelector('img');
                            const image = imgElement ? (imgElement.src || imgElement.dataset.src) : '';
                            
                            // Get type badge
                            const typeElement = card.querySelector('.limit');
                            let type = typeElement ? typeElement.textContent.trim() : 'MANHWA';
                            type = type.replace(/\s+/g, ' ').trim(); // Clean whitespace
                            
                            // Get latest chapter (from .adds .epx or .epxs)
                            let latestChapter = '';
                            const chapterElement = card.querySelector('.adds .epx, .epxs');
                            if (chapterElement) {
                                latestChapter = chapterElement.textContent.trim();
                            }
                            
                            // Get rating
                            const ratingElement = card.querySelector('.rating');
                            const rating = ratingElement ? ratingElement.textContent.trim() : 'N/A';
                            
                            manhwaCards.push({
                                title,
                                url,
                                image,
                                type,
                                latestChapter,
                                rating,
                                scrapedAt: new Date().toISOString()
                            });
                        } catch (error) {
                            console.error('Error parsing card:', error);
                        }
                    });
                    
                    return manhwaCards;
                });

                allManhwa = allManhwa.concat(manhwaList);
                console.log(`✅ Found ${manhwaList.length} manhwa on page ${currentPage}`);
                console.log(`📊 Total so far: ${allManhwa.length} manhwa\n`);

                // Scrape details if requested
                if (includeDetails && manhwaList.length > 0) {
                    console.log(`📝 Scraping details for ${manhwaList.length} manhwa (${parallelCount}x parallel)...`);
                    
                    // Create multiple pages for parallel scraping
                    const pages = [this.page];
                    for (let i = 0; i < parallelCount - 1; i++) {
                        const newPage = await this.browser.newPage();
                        await newPage.setViewport({ width: 1920, height: 1080 });
                        pages.push(newPage);
                    }
                    
                    // Process in batches
                    const batchSize = parallelCount;
                    for (let i = 0; i < manhwaList.length; i += batchSize) {
                        const batch = manhwaList.slice(i, i + batchSize);
                        const startIndex = allManhwa.length - manhwaList.length + i;
                        
                        // Scrape batch in parallel using different pages
                        const detailsPromises = batch.map((manhwa, batchIndex) => {
                            const index = startIndex + batchIndex;
                            const page = pages[batchIndex % pages.length];
                            return this.scrapeManhwaDetails(allManhwa[index].url, page);
                        });
                        
                        const batchDetails = await Promise.all(detailsPromises);
                        
                        // Merge details
                        batchDetails.forEach((details, batchIndex) => {
                            const index = startIndex + batchIndex;
                            if (details) {
                                allManhwa[index] = { ...allManhwa[index], ...details };
                            }
                        });
                        
                        process.stdout.write(`\r   Details: ${Math.min(i + batchSize, manhwaList.length)}/${manhwaList.length}`);
                    }
                    
                    // Close additional pages
                    for (let i = 1; i < pages.length; i++) {
                        await pages[i].close();
                    }
                    
                    console.log('\n');
                }

                // Check if there's a next page
                if (currentPage < maxPages) {
                    // Try to navigate to next page using URL parameter
                    const nextPageUrl = `${this.baseUrl}&page=${currentPage + 1}`;
                    
                    try {
                        await this.page.goto(nextPageUrl, { 
                            waitUntil: 'networkidle2',
                            timeout: 60000 
                        });
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // Verify we got content
                        const hasContent = await this.page.evaluate(() => {
                            const cards = document.querySelectorAll('.listupd .bs');
                            return cards.length > 0;
                        });
                        
                        if (hasContent) {
                            currentPage++;
                        } else {
                            console.log('⚠️  No more pages available');
                            break;
                        }
                    } catch (error) {
                        console.log('⚠️  Could not navigate to next page');
                        break;
                    }
                } else {
                    break;
                }
            }
            }

            return allManhwa;

        } catch (error) {
            console.error('❌ Error scraping:', error.message);
            return [];
        }
    }

    async saveData(manhwaList) {
        try {
            await fs.ensureDir(this.dataDir);
            
            const outputFile = path.join(this.dataDir, 'manhwa-list.json');
            await fs.writeJSON(outputFile, {
                source: 'manhwaindo.app',
                totalManhwa: manhwaList.length,
                scrapedAt: new Date().toISOString(),
                manhwa: manhwaList
            }, { spaces: 2 });

            console.log(`\n💾 Data saved: ${outputFile}`);
            console.log(`📊 Total manhwa: ${manhwaList.length}`);
        } catch (error) {
            console.error('❌ Error saving data:', error.message);
        }
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
    console.log('📚 MANHWAINDO.APP SCRAPER');
    console.log('='.repeat(60));
    console.log('');

    const args = process.argv.slice(2);
    const maxPages = args[0] ? parseInt(args[0]) : 5;
    const includeDetails = args[1] === 'details' || args[1] === 'full';
    const parallelPages = args[1] === 'parallel' || args[2] === 'parallel';
    const parallelCount = args[2] && !isNaN(parseInt(args[2])) ? parseInt(args[2]) : 5; // Default 5x parallel
    const headless = args[3] === 'headless'; // Show browser by default (remove auto headless)

    const scraper = new ManhwaIndoScraper();

    try {
        await scraper.init(headless);
        
        if (includeDetails) {
            console.log(`📖 Will scrape ${maxPages} pages WITH DETAILS (${parallelCount}x parallel, ${headless ? 'headless' : 'visible'})\n`);
        } else if (parallelPages) {
            console.log(`📖 Will scrape ${maxPages} pages in PARALLEL (${maxPages} tabs at once, ${headless ? 'headless' : 'visible'})\n`);
        } else {
            console.log(`📖 Will scrape ${maxPages} pages (basic info only)\n`);
        }
        
        const manhwaList = await scraper.scrapeManhwaList(maxPages, includeDetails, parallelPages, parallelCount);
        
        if (manhwaList.length > 0) {
            await scraper.saveData(manhwaList);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Scraping complete!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    } finally {
        await scraper.close();
    }
}

main();
