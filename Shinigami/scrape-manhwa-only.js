import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ShinigamiManhwaOnlyScraper {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data', 'shinigami');
        this.baseUrl = 'https://07.shinigami.asia/search';
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
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });

        // Block ads
        await this.page.setRequestInterception(true);
        this.page.on('request', (req) => {
            const url = req.url();
            if (url.includes('ads') || url.includes('banner') || url.includes('popup')) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log('✅ Browser ready with ad blocker!\n');
    }

    async closePopups() {
        try {
            await this.page.evaluate(() => {
                // Close any popups
                const closeButtons = document.querySelectorAll('[class*="close"], [class*="tutup"], button');
                closeButtons.forEach(btn => {
                    const text = btn.textContent.toLowerCase();
                    if (text.includes('tutup') || text.includes('close') || text.includes('×')) {
                        btn.click();
                    }
                });

                // Remove overlays
                const overlays = document.querySelectorAll('[class*="modal"], [class*="popup"], [class*="overlay"]');
                overlays.forEach(overlay => overlay.remove());
            });
        } catch (error) {
            // Ignore popup close errors
        }
    }

    async scrapeManhwaOnly() {
        try {
            console.log('📡 Loading search page...');
            await this.page.goto(this.baseUrl, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            // Close any popups first
            await this.closePopups();

            // Click "Manhwa" filter button under "Format" section
            console.log('🔘 Clicking Manhwa filter...');
            const manhwaClicked = await this.page.evaluate(() => {
                // Method 1: Find button with specific classes (from screenshot)
                const buttons = document.querySelectorAll('button.border-2.bg-base-card.text-base-white.border-base-card');
                for (const btn of buttons) {
                    if (btn.textContent.trim() === 'Manhwa') {
                        // Check if already selected (has border-primary-500)
                        if (!btn.classList.contains('border-primary-500')) {
                            btn.click();
                            console.log('Clicked Manhwa button (method 1)');
                        }
                        return true;
                    }
                }
                
                // Method 2: Find in Format section
                const formatHeaders = Array.from(document.querySelectorAll('h1, h2, h3, h4, div, span'));
                for (const header of formatHeaders) {
                    if (header.textContent.trim() === 'Format') {
                        const formatSection = header.closest('div') || header.parentElement;
                        if (formatSection) {
                            const formatButtons = formatSection.querySelectorAll('button');
                            for (const btn of formatButtons) {
                                if (btn.textContent.trim() === 'Manhwa') {
                                    btn.click();
                                    console.log('Clicked Manhwa button (method 2)');
                                    return true;
                                }
                            }
                        }
                    }
                }
                
                // Method 3: Find any button with "Manhwa" text
                const allButtons = Array.from(document.querySelectorAll('button'));
                const manhwaBtn = allButtons.find(btn => btn.textContent.trim() === 'Manhwa');
                if (manhwaBtn) {
                    manhwaBtn.click();
                    console.log('Clicked Manhwa button (method 3)');
                    return true;
                }
                
                return false;
            });

            if (!manhwaClicked) {
                console.log('❌ Manhwa filter button not found!');
                console.log('⚠️  Will scrape all series (may include manga/manhua)');
                
                // Take screenshot for debugging
                const screenshotPath = path.join(this.dataDir, 'debug-filter-not-found.png');
                await this.page.screenshot({ path: screenshotPath, fullPage: false });
                console.log(`📸 Screenshot saved: ${screenshotPath}`);
            } else {
                console.log('✅ Manhwa filter applied');
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait longer for filter to apply
            
            // Take screenshot after filter applied
            if (manhwaClicked) {
                const screenshotPath = path.join(this.dataDir, 'debug-after-filter.png');
                await this.page.screenshot({ path: screenshotPath, fullPage: false });
                console.log(`📸 Screenshot saved: ${screenshotPath}`);
            }

            // Scroll to load all manhwa
            console.log('📜 Scrolling to load all manhwa...');
            await this.scrollToBottom();

            // Extract manhwa data
            console.log('📊 Extracting manhwa data...');
            const manhwaList = await this.page.evaluate(() => {
                const manhwaCards = [];
                
                // Try multiple selectors for manhwa cards
                let cards = document.querySelectorAll('a[href*="/series/"]');
                
                if (cards.length === 0) {
                    cards = document.querySelectorAll('[class*="card"], [class*="item"]');
                }

                cards.forEach(card => {
                    try {
                        // Get link
                        const link = card.href || card.querySelector('a')?.href;
                        if (!link || !link.includes('/series/')) return;

                        // Get title
                        let title = card.querySelector('h3, h4, .title, [class*="title"]')?.textContent.trim();
                        if (!title) {
                            title = card.querySelector('img')?.alt || '';
                        }

                        // Get image
                        const img = card.querySelector('img');
                        const image = img?.src || img?.dataset.src || '';

                        // Get metadata
                        const latestChapter = card.querySelector('[class*="chapter"], [class*="latest"]')?.textContent.trim() || '';
                        const status = card.querySelector('[class*="status"]')?.textContent.trim() || '';
                        const views = card.querySelector('[class*="view"]')?.textContent.trim() || '';
                        const updateTime = card.querySelector('[class*="time"], [class*="update"]')?.textContent.trim() || '';

                        if (title && link) {
                            // Extract slug from URL
                            const slug = link.split('/').filter(Boolean).pop();
                            
                            manhwaCards.push({
                                title: title,
                                url: link,
                                slug: slug,
                                image: image,
                                imageAlt: img?.alt || title,
                                latestChapter: latestChapter,
                                status: status,
                                views: views,
                                updateTime: updateTime,
                                scrapedAt: new Date().toISOString()
                            });
                        }
                    } catch (error) {
                        console.error('Error parsing card:', error);
                    }
                });

                return manhwaCards;
            });

            // Remove duplicates based on URL
            const uniqueManhwa = Array.from(
                new Map(manhwaList.map(m => [m.url, m])).values()
            );

            // Verify that filter was applied by checking the active filter badge
            const activeFilter = await this.page.evaluate(() => {
                // Check for "Manhwa ×" badge or "1 filters applied"
                const badges = document.querySelectorAll('button, div, span');
                for (const badge of badges) {
                    const text = badge.textContent.trim();
                    if (text.includes('Manhwa') && text.includes('×')) {
                        return 'Manhwa';
                    }
                    if (text.includes('filters applied')) {
                        return 'Applied';
                    }
                }
                
                // Check for button with border-primary-500 class
                const activeButtons = document.querySelectorAll('button.border-primary-500');
                for (const btn of activeButtons) {
                    if (btn.textContent.trim() === 'Manhwa') {
                        return 'Manhwa';
                    }
                }
                
                return null;
            });

            if (activeFilter) {
                console.log(`✅ Verified: Manhwa filter is active (${activeFilter})`);
            } else {
                console.log(`⚠️  Warning: Could not verify Manhwa filter`);
            }

            console.log(`✅ Found ${uniqueManhwa.length} series\n`);
            return uniqueManhwa;

        } catch (error) {
            console.error('❌ Error scraping:', error.message);
            return [];
        }
    }

    async scrollToBottom() {
        let previousHeight = 0;
        let scrollAttempts = 0;
        const maxScrolls = 50;

        while (scrollAttempts < maxScrolls) {
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            const currentHeight = await this.page.evaluate(() => document.body.scrollHeight);

            if (currentHeight === previousHeight) {
                break;
            }

            previousHeight = currentHeight;
            scrollAttempts++;
            
            process.stdout.write(`\r   Scrolling... (${scrollAttempts} scrolls)`);
        }
        
        console.log('\n   ✅ Finished scrolling');
    }

    async saveData(manhwaList) {
        try {
            await fs.ensureDir(this.dataDir);
            
            const data = {
                source: '07.shinigami.asia',
                filter: 'Manhwa only',
                totalManhwa: manhwaList.length,
                scrapedAt: new Date().toISOString(),
                manhwa: manhwaList
            };

            const filePath = path.join(this.dataDir, 'manhwa-only.json');
            await fs.writeJSON(filePath, data, { spaces: 2 });
            
            console.log(`\n💾 Data saved to: manhwa-only.json`);
            console.log(`📊 Total: ${manhwaList.length} manhwa`);
        } catch (error) {
            console.error('❌ Error saving data:', error.message);
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
    console.log('============================================================');
    console.log('📖 SHINIGAMI MANHWA-ONLY SCRAPER');
    console.log('============================================================\n');

    try {
        const scraper = new ShinigamiManhwaOnlyScraper();
        await scraper.init();

        const manhwaList = await scraper.scrapeManhwaOnly();

        if (manhwaList.length > 0) {
            await scraper.saveData(manhwaList);
        } else {
            console.log('⚠️  No manhwa found');
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Scraping complete!');
        console.log('='.repeat(60));

        await scraper.close();

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

main();
