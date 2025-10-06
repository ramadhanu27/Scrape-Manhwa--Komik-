import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ShinigamiScraperPuppeteer {
  constructor() {
    this.baseUrl = 'https://07.shinigami.asia';
    this.outputDir = path.join(__dirname, 'data');
    this.browser = null;
    this.page = null;
  }

  /**
   * Inisialisasi browser
   */
  async init() {
    console.log('🚀 Meluncurkan browser...');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport dan user agent
    await this.page.setViewport({ width: 1920, height: 1080 });
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('✅ Browser siap!\n');
  }

  /**
   * Tutup browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n🔒 Browser ditutup');
    }
  }

  /**
   * Mengambil HTML dari URL dengan Puppeteer
   */
  async fetchPage(url, waitTime = 3000) {
    try {
      console.log(`📥 Mengambil halaman: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Tunggu konten dimuat
      await this.delay(waitTime);
      
      const html = await this.page.content();
      return html;
    } catch (error) {
      console.error(`❌ Error mengambil halaman: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scrape daftar manhwa dari halaman
   */
  async scrapeManhwaList(url) {
    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);
      const manhwaList = [];

      // Selector berdasarkan HTML yang diberikan
      // Cari div dengan class "text-16 font-medium text-base-white line-clamp-2" untuk judul
      $('.text-16.font-medium.text-base-white.line-clamp-2').each((index, element) => {
        const $titleElem = $(element);
        const title = $titleElem.text().trim();
        
        // Cari parent link (a tag)
        const $link = $titleElem.closest('a[href*="/series/"]');
        if (!$link.length) return;
        
        const href = $link.attr('href');
        if (!href || !href.includes('/series/')) return;
        
        const seriesUrl = href.startsWith('http') ? href : this.baseUrl + href;
        
        // Ambil gambar dari link yang sama
        const imageUrl = $link.find('img').attr('src');
        
        // Ambil chapter terbaru
        const latestChapter = $link.find('.text-12.text-general-300').first().text().trim();
        
        // Ambil status dari button
        const status = $link.find('button').text().trim();
        
        // Ambil rating, views, bookmarks
        const statsSpans = $link.find('span.text-12.leading-16.text-base-white');
        const rating = statsSpans.eq(0).text().trim() || '0';
        const views = statsSpans.eq(1).text().trim() || '0';
        const bookmarks = statsSpans.eq(2).text().trim() || '0';
        
        // Ambil deskripsi
        const description = $link.find('.text-12.text-general-300.line-clamp-3').text().trim();

        // Tambahkan ke list
        if (title) {
          manhwaList.push({
            title: title,
            url: seriesUrl,
            slug: href.replace('/series/', '').replace(/\//g, ''),
            image: imageUrl,
            latestChapter: latestChapter,
            status: status || 'Unknown',
            rating: rating,
            views: views,
            bookmarks: bookmarks,
            description: description || '',
            scrapedAt: new Date().toISOString()
          });
        }
      });

      console.log(`✅ Berhasil scrape ${manhwaList.length} manhwa`);
      return manhwaList;
    } catch (error) {
      console.error(`❌ Error scraping manhwa list: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scrape detail manhwa
   */
  async scrapeManhwaDetail(seriesUrl) {
    try {
      const html = await this.fetchPage(seriesUrl);
      const $ = cheerio.load(html);

      const title = $('.text-24.font-bold, h1, .text-16.font-medium.text-base-white').first().text().trim() || '';
      const image = $('img').first().attr('src') || '';
      const description = $('.text-14, .text-12.text-general-300.line-clamp-3').first().text().trim() || '';
      const author = $('.author, .text-12:contains("Author")').text().trim() || 'Unknown';
      const status = $('button').first().text().trim() || 'Unknown';
      
      const statsSpans = $('span.text-12.leading-16.text-base-white');
      const rating = statsSpans.eq(0).text().trim() || '0';
      const views = statsSpans.eq(1).text().trim() || '0';
      const bookmarks = statsSpans.eq(2).text().trim() || '0';

      const genres = [];
      $('.genre a, [class*="genre"] a').each((i, elem) => {
        const genre = $(elem).text().trim();
        if (genre) genres.push(genre);
      });

      const chapters = [];
      $('a[href*="/chapter/"]').each((i, elem) => {
        const $chapter = $(elem);
        const chapterTitle = $chapter.text().trim();
        const chapterUrl = $chapter.attr('href');
        
        if (chapterUrl && chapterTitle) {
          chapters.push({
            title: chapterTitle,
            url: chapterUrl.startsWith('http') ? chapterUrl : this.baseUrl + chapterUrl,
            number: i + 1
          });
        }
      });

      const manhwaDetail = {
        title: title,
        url: seriesUrl,
        image: image,
        description: description,
        author: author,
        status: status,
        rating: rating,
        views: views,
        bookmarks: bookmarks,
        genres: genres,
        totalChapters: chapters.length,
        chapters: chapters,
        scrapedAt: new Date().toISOString()
      };

      console.log(`✅ Berhasil scrape detail: ${title}`);
      return manhwaDetail;
    } catch (error) {
      console.error(`❌ Error scraping manhwa detail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scrape gambar dari chapter
   */
  async scrapeChapterImages(chapterUrl) {
    try {
      const html = await this.fetchPage(chapterUrl, 5000); // Wait longer for images
      const $ = cheerio.load(html);
      const images = [];

      $('#readerarea img, .reading-content img, .chapter-content img, .reader-area img, [class*="reader"] img').each((i, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
        
        if (src && !src.includes('logo') && !src.includes('icon')) {
          images.push({
            url: src.startsWith('http') ? src : this.baseUrl + src,
            index: i + 1,
            alt: $(elem).attr('alt') || `Page ${i + 1}`
          });
        }
      });

      console.log(`  📸 Ditemukan ${images.length} gambar`);
      return images;
    } catch (error) {
      console.error(`  ❌ Error scraping chapter images: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scrape dengan pagination
   */
  async scrapeWithPagination(baseSearchUrl, maxPages = 3) {
    console.log(`\n🔍 Memulai scraping dengan pagination (max ${maxPages} halaman)\n`);
    
    const allManhwa = [];
    
    for (let page = 1; page <= maxPages; page++) {
      try {
        const url = baseSearchUrl.includes('?') 
          ? `${baseSearchUrl}&page=${page}` 
          : `${baseSearchUrl}?page=${page}`;
        
        console.log(`\n📄 Scraping halaman ${page}...`);
        const manhwaList = await this.scrapeManhwaList(url);
        
        if (manhwaList.length === 0) {
          console.log(`⚠️  Tidak ada data di halaman ${page}, menghentikan pagination`);
          break;
        }
        
        allManhwa.push(...manhwaList);
        console.log(`✅ Halaman ${page}: ${manhwaList.length} manhwa`);
        
        if (page < maxPages) {
          await this.delay(3000);
        }
      } catch (error) {
        console.error(`❌ Error di halaman ${page}: ${error.message}`);
        break;
      }
    }
    
    console.log(`\n✅ Total manhwa dari ${Math.min(maxPages, allManhwa.length)} halaman: ${allManhwa.length}`);
    return allManhwa;
  }

  /**
   * Simpan data ke JSON
   */
  async saveToJSON(data, filename) {
    try {
      await fs.ensureDir(this.outputDir);
      const filepath = path.join(this.outputDir, filename);
      await fs.writeJSON(filepath, data, { spaces: 2 });
      console.log(`\n💾 Data berhasil disimpan ke: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error(`❌ Error menyimpan JSON: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate summary report
   */
  generateSummary(manhwaList) {
    const summary = {
      totalManhwa: manhwaList.length,
      byStatus: {},
      topRated: [],
      mostViewed: [],
      generatedAt: new Date().toISOString()
    };

    manhwaList.forEach(manhwa => {
      const status = manhwa.status || 'Unknown';
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
    });

    summary.topRated = manhwaList
      .filter(m => m.rating && parseFloat(m.rating) > 0)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 10)
      .map(m => ({ title: m.title, rating: m.rating, url: m.url }));

    summary.mostViewed = manhwaList
      .filter(m => m.views)
      .sort((a, b) => {
        const viewsA = this.parseViews(a.views);
        const viewsB = this.parseViews(b.views);
        return viewsB - viewsA;
      })
      .slice(0, 10)
      .map(m => ({ title: m.title, views: m.views, url: m.url }));

    return summary;
  }

  /**
   * Parse views string to number
   */
  parseViews(viewsStr) {
    if (!viewsStr) return 0;
    const str = viewsStr.toLowerCase().replace(/,/g, '');
    if (str.includes('m')) return parseFloat(str) * 1000000;
    if (str.includes('k')) return parseFloat(str) * 1000;
    return parseFloat(str) || 0;
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .trim()
      .substring(0, 200);
  }
}

// ============================================
// CONTOH PENGGUNAAN
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('SHINIGAMI SCRAPER (PUPPETEER) - Scrape Manhwa ke JSON');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraperPuppeteer();

  try {
    // Inisialisasi browser
    await scraper.init();

    // Scrape halaman search
    console.log('\n📚 Scrape daftar manhwa dari halaman search');
    const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');
    
    // Simpan ke JSON
    await scraper.saveToJSON(manhwaList, 'manhwa-list.json');
    
    // Generate summary
    const summary = scraper.generateSummary(manhwaList);
    await scraper.saveToJSON(summary, 'manhwa-summary.json');
    
    console.log('\n📊 Summary:');
    console.log(`   Total Manhwa: ${summary.totalManhwa}`);
    console.log(`   Status: ${JSON.stringify(summary.byStatus, null, 2)}`);

    // Tampilkan 5 manhwa pertama
    if (manhwaList.length > 0) {
      console.log('\n📋 5 Manhwa Pertama:');
      manhwaList.slice(0, 5).forEach((manhwa, idx) => {
        console.log(`\n${idx + 1}. ${manhwa.title}`);
        console.log(`   Status: ${manhwa.status}`);
        console.log(`   Rating: ${manhwa.rating} ⭐`);
        console.log(`   Views: ${manhwa.views} 👁️`);
        console.log(`   Latest: ${manhwa.latestChapter}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Scraping selesai!');
    console.log('📁 Hasil tersimpan di folder: data/');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    // Tutup browser
    await scraper.close();
  }
}

// Jalankan program
main().catch(console.error);

export default ShinigamiScraperPuppeteer;
