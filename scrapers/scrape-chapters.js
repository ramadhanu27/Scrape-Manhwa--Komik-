import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChapterScraper {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data', 'shinigami');
        this.chaptersDir = path.join(__dirname, '..', 'chapters', 'shinigami');
        this.imagesDir = path.join(__dirname, '..', 'images', 'chapters', 'shinigami');
        this.batchSize = 10; // Download 10 images simultaneously (adjustable)
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

    async scrapeChapterImages(chapterUrl, manhwaSlug, chapterNum, manhwaTitle) {
        try {
            console.log(`   📡 Loading chapter: ${chapterUrl}`);
            
            // Try to get image URLs from API/network first (faster)
            const directImages = await this.tryGetDirectImageUrls(chapterUrl);
            
            if (directImages && directImages.length > 0) {
                console.log(`   ⚡ Using direct URLs (fast mode)`);
                return await this.downloadImagesDirectly(directImages, manhwaSlug, chapterNum, manhwaTitle);
            }
            
            // Fallback to browser scraping
            await this.page.goto(chapterUrl, { 
                waitUntil: 'networkidle2',
                timeout: 60000 
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Extract all chapter images
            const images = await this.page.evaluate(() => {
                const imgElements = document.querySelectorAll('img[alt*="page"], img[src*="chapter"], .chapter-image img, #chapter-images img, .reader-area img');
                
                if (imgElements.length === 0) {
                    // Fallback: get all images in main content area
                    const allImages = document.querySelectorAll('main img, article img, .content img');
                    return Array.from(allImages).map((img, index) => ({
                        src: img.src || img.dataset.src || img.dataset.original,
                        alt: img.alt || `Page ${index + 1}`,
                        index: index + 1
                    })).filter(img => img.src && !img.src.includes('logo') && !img.src.includes('icon'));
                }

                return Array.from(imgElements).map((img, index) => ({
                    src: img.src || img.dataset.src || img.dataset.original,
                    alt: img.alt || `Page ${index + 1}`,
                    index: index + 1
                })).filter(img => img.src);
            });

            // Filter out ads (gif files and non-chapter images)
            const chapterImages = images.filter(img => {
                const url = img.src.toLowerCase();
                // Skip ads: .gif files, ads domains, etc
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
                
                // Only include actual chapter images
                return url.includes('delivery.shngm.id') || 
                       url.includes('/chapter/') ||
                       url.includes('manga_');
            });

            console.log(`   ✅ Found ${chapterImages.length} chapter images (filtered ${images.length - chapterImages.length} ads)`);

            if (chapterImages.length === 0) {
                console.log(`   ⚠️  No chapter images found (only ads)`);
                return null;
            }

            // Create safe folder name from manhwa title
            const safeFolderName = manhwaTitle
                .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
                .replace(/\s+/g, '-')          // Replace spaces with dash
                .substring(0, 100);            // Limit length

            // Create directory for this chapter
            const chapterDir = path.join(this.imagesDir, safeFolderName, `chapter-${chapterNum}`);
            await fs.ensureDir(chapterDir);

            // Download images in batches (parallel)
            const downloadedImages = [];
            const batchSize = this.batchSize;
            
            for (let i = 0; i < chapterImages.length; i += batchSize) {
                const batch = chapterImages.slice(i, i + batchSize);
                const batchPromises = batch.map(async (img, batchIndex) => {
                    const pageNum = i + batchIndex + 1;
                    const filename = `page-${String(pageNum).padStart(3, '0')}.jpg`;
                    const filepath = path.join(chapterDir, filename);

                    try {
                        await this.downloadImage(img.src, filepath);
                        return {
                            page: pageNum,
                            filename: filename,
                            localPath: `images/chapters/shinigami/${safeFolderName}/chapter-${chapterNum}/${filename}`,
                            originalUrl: img.src
                        };
                    } catch (error) {
                        console.log(`\n   ❌ Failed to download image ${pageNum}: ${error.message}`);
                        return null;
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                downloadedImages.push(...batchResults.filter(img => img !== null));
                
                process.stdout.write(`\r   📥 Downloading: ${Math.min(i + batchSize, chapterImages.length)}/${chapterImages.length} images`);
            }
            console.log(''); // New line after progress

            return {
                chapterNumber: chapterNum,
                totalPages: downloadedImages.length,
                images: downloadedImages,
                scrapedAt: new Date().toISOString()
            };

        } catch (error) {
            console.log(`   ❌ Error scraping chapter: ${error.message}`);
            return null;
        }
    }

    async tryGetDirectImageUrls(chapterUrl) {
        try {
            // Enable request interception
            await this.page.setRequestInterception(true);
            
            const imageUrls = [];
            
            // Intercept network requests
            const requestHandler = (request) => {
                const url = request.url();
                // Capture image URLs from delivery.shngm.id
                if (url.includes('delivery.shngm.id') && 
                    (url.includes('.jpg') || url.includes('.png') || url.includes('.webp'))) {
                    imageUrls.push(url);
                }
                request.continue();
            };
            
            this.page.on('request', requestHandler);
            
            // Load page briefly to capture network requests
            await this.page.goto(chapterUrl, { 
                waitUntil: 'domcontentloaded',
                timeout: 30000 
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Cleanup
            this.page.off('request', requestHandler);
            await this.page.setRequestInterception(false);
            
            // Filter out ads
            const filtered = imageUrls.filter(url => {
                const lower = url.toLowerCase();
                return !lower.includes('.gif') && 
                       !lower.includes('ads') &&
                       !lower.includes('kaya303') &&
                       !lower.includes('profilestorage');
            });
            
            return filtered.length > 0 ? filtered : null;
            
        } catch (error) {
            console.log(`   ⚠️  Direct URL detection failed: ${error.message}`);
            return null;
        }
    }

    async downloadImagesDirectly(imageUrls, manhwaSlug, chapterNum, manhwaTitle) {
        try {
            const safeFolderName = manhwaTitle
                .replace(/[<>:"/\\|?*]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 100);

            const chapterDir = path.join(this.imagesDir, safeFolderName, `chapter-${chapterNum}`);
            await fs.ensureDir(chapterDir);

            console.log(`   ✅ Found ${imageUrls.length} images (direct mode)`);

            // Download in batches
            const downloadedImages = [];
            const batchSize = this.batchSize;
            
            for (let i = 0; i < imageUrls.length; i += batchSize) {
                const batch = imageUrls.slice(i, i + batchSize);
                const batchPromises = batch.map(async (url, batchIndex) => {
                    const pageNum = i + batchIndex + 1;
                    const filename = `page-${String(pageNum).padStart(3, '0')}.jpg`;
                    const filepath = path.join(chapterDir, filename);

                    try {
                        await this.downloadImage(url, filepath);
                        return {
                            page: pageNum,
                            filename: filename,
                            localPath: `images/chapters/shinigami/${safeFolderName}/chapter-${chapterNum}/${filename}`,
                            originalUrl: url
                        };
                    } catch (error) {
                        console.log(`\n   ❌ Failed to download image ${pageNum}: ${error.message}`);
                        return null;
                    }
                });

                const batchResults = await Promise.all(batchPromises);
                downloadedImages.push(...batchResults.filter(img => img !== null));
                
                process.stdout.write(`\r   📥 Downloading: ${Math.min(i + batchSize, imageUrls.length)}/${imageUrls.length} images`);
            }
            console.log('');

            return {
                chapterNumber: chapterNum,
                totalPages: downloadedImages.length,
                images: downloadedImages,
                scrapedAt: new Date().toISOString()
            };

        } catch (error) {
            console.log(`   ❌ Error in direct download: ${error.message}`);
            return null;
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

    async scrapeChaptersForManhwa(manhwa, maxChapters = null) {
        try {
            console.log(`\n📡 Loading manhwa page: ${manhwa.url}`);
            await this.page.goto(manhwa.url, { 
                timeout: 60000 
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get ALL chapters from ALL pages
            let allChapters = [];
            let currentPage = 1;
            let hasMorePages = true;

            while (hasMorePages) {
                console.log(`   📄 Loading page ${currentPage}...`);
                
                // Get chapters from current page
                const pageChapters = await this.page.evaluate(() => {
                    // Try multiple selectors
                    let chapterLinks = document.querySelectorAll('a[href*="/chapter/"]');
                    
                    // If not found, try finding in grid/flex containers
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
                        // Get text from link or parent element
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

                // Check if there's a next page button
                const nextButton = await this.page.evaluate(() => {
                    // Look for next page button (pagination)
                    const buttons = document.querySelectorAll('button, a');
                    for (const btn of buttons) {
                        const text = btn.textContent.trim();
                        // Check for next button or page number
                        if (text === '>' || text === '›' || text === 'Next' || btn.getAttribute('aria-label')?.includes('next')) {
                            return !btn.disabled && !btn.classList.contains('disabled');
                        }
                    }
                    return false;
                });

                if (nextButton) {
                    // Click next page
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
                        console.log(`   ⚠️  Could not navigate to next page`);
                        hasMorePages = false;
                    }
                } else {
                    hasMorePages = false;
                }

                // Safety limit: max 50 pages
                if (currentPage > 50) {
                    console.log(`   ⚠️  Reached max page limit (50)`);
                    hasMorePages = false;
                }
            }

            // Remove duplicates based on URL
            const chapters = Array.from(new Map(allChapters.map(ch => [ch.url, ch])).values());
            
            console.log(`   ✅ Total ${chapters.length} unique chapters found from ${currentPage} pages`);

            if (chapters.length === 0) {
                console.log(`   ⚠️  No chapters found`);
                return [];
            }

            // Scrape chapters (all or limited)
            const scrapedChapters = [];
            const limit = maxChapters ? Math.min(maxChapters, chapters.length) : chapters.length;

            for (let i = 0; i < limit; i++) {
                const chapter = chapters[i];
                console.log(`\n   📖 Chapter ${chapter.number} (${i + 1}/${limit})`);

                const chapterData = await this.scrapeChapterImages(
                    chapter.url,
                    manhwa.slug,
                    chapter.number,
                    manhwa.title
                );

                if (chapterData) {
                    scrapedChapters.push({
                        ...chapter,
                        ...chapterData,
                        localUrl: `chapter.html?manhwa=${manhwa.slug}&chapter=${chapter.number}`
                    });
                    console.log(`   ✅ Chapter ${chapter.number} complete: ${chapterData.totalPages} pages`);
                }

                // Small delay between chapters
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            return scrapedChapters;

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            return [];
        }
    }

    async saveChapterData(manhwaSlug, chapters) {
        const chapterFile = path.join(this.chaptersDir, `${manhwaSlug}.json`);
        await fs.ensureDir(this.chaptersDir);
        await fs.writeJSON(chapterFile, {
            manhwaSlug: manhwaSlug,
            totalChapters: chapters.length,
            chapters: chapters,
            lastUpdated: new Date().toISOString()
        }, { spaces: 2 });
        console.log(`\n💾 Chapter data saved: ${chapterFile}`);
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
    console.log('📖 CHAPTER SCRAPER - Download Manhwa Chapters');
    console.log('='.repeat(60));
    console.log('');

    const args = process.argv.slice(2);
    const maxManhwa = args[0] ? parseInt(args[0]) : 1;
    const maxChaptersPerManhwa = args[1] === 'all' ? null : (args[1] ? parseInt(args[1]) : 3);

    const scraper = new ChapterScraper();

    try {
        await scraper.init();

        // Load manhwa list
        const manhwaFile = path.join(scraper.dataDir, 'manhwa-real-images.json');
        const manhwaList = await fs.readJSON(manhwaFile);

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

            const chapters = await scraper.scrapeChaptersForManhwa(manhwa, maxChaptersPerManhwa);
            
            if (chapters.length > 0) {
                await scraper.saveChapterData(manhwa.slug, chapters);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Chapter scraping complete!');
        console.log('📁 Folders:');
        console.log('   - chapters/ (chapter metadata JSON)');
        console.log('   - images/chapters/ (downloaded images)');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await scraper.close();
    }
}

main();
