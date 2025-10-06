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
                    // Filter manhwa yang belum ada details
                    const manhwaToScrape = [];
                    const startIndex = allManhwa.length - manhwaList.length;
                    
                    for (let i = 0; i < manhwaList.length; i++) {
                        const index = startIndex + i;
                        const manhwa = allManhwa[index];
                        
                        // Check if already has details (has genres or synopsis)
                        if (!manhwa.genres && !manhwa.synopsis) {
                            manhwaToScrape.push({ manhwa, index });
                        }
                    }
                    
                    const skipped = manhwaList.length - manhwaToScrape.length;
                    if (skipped > 0) {
                        console.log(`   ⏭️  Skipped ${skipped} manhwa (already have details)`);
                    }
                    
                    if (manhwaToScrape.length > 0) {
                        console.log(`📝 Scraping details for ${manhwaToScrape.length} manhwa (${parallelCount}x parallel)...`);
                        
                        // Create multiple pages for parallel scraping
                        const pages = [this.page];
                        for (let i = 0; i < parallelCount - 1; i++) {
                            const newPage = await this.browser.newPage();
                            await newPage.setViewport({ width: 1920, height: 1080 });
                            pages.push(newPage);
                        }
                        
                        // Process in batches
                        const batchSize = parallelCount;
                        for (let i = 0; i < manhwaToScrape.length; i += batchSize) {
                            const batch = manhwaToScrape.slice(i, i + batchSize);
                            
                            // Scrape batch in parallel using different pages
                            const detailsPromises = batch.map((item, batchIndex) => {
                                const page = pages[batchIndex % pages.length];
                                return this.scrapeManhwaDetails(item.manhwa.url, page);
                            });
                            
                            const batchDetails = await Promise.all(detailsPromises);
                            
                            // Merge details
                            batchDetails.forEach((details, batchIndex) => {
                                const item = batch[batchIndex];
                                if (details) {
                                    allManhwa[item.index] = { ...allManhwa[item.index], ...details };
                                }
                            });
                            
                            process.stdout.write(`\r   Details: ${Math.min(i + batchSize, manhwaToScrape.length)}/${manhwaToScrape.length}`);
                        }
                        
                        // Close additional pages
                        for (let i = 1; i < pages.length; i++) {
                            await pages[i].close();
                        }
                        
                        console.log('\n');
                    }
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

    async loadExistingData() {
        try {
            const outputFile = path.join(this.dataDir, 'manhwa-list.json');
            if (await fs.pathExists(outputFile)) {
                const data = await fs.readJSON(outputFile);
                return data.manhwa || [];
            }
        } catch (error) {
            console.log('   ℹ️  No existing data found, starting fresh');
        }
        return [];
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
        
        // Load existing data
        const existingData = await scraper.loadExistingData();
        if (existingData.length > 0) {
            console.log(`📂 Loaded ${existingData.length} existing manhwa from cache\n`);
        }
        
        if (includeDetails) {
            console.log(`📖 Will scrape ${maxPages} pages WITH DETAILS (${parallelCount}x parallel, ${headless ? 'headless' : 'visible'})\n`);
        } else if (parallelPages) {
            console.log(`📖 Will scrape ${maxPages} pages in PARALLEL (${maxPages} tabs at once, ${headless ? 'headless' : 'visible'})\n`);
        } else {
            console.log(`📖 Will scrape ${maxPages} pages (basic info only)\n`);
        }
        
        const newManhwaList = await scraper.scrapeManhwaList(maxPages, includeDetails, parallelPages, parallelCount);
        
        if (newManhwaList.length > 0) {
            // Merge with existing data (update or add new)
            const mergedData = [...existingData];
            const existingUrls = new Set(existingData.map(m => m.url));
            
            for (const newManhwa of newManhwaList) {
                const existingIndex = mergedData.findIndex(m => m.url === newManhwa.url);
                if (existingIndex >= 0) {
                    // Update existing (merge data, keep details if already exist)
                    mergedData[existingIndex] = {
                        ...mergedData[existingIndex],
                        ...newManhwa,
                        // Keep existing details if new data doesn't have them
                        genres: newManhwa.genres || mergedData[existingIndex].genres,
                        synopsis: newManhwa.synopsis || mergedData[existingIndex].synopsis,
                        status: newManhwa.status || mergedData[existingIndex].status,
                        author: newManhwa.author || mergedData[existingIndex].author
                    };
                } else {
                    // Add new
                    mergedData.push(newManhwa);
                }
            }
            
            console.log(`\n📊 Summary:`);
            console.log(`   - Total manhwa: ${mergedData.length}`);
            console.log(`   - New scraped: ${newManhwaList.length}`);
            console.log(`   - From cache: ${existingData.length}`);
            
            await scraper.saveData(mergedData);
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
