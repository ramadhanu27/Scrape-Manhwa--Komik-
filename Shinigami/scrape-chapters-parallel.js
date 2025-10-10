import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ShinigamiParallelScraper {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data', 'shinigami');
        this.chaptersDir = path.join(__dirname, '..', 'chapters', 'shinigami');
        this.browser = null;
    }

    async init() {
        console.log('🚀 Launching browser...');
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-popup-blocking'
            ]
        });
        console.log('✅ Browser ready!\n');
    }

    async createPage() {
        const page = await this.browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Simple ad blocking
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            try {
                const url = req.url();
                if (url.includes('kaya303') || url.includes('bisnis4d') || 
                    url.includes('enakslot') || url.includes('emas5000') ||
                    url.includes('388hero') || url.includes('mytogel')) {
                    req.abort();
                } else {
                    req.continue();
                }
            } catch (error) {
                // Ignore
            }
        });
        
        return page;
    }

    async closePopups(page) {
        try {
            await page.evaluate(() => {
                const closeButtons = document.querySelectorAll('[class*="close"], [class*="tutup"], button');
                closeButtons.forEach(btn => {
                    const text = btn.textContent.toLowerCase();
                    if (text.includes('tutup') || text.includes('close') || text.includes('×')) {
                        btn.click();
                    }
                });
                const overlays = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"]');
                overlays.forEach(overlay => overlay.remove());
            });
        } catch (error) {
            // Ignore
        }
    }

    generateSafeFilename(title) {
        return title
            .toLowerCase()
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 100);
    }

    async scrapeChapterList(page, manhwaUrl) {
        try {
            await page.goto(manhwaUrl, { timeout: 60000 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            let allChapters = [];
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages && currentPage <= 50) {
                const pageChapters = await page.evaluate(() => {
                    let chapterLinks = document.querySelectorAll('a[href*="/chapter/"]');
                    
                    if (chapterLinks.length === 0) {
                        const containers = document.querySelectorAll('[class*="grid"], [class*="flex"], [class*="chapter"]');
                        for (const container of containers) {
                            const links = container.querySelectorAll('a[href*="/chapter/"]');
                            if (links.length > 0) {
                                chapterLinks = links;
                                break;
                            }
                        }
                    }
                    
                    return Array.from(chapterLinks).map(link => {
                        let text = link.textContent.trim();
                        if (!text) {
                            const parent = link.closest('[class*="chapter"]');
                            if (parent) text = parent.textContent.trim();
                        }
                        
                        const chapterMatch = text.match(/(?:chapter|ch\.?)\s*(\d+)/i);
                        const chapterNum = chapterMatch ? chapterMatch[1] : text.match(/\d+/)?.[0] || '1';
                        
                        return {
                            url: link.href,
                            title: text || `Chapter ${chapterNum}`,
                            number: chapterNum
                        };
                    }).filter(ch => ch.url && ch.number);
                });

                allChapters = allChapters.concat(pageChapters);

                const nextButton = await page.evaluate(() => {
                    const buttons = document.querySelectorAll('button, a');
                    for (const btn of buttons) {
                        const text = btn.textContent.trim();
                        if (text === '>' || text === '›' || text === 'Next' || btn.getAttribute('aria-label')?.includes('next')) {
                            return !btn.disabled && !btn.classList.contains('disabled');
                        }
                    }
                    return false;
                });

                if (nextButton) {
                    try {
                        await page.evaluate(() => {
                            const buttons = document.querySelectorAll('button, a');
                            for (const btn of buttons) {
                                const text = btn.textContent.trim();
                                if (text === '>' || text === '›' || text === 'Next') {
                                    btn.click();
                                    return;
                                }
                            }
                        });
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        currentPage++;
                    } catch (error) {
                        hasMorePages = false;
                    }
                } else {
                    hasMorePages = false;
                }
            }

            const chapters = Array.from(new Map(allChapters.map(ch => [ch.url, ch])).values());
            return chapters;

        } catch (error) {
            console.error(`   ❌ Error loading chapters: ${error.message}`);
            return [];
        }
    }

    async scrapeChapterImages(page, chapterUrl, chapterNum, retries = 3) {
        try {
            let lastError;
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    await page.goto(chapterUrl, { 
                        waitUntil: 'networkidle2',
                        timeout: 60000 
                    });
                    break;
                } catch (error) {
                    lastError = error;
                    if (attempt < retries) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
            
            if (lastError && retries > 0) throw lastError;

            await new Promise(resolve => setTimeout(resolve, 1500));
            await this.closePopups(page);

            const images = await page.evaluate(() => {
                let imgElements = document.querySelectorAll('img[alt*="page"], img[src*="chapter"], .chapter-image img, #chapter-images img, .reader-area img');
                
                if (imgElements.length === 0) {
                    imgElements = document.querySelectorAll('main img, article img, .content img');
                }

                const allImages = Array.from(imgElements).map((img, index) => ({
                    src: img.src || img.dataset.src || img.dataset.original,
                    index: index + 1
                })).filter(img => img.src && !img.src.includes('logo') && !img.src.includes('icon'));

                return allImages.filter(img => {
                    const url = img.src.toLowerCase();
                    if (url.includes('.gif')) return false;
                    if (url.includes('ads')) return false;
                    if (url.includes('kaya303')) return false;
                    if (url.includes('bisnis4d')) return false;
                    if (url.includes('enakslot')) return false;
                    if (url.includes('emas5000')) return false;
                    if (url.includes('388hero')) return false;
                    if (url.includes('mytogel')) return false;
                    if (url.includes('profilestorage')) return false;
                    if (url.includes('gambar.dewakematian')) return false;
                    
                    return url.includes('delivery.shngm.id') || 
                           url.includes('/chapter/') ||
                           url.includes('manga_');
                });
            });

            return images;

        } catch (error) {
            console.error(`   ❌ Error chapter ${chapterNum}: ${error.message}`);
            return [];
        }
    }

    async scrapeManhwa(manhwa, maxChapters = null, parallelChapters = 3) {
        const page = await this.createPage();
        
        try {
            console.log(`   📡 Loading: ${manhwa.title}`);
            
            // Get chapter list
            const allChapters = await this.scrapeChapterList(page, manhwa.url);
            
            if (allChapters.length === 0) {
                console.log(`   ⚠️  No chapters found`);
                await page.close();
                return { success: false, manhwa: manhwa.title, chapters: 0 };
            }

            console.log(`   ✅ Found ${allChapters.length} chapters`);

            // Load existing chapters
            const existingChapters = await this.loadExistingChapters(manhwa.slug, manhwa.title);
            const existingNumbers = new Set(existingChapters.map(ch => ch.number));

            // Filter and limit
            const limit = maxChapters ? Math.min(maxChapters, allChapters.length) : allChapters.length;
            const limitedChapters = allChapters.slice(0, limit);
            const chaptersToScrape = limitedChapters.filter(ch => !existingNumbers.has(ch.number));

            if (chaptersToScrape.length === 0) {
                console.log(`   ✅ All chapters already scraped`);
                await page.close();
                return { success: true, manhwa: manhwa.title, chapters: existingChapters.length, new: 0 };
            }

            console.log(`   📖 Scraping ${chaptersToScrape.length} new chapters...`);

            // Create additional pages for parallel scraping
            const pages = [page];
            for (let p = 0; p < parallelChapters - 1; p++) {
                pages.push(await this.createPage());
            }

            const scrapedChapters = [];

            // Process in batches
            for (let j = 0; j < chaptersToScrape.length; j += parallelChapters) {
                const batch = chaptersToScrape.slice(j, j + parallelChapters);
                
                const chapterPromises = batch.map((chapter, idx) => {
                    const chapterPage = pages[idx % pages.length];
                    return this.scrapeChapterImages(chapterPage, chapter.url, chapter.number)
                        .then(images => ({ chapter, images }));
                });
                
                const batchResults = await Promise.all(chapterPromises);
                
                for (const result of batchResults) {
                    if (result.images.length > 0) {
                        const formattedImages = result.images.map((img, index) => ({
                            page: index + 1,
                            url: img.src,
                            originalUrl: img.src
                        }));
                        
                        scrapedChapters.push({
                            ...result.chapter,
                            chapterNumber: result.chapter.number,
                            totalPages: formattedImages.length,
                            images: formattedImages,
                            scrapedAt: new Date().toISOString()
                        });
                    }
                }
            }

            // Close additional pages
            for (let p = 1; p < pages.length; p++) {
                await pages[p].close();
            }

            // Save data
            const allScrapedChapters = [...existingChapters, ...scrapedChapters];
            allScrapedChapters.sort((a, b) => parseInt(b.number) - parseInt(a.number));
            
            await this.saveChapterData(manhwa.slug, manhwa.title, manhwa.url, allScrapedChapters);

            await page.close();
            return { 
                success: true, 
                manhwa: manhwa.title, 
                chapters: allScrapedChapters.length, 
                new: scrapedChapters.length 
            };

        } catch (error) {
            console.error(`   ❌ Error: ${error.message}`);
            await page.close();
            return { success: false, manhwa: manhwa.title, error: error.message };
        }
    }

    async loadExistingChapters(slug, title) {
        try {
            const safeFilename = this.generateSafeFilename(title);
            let filePath = path.join(this.chaptersDir, `${safeFilename}.json`);
            
            if (await fs.pathExists(filePath)) {
                const data = await fs.readJSON(filePath);
                return data.chapters || [];
            }
            
            filePath = path.join(this.chaptersDir, `${slug}.json`);
            if (await fs.pathExists(filePath)) {
                const data = await fs.readJSON(filePath);
                return data.chapters || [];
            }
            
            return [];
        } catch (error) {
            return [];
        }
    }

    async saveChapterData(manhwaSlug, manhwaTitle, manhwaUrl, chapters) {
        try {
            await fs.ensureDir(this.chaptersDir);
            
            const safeFilename = this.generateSafeFilename(manhwaTitle);
            
            const data = {
                manhwaSlug: manhwaSlug,
                manhwaTitle: manhwaTitle,
                manhwaUrl: manhwaUrl,
                totalChapters: chapters.length,
                scrapedAt: new Date().toISOString(),
                chapters: chapters
            };

            const filePath = path.join(this.chaptersDir, `${safeFilename}.json`);
            await fs.writeJSON(filePath, data, { spaces: 2 });
        } catch (error) {
            console.error(`   ❌ Save error: ${error.message}`);
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
    const maxChaptersPerManhwa = args[1] === 'all' ? null : parseInt(args[1]) || null;
    const parallelManhwa = parseInt(args[2]) || 2;
    const parallelChapters = parseInt(args[3]) || 3;
    const filterManhwaOnly = args[4] === 'manhwa-only';

    console.log('============================================================');
    console.log('📖 SHINIGAMI PARALLEL SCRAPER (URL ONLY)');
    console.log('============================================================\n');
    console.log(`⚡ Parallel: ${parallelManhwa} manhwa, ${parallelChapters} chapters each`);
    console.log(`📊 Target: ${manhwaCount} manhwa, ${maxChaptersPerManhwa || 'ALL'} chapters\n`);

    try {
        const scraper = new ShinigamiParallelScraper();
        await scraper.init();

        // Load manhwa list
        let manhwaList = [];
        
        if (filterManhwaOnly) {
            console.log('🔘 Using Manhwa-only filter\n');
            const manhwaOnlyPath = path.join(scraper.dataDir, 'manhwa-only.json');
            if (await fs.pathExists(manhwaOnlyPath)) {
                const jsonData = await fs.readJSON(manhwaOnlyPath);
                manhwaList = jsonData.manhwa || jsonData;
            } else {
                console.log('⚠️  manhwa-only.json not found, using all series');
                const dataPath = path.join(scraper.dataDir, 'manhwa-real-images.json');
                const jsonData = await fs.readJSON(dataPath);
                manhwaList = jsonData;
            }
        } else {
            const dataPath = path.join(scraper.dataDir, 'manhwa-real-images.json');
            const jsonData = await fs.readJSON(dataPath);
            manhwaList = jsonData;
        }
        
        console.log(`✅ Loaded ${manhwaList.length} manhwa\n`);

        const manhwaToScrape = manhwaList.slice(0, manhwaCount);
        const results = [];

        // Process manhwa in parallel batches
        for (let i = 0; i < manhwaToScrape.length; i += parallelManhwa) {
            const batch = manhwaToScrape.slice(i, i + parallelManhwa);
            
            console.log('\n' + '='.repeat(60));
            console.log(`📦 Batch ${Math.floor(i / parallelManhwa) + 1}: Processing ${batch.length} manhwa in parallel`);
            console.log('='.repeat(60) + '\n');

            const batchPromises = batch.map(manhwa => 
                scraper.scrapeManhwa(manhwa, maxChaptersPerManhwa, parallelChapters)
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Summary for this batch
            console.log('\n📊 Batch Summary:');
            batchResults.forEach(r => {
                if (r.success) {
                    console.log(`   ✅ ${r.manhwa}: ${r.chapters} chapters (${r.new || 0} new)`);
                } else {
                    console.log(`   ❌ ${r.manhwa}: ${r.error || 'Failed'}`);
                }
            });
        }

        // Final summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL SUMMARY');
        console.log('='.repeat(60));
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        const totalChapters = results.reduce((sum, r) => sum + (r.chapters || 0), 0);
        const totalNew = results.reduce((sum, r) => sum + (r.new || 0), 0);
        
        console.log(`✅ Successful: ${successful}/${manhwaCount} manhwa`);
        console.log(`❌ Failed: ${failed}/${manhwaCount} manhwa`);
        console.log(`📖 Total chapters: ${totalChapters}`);
        console.log(`🆕 New chapters: ${totalNew}`);
        console.log('='.repeat(60));

        await scraper.close();

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

main();
