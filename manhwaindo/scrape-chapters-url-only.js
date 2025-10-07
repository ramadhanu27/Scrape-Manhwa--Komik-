import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManhwaIndoChapterScraperURLOnly {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data', 'manhwaindo');
        this.chaptersDir = path.join(__dirname, '..', 'chapters', 'manhwaindo');
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

    async scrapeChapterList(manhwaUrl, manhwaTitle) {
        try {
            console.log(`\n📡 Loading manhwa page: ${manhwaUrl}`);
            await this.page.goto(manhwaUrl, { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Scroll to load all chapters
            console.log('📜 Scrolling to load all chapters...');
            await this.scrollToLoadAllChapters();

            // Extract all chapters
            const chapters = await this.page.evaluate(() => {
                const chapterList = [];
                
                let chapterElements = document.querySelectorAll('#chapterList li');
                
                if (chapterElements.length === 0) {
                    chapterElements = document.querySelectorAll('.eplister li, .episodelist li, ul[data-num] li');
                }
                
                chapterElements.forEach(li => {
                    try {
                        const linkElement = li.querySelector('a');
                        if (!linkElement) return;
                        
                        const url = linkElement.href;
                        
                        const chapterSpan = li.querySelector('.chapternum, .epl-num, span[class*="chapter"]');
                        const chapterText = chapterSpan ? chapterSpan.textContent.trim() : linkElement.textContent.trim();
                        const chapterMatch = chapterText.match(/Chapter\s+(\d+)/i);
                        const chapterNum = chapterMatch ? chapterMatch[1] : '';
                        
                        const dateSpan = li.querySelector('.chapterdate, .epl-date, .chapterdate');
                        const date = dateSpan ? dateSpan.textContent.trim() : '';
                        
                        if (chapterNum && url) {
                            chapterList.push({
                                number: chapterNum,
                                title: chapterText,
                                url: url,
                                date: date
                            });
                        }
                    } catch (error) {
                        console.error('Error parsing chapter:', error);
                    }
                });
                
                return chapterList;
            });

            console.log(`✅ Found ${chapters.length} chapters\n`);
            return chapters;

        } catch (error) {
            console.error(`❌ Error scraping chapter list: ${error.message}`);
            return [];
        }
    }

    async scrollToLoadAllChapters() {
        let previousHeight = 0;
        let scrollAttempts = 0;
        const maxScrolls = 20;

        while (scrollAttempts < maxScrolls) {
            await this.page.evaluate(() => {
                const chapterList = document.querySelector('#chapterList');
                if (chapterList) {
                    chapterList.scrollTop = chapterList.scrollHeight;
                }
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            const currentHeight = await this.page.evaluate(() => {
                const chapterList = document.querySelector('#chapterList');
                return chapterList ? chapterList.scrollHeight : 0;
            });

            if (currentHeight === previousHeight) {
                break;
            }

            previousHeight = currentHeight;
            scrollAttempts++;
            
            process.stdout.write(`\r   Scrolling... (${scrollAttempts} scrolls)`);
        }
        
        console.log('\n   ✅ Finished scrolling');
    }

    async scrapeChapterImages(chapterUrl, chapterNum, page = null) {
        try {
            const targetPage = page || this.page;
            
            console.log(`   📡 Loading chapter ${chapterNum}: ${chapterUrl}`);
            
            await targetPage.goto(chapterUrl, { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Extract image URLs
            const images = await targetPage.evaluate(() => {
                const imageElements = document.querySelectorAll('#readerarea img');
                
                return Array.from(imageElements).map((img, index) => ({
                    src: img.src || img.dataset.src,
                    page: index + 1
                })).filter(img => img.src && !img.src.includes('data:image'));
            });

            console.log(`   ✅ Found ${images.length} images`);
            return images;

        } catch (error) {
            console.error(`   ❌ Error scraping chapter images: ${error.message}`);
            return [];
        }
    }

    // NO DOWNLOAD - Just format URLs
    async formatImageURLs(images, manhwaTitle, chapterNum) {
        try {
            const formattedImages = images.map((img, index) => ({
                page: index + 1,
                url: img.src,
                originalUrl: img.src
            }));

            console.log(`   ✅ Formatted ${formattedImages.length} image URLs`);
            return formattedImages;

        } catch (error) {
            console.error(`   ❌ Error formatting URLs: ${error.message}`);
            return [];
        }
    }

    async loadExistingChapters(slug) {
        try {
            const filePath = path.join(this.chaptersDir, `${slug}.json`);
            if (await fs.pathExists(filePath)) {
                const data = await fs.readJSON(filePath);
                return data.chapters || [];
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    async saveChapterData(slug, manhwaTitle, manhwaUrl, chapters) {
        try {
            await fs.ensureDir(this.chaptersDir);
            
            const data = {
                manhwaTitle: manhwaTitle,
                manhwaUrl: manhwaUrl,
                totalChapters: chapters.length,
                scrapedAt: new Date().toISOString(),
                chapters: chapters
            };

            const filePath = path.join(this.chaptersDir, `${slug}.json`);
            await fs.writeJSON(filePath, data, { spaces: 2 });
            
            console.log(`   💾 Saved to: ${slug}.json`);
        } catch (error) {
            console.error(`   ❌ Error saving data: ${error.message}`);
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Main execution
async function main() {
    const args = process.argv.slice(2);
    const manhwaCount = parseInt(args[0]) || 1;
    const maxChaptersPerManhwa = args[1] === 'null' ? null : parseInt(args[1]) || null;
    const parallelCount = parseInt(args[2]) || 8;

    console.log('============================================================');
    console.log('📖 MANHWAINDO CHAPTER SCRAPER (URL ONLY - NO DOWNLOAD)');
    console.log('============================================================\n');

    try {
        const scraper = new ManhwaIndoChapterScraperURLOnly();
        await scraper.init();

        // Load manhwa list
        const dataPath = path.join(scraper.dataDir, 'manhwa-list.json');
        const jsonData = await fs.readJSON(dataPath);
        
        console.log(`✅ Loaded ${jsonData.manhwa.length} manhwa`);
        console.log(`📊 Will scrape ${manhwaCount} manhwa, ${maxChaptersPerManhwa || 'ALL'} chapters each\n`);

        // Limit to specified count
        const manhwaToScrape = jsonData.manhwa.slice(0, manhwaCount);

        for (let i = 0; i < manhwaToScrape.length; i++) {
            const manhwa = manhwaToScrape[i];
            
            console.log('\n' + '='.repeat(60));
            console.log(`[${i + 1}/${manhwaToScrape.length}] ${manhwa.title}`);
            console.log('='.repeat(60));

            // Get chapter list
            const allChapters = await scraper.scrapeChapterList(manhwa.url, manhwa.title);
            
            if (allChapters.length === 0) {
                console.log('⚠️  No chapters found');
                continue;
            }

            // Load existing chapters
            const slug = manhwa.url.split('/').filter(Boolean).pop();
            const existingChapters = await scraper.loadExistingChapters(slug);
            const existingChapterNumbers = new Set(existingChapters.map(ch => ch.number));

            // Limit chapters if specified
            const limit = maxChaptersPerManhwa ? Math.min(maxChaptersPerManhwa, allChapters.length) : allChapters.length;
            const limitedChapters = allChapters.slice(0, limit);
            
            // Filter out chapters that already exist
            const chaptersToScrape = limitedChapters.filter(ch => !existingChapterNumbers.has(ch.number));
            
            const skipped = limitedChapters.length - chaptersToScrape.length;
            if (skipped > 0) {
                console.log(`   ⏭️  Skipped ${skipped} chapters (already scraped)`);
            }
            
            if (chaptersToScrape.length === 0) {
                console.log(`   ✅ All chapters already scraped, skipping...\n`);
                continue;
            }

            console.log(`📖 Will scrape ${chaptersToScrape.length} chapters (${parallelCount}x parallel)\n`);

            // Create multiple pages for parallel scraping
            const pages = [scraper.page];
            for (let p = 0; p < parallelCount - 1; p++) {
                const newPage = await scraper.browser.newPage();
                await newPage.setViewport({ width: 1920, height: 1080 });
                pages.push(newPage);
            }

            const scrapedChapters = [];

            // Process chapters in batches (parallel)
            const batchSize = parallelCount;
            for (let j = 0; j < chaptersToScrape.length; j += batchSize) {
                const batch = chaptersToScrape.slice(j, j + batchSize);
                
                console.log(`\n   📦 Processing batch ${Math.floor(j / batchSize) + 1} (${batch.length} chapters)...`);
                
                // Scrape chapters in parallel
                const chapterPromises = batch.map((chapter, batchIndex) => {
                    const page = pages[batchIndex % pages.length];
                    return scraper.scrapeChapterImages(chapter.url, chapter.number, page)
                        .then(images => ({ chapter, images }));
                });
                
                const batchResults = await Promise.all(chapterPromises);
                
                // Format URLs for each chapter (NO DOWNLOAD)
                for (const result of batchResults) {
                    if (result.images.length > 0) {
                        console.log(`\n   📖 Chapter ${result.chapter.number}: ${result.images.length} images`);
                        const formattedImages = await scraper.formatImageURLs(result.images, manhwa.title, result.chapter.number);
                        
                        scrapedChapters.push({
                            ...result.chapter,
                            totalPages: formattedImages.length,
                            images: formattedImages,
                            scrapedAt: new Date().toISOString()
                        });

                        console.log(`   ✅ Chapter ${result.chapter.number} complete: ${formattedImages.length} URLs saved`);
                    }
                }
                
                // AUTO-SAVE after each BATCH (not each chapter) for better performance
                if (scrapedChapters.length > 0) {
                    const allScrapedChapters = [...existingChapters, ...scrapedChapters];
                    allScrapedChapters.sort((a, b) => parseInt(b.number) - parseInt(a.number));
                    await scraper.saveChapterData(slug, manhwa.title, manhwa.url, allScrapedChapters);
                    console.log(`   💾 Saved ${scrapedChapters.length} chapters to JSON`);
                }
            }

            // Close additional pages
            for (let p = 1; p < pages.length; p++) {
                await pages[p].close();
            }

            if (scrapedChapters.length > 0) {
                // Merge with existing chapters
                const allScrapedChapters = [...existingChapters, ...scrapedChapters];
                
                // Sort by chapter number (descending)
                allScrapedChapters.sort((a, b) => parseInt(b.number) - parseInt(a.number));
                
                console.log(`\n📊 Summary:`);
                console.log(`   - New chapters: ${scrapedChapters.length}`);
                console.log(`   - Existing chapters: ${existingChapters.length}`);
                console.log(`   - Total chapters: ${allScrapedChapters.length}`);
                
                await scraper.saveChapterData(slug, manhwa.title, manhwa.url, allScrapedChapters);
            } else if (existingChapters.length > 0) {
                console.log(`\n   ℹ️  No new chapters to save (all already exist)`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Chapter scraping complete!');
        console.log('='.repeat(60));

        await scraper.close();

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

main();
