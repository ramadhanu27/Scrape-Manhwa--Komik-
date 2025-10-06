import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ShinigamiScraper {
  constructor() {
    this.baseUrl = 'https://07.shinigami.asia';
    this.outputDir = path.join(__dirname, 'data');
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': this.baseUrl
    };
  }

  /**
   * Mengambil HTML dari URL
   */
  async fetchPage(url) {
    try {
      console.log(`📥 Mengambil halaman: ${url}`);
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 30000
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error mengambil halaman: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scrape daftar manhwa dari halaman pencarian atau home
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
        
        // Ambil chapter terbaru - cari div dengan class "text-12 text-general-300" yang pertama
        const latestChapter = $link.find('.text-12.text-general-300').first().text().trim();
        
        // Ambil status dari button
        const status = $link.find('button').text().trim();
        
        // Ambil rating, views, bookmarks dari span dengan class "text-12 leading-16 text-base-white"
        const statsSpans = $link.find('span.text-12.leading-16.text-base-white');
        const rating = statsSpans.eq(0).text().trim() || '0';
        const views = statsSpans.eq(1).text().trim() || '0';
        const bookmarks = statsSpans.eq(2).text().trim() || '0';
        
        // Ambil deskripsi dari div dengan class "text-12 text-general-300 line-clamp-3"
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
   * Scrape detail manhwa dari halaman series
   */
  async scrapeManhwaDetail(seriesUrl) {
    try {
      const html = await this.fetchPage(seriesUrl);
      const $ = cheerio.load(html);

      // Ambil informasi detail
      const title = $('.text-24.font-bold, h1').first().text().trim() || 
                   $('meta[property="og:title"]').attr('content') || '';
      
      const image = $('.aspect-\\[115\\/160\\] img, .cover-image img').first().attr('src') || 
                   $('meta[property="og:image"]').attr('content') || '';
      
      const description = $('.text-14.text-general-300, .description, .summary').first().text().trim() || '';
      
      const author = $('.text-12:contains("Author") + .text-12, .author').text().trim() || 'Unknown';
      
      const status = $('button.ring-primary-500, .status').first().text().trim() || 'Unknown';
      
      const rating = $('.flex.items-center.gap-4 span.text-12').first().text().trim() || '0';
      
      const views = $('.items-center.gap-4.flex span.text-12').first().text().trim() || '0';
      
      const bookmarks = $('.flex.items-center.gap-4').last().find('span.text-12').text().trim() || '0';

      // Ambil genre
      const genres = [];
      $('.genre, .genres a, [class*="genre"] a').each((i, elem) => {
        const genre = $(elem).text().trim();
        if (genre) genres.push(genre);
      });

      // Ambil daftar chapter
      const chapters = [];
      $('a[href*="/chapter/"], .chapter-list a, [class*="chapter"] a').each((i, elem) => {
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
      const html = await this.fetchPage(chapterUrl);
      const $ = cheerio.load(html);
      const images = [];

      // Selector untuk gambar chapter
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
        // Konstruksi URL dengan page number
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
        
        // Delay antar halaman
        if (page < maxPages) {
          await this.delay(2000);
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
   * Load data dari JSON
   */
  async loadFromJSON(filename) {
    try {
      const filepath = path.join(this.outputDir, filename);
      const data = await fs.readJSON(filepath);
      console.log(`📂 Data berhasil dimuat dari: ${filepath}`);
      return data;
    } catch (error) {
      console.error(`❌ Error membaca JSON: ${error.message}`);
      throw error;
    }
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

    // Group by status
    manhwaList.forEach(manhwa => {
      const status = manhwa.status || 'Unknown';
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
    });

    // Top rated (sort by rating)
    summary.topRated = manhwaList
      .filter(m => m.rating && parseFloat(m.rating) > 0)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 10)
      .map(m => ({ title: m.title, rating: m.rating, url: m.url }));

    // Most viewed
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
   * Parse views string to number (e.g., "1.7m" -> 1700000)
   */
  parseViews(viewsStr) {
    if (!viewsStr) return 0;
    const str = viewsStr.toLowerCase().replace(/,/g, '');
    if (str.includes('m')) return parseFloat(str) * 1000000;
    if (str.includes('k')) return parseFloat(str) * 1000;
    return parseFloat(str) || 0;
  }
}

// ============================================
// CONTOH PENGGUNAAN
// ============================================

async function main() {
  console.log('='.repeat(60));
  console.log('SHINIGAMI SCRAPER - Scrape Manhwa ke JSON');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraper();

  try {
    // Contoh 1: Scrape halaman search/home
    console.log('\n📚 Contoh 1: Scrape daftar manhwa dari halaman search');
    const searchUrl = 'https://07.shinigami.asia/search';
    const manhwaList = await scraper.scrapeManhwaList(searchUrl);
    
    // Simpan ke JSON
    await scraper.saveToJSON(manhwaList, 'manhwa-list.json');
    
    // Generate summary
    const summary = scraper.generateSummary(manhwaList);
    await scraper.saveToJSON(summary, 'manhwa-summary.json');
    
    console.log('\n📊 Summary:');
    console.log(`   Total Manhwa: ${summary.totalManhwa}`);
    console.log(`   Status: ${JSON.stringify(summary.byStatus, null, 2)}`);

    // Contoh 2: Scrape dengan pagination (uncomment untuk menggunakan)
    /*
    console.log('\n\n📚 Contoh 2: Scrape dengan pagination (3 halaman)');
    const allManhwa = await scraper.scrapeWithPagination(searchUrl, 3);
    await scraper.saveToJSON(allManhwa, 'manhwa-list-all-pages.json');
    
    const fullSummary = scraper.generateSummary(allManhwa);
    await scraper.saveToJSON(fullSummary, 'manhwa-summary-all-pages.json');
    */

    // Contoh 3: Scrape detail manhwa (uncomment untuk menggunakan)
    /*
    if (manhwaList.length > 0) {
      console.log('\n\n📚 Contoh 3: Scrape detail manhwa pertama');
      const firstManhwa = manhwaList[0];
      const detail = await scraper.scrapeManhwaDetail(firstManhwa.url);
      
      const filename = `manhwa-detail-${scraper.sanitizeFilename(detail.title)}.json`;
      await scraper.saveToJSON(detail, filename);
    }
    */

    // Contoh 4: Scrape gambar chapter (uncomment untuk menggunakan)
    /*
    if (manhwaList.length > 0) {
      console.log('\n\n📚 Contoh 4: Scrape gambar dari chapter');
      const firstManhwa = manhwaList[0];
      const detail = await scraper.scrapeManhwaDetail(firstManhwa.url);
      
      if (detail.chapters.length > 0) {
        const firstChapter = detail.chapters[0];
        const images = await scraper.scrapeChapterImages(firstChapter.url);
        
        const chapterData = {
          manhwa: detail.title,
          chapter: firstChapter.title,
          url: firstChapter.url,
          images: images,
          totalImages: images.length,
          scrapedAt: new Date().toISOString()
        };
        
        await scraper.saveToJSON(chapterData, 'chapter-images.json');
      }
    }
    */

    console.log('\n' + '='.repeat(60));
    console.log('✅ Scraping selesai!');
    console.log('📁 Hasil tersimpan di folder: data/');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Jalankan program
main().catch(console.error);

export default ShinigamiScraper;
