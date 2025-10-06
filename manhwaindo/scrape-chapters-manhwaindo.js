import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManhwaIndoChapterScraper {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data', 'manhwaindo');
        this.chaptersDir = path.join(__dirname, '..', 'chapters', 'manhwaindo');
        this.imagesDir = path.join(__dirname, '..', 'images', 'chapters', 'manhwaindo');
        this.batchSize = 10; // Download 10 images simultaneously
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
                
                // Try multiple selectors
                let chapterElements = document.querySelectorAll('#chapterList li');
                
                if (chapterElements.length === 0) {
                    // Try alternative selectors
                    chapterElements = document.querySelectorAll('.eplister li, .episodelist li, ul[data-num] li');
                }
                
                chapterElements.forEach(li => {
                    try {
                        const linkElement = li.querySelector('a');
                        if (!linkElement) return;
                        
                        const url = linkElement.href;
                        
                        // Get chapter number and title
                        const chapterSpan = li.querySelector('.chapternum, .epl-num, span[class*="chapter"]');
                        const chapterText = chapterSpan ? chapterSpan.textContent.trim() : linkElement.textContent.trim();
                        const chapterMatch = chapterText.match(/Chapter\s+(\d+)/i);
                        const chapterNum = chapterMatch ? chapterMatch[1] : '';
                        
                        // Get date
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
        const maxScrollAttempts = 50;

        while (scrollAttempts < maxScrollAttempts) {
            // Scroll to bottom of chapter list
            await this.page.evaluate(() => {
                const chapterList = document.querySelector('#chapterList');
                if (chapterList) {
                    chapterList.scrollTop = chapterList.scrollHeight;
                }
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if new content loaded
            const currentHeight = await this.page.evaluate(() => {
                const chapterList = document.querySelector('#chapterList');
                return chapterList ? chapterList.scrollHeight : 0;
            });

            if (currentHeight === previousHeight) {
                // No new content, we're done
                break;
            }

            previousHeight = currentHeight;
            scrollAttempts++;
            
            process.stdout.write(`\r   Scrolling... (${scrollAttempts} scrolls)`);
        }
        
        console.log('\n   ✅ Finished scrolling');
    }

    async scrapeChapterImages(chapterUrl, chapterNum) {
        try {
            console.log(`   📡 Loading chapter ${chapterNum}: ${chapterUrl}`);
            
            await this.page.goto(chapterUrl, { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Extract image URLs
            const images = await this.page.evaluate(() => {
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

    async downloadChapterImages(images, manhwaTitle, chapterNum) {
        try {
            // Create safe folder name
            const safeFolderName = manhwaTitle
                .replace(/[<>:"/\\|?*]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 100);

            const chapterDir = path.join(this.imagesDir, safeFolderName, `chapter-${chapterNum}`);
            await fs.ensureDir(chapterDir);

            // Download in batches
            const downloadedImages = [];
            const batchSize = this.batchSize;
            
            for (let i = 0; i < images.length; i += batchSize) {
                const batch = images.slice(i, i + batchSize);
                const batchPromises = batch.map(async (img, batchIndex) => {
                    const pageNum = i + batchIndex + 1;
                    const filename = `page-${String(pageNum).padStart(3, '0')}.jpg`;
                    const filepath = path.join(chapterDir, filename);

                    try {
                        await this.downloadImage(img.src, filepath);
                        return {
                            page: pageNum,
                            filename: filename,
                            localPath: `images/chapters/manhwaindo/${safeFolderName}/chapter-${chapterNum}/${filename}`,
                            originalUrl: img.src
                        };
                    } catch (error) {
                        console.log(`\n   ❌ Failed to download image ${pageNum}: ${error.message}`);
                        return null;
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                downloadedImages.push(...batchResults.filter(img => img !== null));
                
                process.stdout.write(`\r   📥 Downloading: ${Math.min(i + batchSize, images.length)}/${images.length} images`);
            }
            console.log('');

            return downloadedImages;

        } catch (error) {
            console.error(`   ❌ Error downloading images: ${error.message}`);
            return [];
        }
    }

    async downloadImage(url, filepath) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            
            protocol.get(url, (response) => {
                if (response.statusCode === 200) {
                    const fileStream = fs.createWriteStream(filepath);
                    response.pipe(fileStream);
                    fileStream.on('finish', () => {
                        fileStream.close();
                        resolve();
                    });
                    fileStream.on('error', reject);
                } else {
                    reject(new Error(`Failed to download: ${response.statusCode}`));
                }
            }).on('error', reject);
        });
    }

    async saveChapterData(manhwaSlug, manhwaTitle, chapters) {
        try {
            await fs.ensureDir(this.chaptersDir);
            
            const outputFile = path.join(this.chaptersDir, `${manhwaSlug}.json`);
            await fs.writeJSON(outputFile, {
                manhwaSlug: manhwaSlug,
                manhwaTitle: manhwaTitle,
                totalChapters: chapters.length,
                chapters: chapters,
                lastUpdated: new Date().toISOString()
            }, { spaces: 2 });

            console.log(`\n💾 Chapter data saved: ${outputFile}`);
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
    console.log('📖 MANHWAINDO CHAPTER SCRAPER');
    console.log('='.repeat(60));
    console.log('');

    const args = process.argv.slice(2);
    const maxManhwa = args[0] ? parseInt(args[0]) : 1;
    const maxChaptersPerManhwa = args[1] === 'all' ? null : (args[1] ? parseInt(args[1]) : 3);

    const scraper = new ManhwaIndoChapterScraper();

    try {
        await scraper.init();

        // Load manhwa list
        const manhwaFile = path.join(scraper.dataDir, 'manhwa-list.json');
        const data = await fs.readJSON(manhwaFile);
        const manhwaList = data.manhwa || [];

        console.log(`✅ Loaded ${manhwaList.length} manhwa`);
        if (maxChaptersPerManhwa === null) {
            console.log(`📊 Will scrape ${maxManhwa} manhwa, ALL chapters each\n`);
        } else {
            console.log(`📊 Will scrape ${maxManhwa} manhwa, ${maxChaptersPerManhwa} chapters each\n`);
        }

        for (let i = 0; i < Math.min(maxManhwa, manhwaList.length); i++) {
            const manhwa = manhwaList[i];
            console.log(`\n${'='.repeat(60)}`);
            console.log(`[${i + 1}/${maxManhwa}] ${manhwa.title}`);
            console.log('='.repeat(60));

            // Get chapter list
            const allChapters = await scraper.scrapeChapterList(manhwa.url, manhwa.title);
            
            if (allChapters.length === 0) {
                console.log('⚠️  No chapters found');
                continue;
            }

            // Limit chapters if specified
            const limit = maxChaptersPerManhwa ? Math.min(maxChaptersPerManhwa, allChapters.length) : allChapters.length;
            const chaptersToScrape = allChapters.slice(0, limit);

            console.log(`📖 Will download ${limit} chapters\n`);

            const scrapedChapters = [];

            for (let j = 0; j < chaptersToScrape.length; j++) {
                const chapter = chaptersToScrape[j];
                console.log(`\n   📖 Chapter ${chapter.number} (${j + 1}/${limit})`);

                const images = await scraper.scrapeChapterImages(chapter.url, chapter.number);
                
                if (images.length > 0) {
                    const downloadedImages = await scraper.downloadChapterImages(images, manhwa.title, chapter.number);
                    
                    scrapedChapters.push({
                        ...chapter,
                        totalPages: downloadedImages.length,
                        images: downloadedImages,
                        scrapedAt: new Date().toISOString()
                    });

                    console.log(`   ✅ Chapter ${chapter.number} complete: ${downloadedImages.length} pages`);
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }

            if (scrapedChapters.length > 0) {
                const slug = manhwa.url.split('/').filter(Boolean).pop();
                await scraper.saveChapterData(slug, manhwa.title, scrapedChapters);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Chapter scraping complete!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    } finally {
        await scraper.close();
    }
}

main();
