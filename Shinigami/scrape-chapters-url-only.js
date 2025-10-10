import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChapterScraperURLOnly {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data', 'shinigami');
        this.chaptersDir = path.join(__dirname, '..', 'chapters', 'shinigami');
    }

    async init() {
        console.log('🚀 Launching browser...');
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--disable-popup-blocking'
            ]
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });

        // Block ads and trackers (simplified to avoid conflicts)
        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            try {
                const url = req.url();
                
                // Only block obvious ad domains
                if (url.includes('kaya303') || 
                    url.includes('bisnis4d') ||
                    url.includes('enakslot') ||
                    url.includes('emas5000') ||
                    url.includes('388hero') ||
                    url.includes('mytogel')) {
                    req.abort();
                } else {
                    req.continue();
                }
            } catch (error) {
                // Ignore errors
            }
        });

        console.log('✅ Browser ready with ad blocker!\n');
    }

    async closePopupsAndAds() {
        try {
            await this.page.evaluate(() => {
                // Close popup modal
                const closeButtons = document.querySelectorAll('[class*="close"], [class*="tutup"], button[class*="btn"]');
                closeButtons.forEach(btn => {
                    const text = btn.textContent.toLowerCase();
                    if (text.includes('tutup') || text.includes('close') || text.includes('×') || text.includes('x')) {
                        btn.click();
                    }
                });

                // Remove popup overlays
                const overlays = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"], [style*="position: fixed"]');
                overlays.forEach(overlay => {
                    if (overlay.style.zIndex > 100) {
                        overlay.remove();
                    }
                });

                // Remove ads
                const ads = document.querySelectorAll('[class*="ads"], [id*="ads"], [class*="banner"], iframe[src*="ads"]');
                ads.forEach(ad => ad.remove());

                // Click "Jangan Tampilkan Lagi" if exists
                const dontShowButtons = document.querySelectorAll('input[type="checkbox"], button, span');
                dontShowButtons.forEach(btn => {
                    const text = btn.textContent || btn.placeholder || btn.value || '';
                    if (text.toLowerCase().includes('jangan tampilkan') || text.toLowerCase().includes('don\'t show')) {
                        btn.click();
                    }
                });

                // Remove notification bars
                const notifications = document.querySelectorAll('[class*="notification"], [class*="alert"], [class*="toast"]');
                notifications.forEach(notif => notif.remove());
            });

            console.log('   🚫 Closed popups and ads');
        } catch (error) {
            console.log('   ⚠️  Could not close popups:', error.message);
        }
    }

    async scrapeChapterImages(chapterUrl, manhwaSlug, chapterNum, retries = 3) {
        try {
            console.log(`   📡 Loading chapter ${chapterNum}: ${chapterUrl}`);
            
            // Retry mechanism
            let lastError;
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    await this.page.goto(chapterUrl, { 
                        waitUntil: 'networkidle2',
                        timeout: 60000 
                    });
                    break;
                } catch (error) {
                    lastError = error;
                    if (attempt < retries) {
                        console.log(`   ⚠️  Attempt ${attempt} failed, retrying...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }
            
            if (lastError && retries > 0) {
                throw lastError;
            }

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Close popups and ads
            await this.closePopupsAndAds();

            // Extract image URLs only
            const images = await this.page.evaluate(() => {
                let imgElements = document.querySelectorAll('img[alt*="page"], img[src*="chapter"], .chapter-image img, #chapter-images img, .reader-area img');
                
                if (imgElements.length === 0) {
                    imgElements = document.querySelectorAll('main img, article img, .content img');
                }

                const allImages = Array.from(imgElements).map((img, index) => ({
                    src: img.src || img.dataset.src || img.dataset.original,
                    index: index + 1
                })).filter(img => img.src && !img.src.includes('logo') && !img.src.includes('icon'));

                // Filter out ads
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

            console.log(`   ✅ Found ${images.length} images`);

            // Format URLs (no download)
            const formattedImages = images.map((img, index) => ({
                page: index + 1,
                url: img.src,
                originalUrl: img.src
            }));

            return {
                chapterNumber: chapterNum,
                totalPages: formattedImages.length,
                images: formattedImages,
                scrapedAt: new Date().toISOString()
            };

        } catch (error) {
            console.log(`   ❌ Error scraping chapter: ${error.message}`);
            return null;
        }
    }

    async scrapeChaptersForManhwa(manhwa, maxChapters = null) {
        try {
            console.log(`\n📡 Loading manhwa page: ${manhwa.url}`);
            await this.page.goto(manhwa.url, { timeout: 60000 });
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get ALL chapters from ALL pages
            let allChapters = [];
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                console.log(`   📄 Loading page ${currentPage}...`);
                
                const pageChapters = await this.page.evaluate(() => {
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
                console.log(`   ✅ Found ${pageChapters.length} chapters on page ${currentPage}`);

                // Check next page
                const nextButton = await this.page.evaluate(() => {
                    const buttons = document.querySelectorAll('button, a');
                    for (const btn of buttons) {
                        const text = btn.textContent.trim();
                        if (text === '>' || text === '›' || text === 'Next' || btn.getAttribute('aria-label')?.includes('next')) {
                            return !btn.disabled && !btn.classList.contains('disabled');
                        }
                    }
                    return false;
                });

                if (nextButton && currentPage < 50) {
                    try {
                        await this.page.evaluate(() => {
                            const buttons = document.querySelectorAll('button, a');
                            for (const btn of buttons) {
                                const text = btn.textContent.trim();
                                if (text === '>' || text === '›' || text === 'Next' || btn.getAttribute('aria-label')?.includes('next')) {
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

            // Remove duplicates
            const chapters = Array.from(new Map(allChapters.map(ch => [ch.url, ch])).values());
            console.log(`   ✅ Total ${chapters.length} unique chapters found`);

            if (chapters.length === 0) return [];

            // Load existing chapters to skip
            const existingChapters = await this.loadExistingChapters(manhwa.slug, manhwa.title);
            const existingNumbers = new Set(existingChapters.map(ch => ch.number));

            // Limit and filter
            const limit = maxChapters ? Math.min(maxChapters, chapters.length) : chapters.length;
            const limitedChapters = chapters.slice(0, limit);
            const chaptersToScrape = limitedChapters.filter(ch => !existingNumbers.has(ch.number));

            const skipped = limitedChapters.length - chaptersToScrape.length;
            if (skipped > 0) {
                console.log(`   ⏭️  Skipped ${skipped} chapters (already scraped)`);
            }

            if (chaptersToScrape.length === 0) {
                console.log(`   ✅ All chapters already scraped`);
                return existingChapters;
            }

            console.log(`   📖 Will scrape ${chaptersToScrape.length} new chapters\n`);

            // Scrape chapters
            const scrapedChapters = [];

            for (let i = 0; i < chaptersToScrape.length; i++) {
                const chapter = chaptersToScrape[i];
                console.log(`\n   📖 Chapter ${chapter.number} (${i + 1}/${chaptersToScrape.length})`);

                const chapterData = await this.scrapeChapterImages(
                    chapter.url,
                    manhwa.slug,
                    chapter.number
                );

                if (chapterData) {
                    scrapedChapters.push({
                        ...chapter,
                        ...chapterData
                    });
                    console.log(`   ✅ Chapter ${chapter.number}: ${chapterData.totalPages} images`);

                    // AUTO-SAVE every 5 chapters
                    if ((i + 1) % 5 === 0) {
                        const allChaps = [...existingChapters, ...scrapedChapters];
                        allChaps.sort((a, b) => parseInt(b.number) - parseInt(a.number));
                        await this.saveChapterData(manhwa.slug, manhwa.title, manhwa.url, allChaps);
                        console.log(`   💾 Auto-saved (${scrapedChapters.length} chapters)`);
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Merge and save final
            const allScrapedChapters = [...existingChapters, ...scrapedChapters];
            allScrapedChapters.sort((a, b) => parseInt(b.number) - parseInt(a.number));

            return allScrapedChapters;

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            return [];
        }
    }

    async loadExistingChapters(slug, title) {
        try {
            // Try loading by title first (new format)
            const safeFilename = this.generateSafeFilename(title);
            let filePath = path.join(this.chaptersDir, `${safeFilename}.json`);
            
            if (await fs.pathExists(filePath)) {
                const data = await fs.readJSON(filePath);
                return data.chapters || [];
            }
            
            // Fallback: try loading by slug (old format)
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

    generateSafeFilename(title) {
        // Convert title to safe filename
        return title
            .toLowerCase()
            .replace(/[<>:"/\\|?*]/g, '')  // Remove invalid characters
            .replace(/\s+/g, '-')           // Replace spaces with dash
            .replace(/[^\w\-]/g, '')        // Remove non-alphanumeric except dash
            .replace(/-+/g, '-')            // Replace multiple dashes with single
            .replace(/^-|-$/g, '')          // Remove leading/trailing dashes
            .substring(0, 100);             // Limit length
    }

    async saveChapterData(manhwaSlug, manhwaTitle, manhwaUrl, chapters) {
        try {
            await fs.ensureDir(this.chaptersDir);
            
            // Generate safe filename from title
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
            console.log(`   💾 Saved: ${safeFilename}.json`);
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
    const maxManhwa = parseInt(args[0]) || 1;
    const maxChaptersPerManhwa = args[1] === 'all' ? null : parseInt(args[1]) || null;
    const filterManhwaOnly = args[2] === 'manhwa-only'; // New parameter

    console.log('============================================================');
    console.log('📖 SHINIGAMI CHAPTER SCRAPER (URL ONLY - NO DOWNLOAD)');
    console.log('============================================================\n');

    try {
        const scraper = new ChapterScraperURLOnly();
        await scraper.init();

        // Load manhwa list
        let manhwaList = [];
        
        if (filterManhwaOnly) {
            console.log('🔘 Filtering Manhwa only...\n');
            
            // Try manhwa-only.json first
            const manhwaOnlyPath = path.join(scraper.dataDir, 'manhwa-only.json');
            if (await fs.pathExists(manhwaOnlyPath)) {
                const jsonData = await fs.readJSON(manhwaOnlyPath);
                manhwaList = jsonData.manhwa || jsonData;
                console.log('✅ Using manhwa-only.json');
            } else {
                // Fallback: filter from manhwa-all.json
                console.log('⚠️  manhwa-only.json not found');
                console.log('   Filtering from manhwa-all.json...');
                
                const allPath = path.join(scraper.dataDir, 'manhwa-all.json');
                if (await fs.pathExists(allPath)) {
                    const allData = await fs.readJSON(allPath);
                    const allManhwa = allData.manhwa || allData;
                    
                    // Filter only entries with "Manhwa" in title or that are actually manhwa
                    // Since manhwa-all.json doesn't have format field, we'll use all for now
                    manhwaList = allManhwa;
                    console.log('   ⚠️  Cannot filter by format, using all series');
                    console.log('   💡 Run "node scrape-manhwa-only.js" first for accurate filtering');
                } else {
                    // Last fallback
                    const realImagesPath = path.join(scraper.dataDir, 'manhwa-real-images.json');
                    const jsonData = await fs.readJSON(realImagesPath);
                    manhwaList = jsonData.manhwa || jsonData;
                }
            }
        } else {
            // No filter, use all
            const dataPath = path.join(scraper.dataDir, 'manhwa-real-images.json');
            const jsonData = await fs.readJSON(dataPath);
            manhwaList = jsonData.manhwa || jsonData;
        }
        
        console.log(`✅ Loaded ${manhwaList.length} manhwa`);
        console.log(`📊 Will scrape ${maxManhwa} manhwa, ${maxChaptersPerManhwa || 'ALL'} chapters each\n`);

        for (let i = 0; i < Math.min(maxManhwa, manhwaList.length); i++) {
            const manhwa = manhwaList[i];
            
            console.log('\n' + '='.repeat(60));
            console.log(`[${i + 1}/${maxManhwa}] ${manhwa.title}`);
            console.log('='.repeat(60));

            const chapters = await scraper.scrapeChaptersForManhwa(manhwa, maxChaptersPerManhwa);
            
            if (chapters.length > 0) {
                await scraper.saveChapterData(manhwa.slug, manhwa.title, manhwa.url, chapters);
                console.log(`\n📊 Summary: ${chapters.length} total chapters saved`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Chapter scraping complete!');
        console.log('📁 Data saved to: chapters/shinigami/');
        console.log('='.repeat(60));

        await scraper.close();

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

main();
