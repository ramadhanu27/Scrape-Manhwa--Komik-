import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ShinigamiScraperHTML {
  constructor() {
    this.baseUrl = 'https://07.shinigami.asia';
    this.outputDir = path.join(__dirname, 'data');
  }

  /**
   * Scrape dari HTML string atau file
   */
  async scrapeFromHTML(htmlContent) {
    try {
      console.log('📥 Parsing HTML...');
      const $ = cheerio.load(htmlContent);
      const manhwaList = [];

      // Selector berdasarkan HTML yang diberikan
      $('.text-16.font-medium.text-base-white.line-clamp-2').each((index, element) => {
        const $titleElem = $(element);
        const title = $titleElem.text().trim();
        
        // Cari parent link (a tag)
        const $link = $titleElem.closest('a[href*="/series/"]');
        if (!$link.length) return;
        
        const href = $link.attr('href');
        if (!href || !href.includes('/series/')) return;
        
        const seriesUrl = href.startsWith('http') ? href : this.baseUrl + href;
        
        // Ambil gambar
        const imageUrl = $link.find('img').attr('src');
        
        // Ambil chapter terbaru
        const latestChapter = $link.find('.text-12.text-general-300').first().text().trim();
        
        // Ambil status
        const status = $link.find('button').text().trim();
        
        // Ambil rating, views, bookmarks
        const statsSpans = $link.find('span.text-12.leading-16.text-base-white');
        const rating = statsSpans.eq(0).text().trim() || '0';
        const views = statsSpans.eq(1).text().trim() || '0';
        const bookmarks = statsSpans.eq(2).text().trim() || '0';
        
        // Ambil deskripsi
        const description = $link.find('.text-12.text-general-300.line-clamp-3').text().trim();

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
      console.error(`❌ Error scraping: ${error.message}`);
      throw error;
    }
  }

  /**
   * Scrape dari file HTML
   */
  async scrapeFromFile(filepath) {
    try {
      console.log(`📂 Membaca file: ${filepath}`);
      const htmlContent = await fs.readFile(filepath, 'utf-8');
      return await this.scrapeFromHTML(htmlContent);
    } catch (error) {
      console.error(`❌ Error membaca file: ${error.message}`);
      throw error;
    }
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
   * Generate summary
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
  console.log('SHINIGAMI SCRAPER (HTML) - Parse HTML ke JSON');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraperHTML();

  // Contoh HTML dari user (paste HTML yang Anda berikan)
  const sampleHTML = `
<div class="grid mb-24 lg:grid-cols-2 grid-cols-1 gap-24">
  <a href="/series/02d63ee2-df25-4b49-8893-ae8146b1c923/" class="flex items-center gap-12 relative">
    <img src="https://storage.shngm.id/thumbnail/cover/c8a6676ff239.jpeg" alt="The Strongest Assassin Gets Transferred to Another World With His Whole Class" class="w-115 aspect-[115/160] object-cover" loading="lazy">
    <div class="flex flex-col items-start text-start gap-8">
      <div class="text-16 font-medium text-base-white line-clamp-2">The Strongest Assassin Gets Transferred to Another World With His Whole Class</div>
      <div class="flex items-center gap-12">
        <div class="text-12 text-general-300 line-clamp-2">Chapter 96</div>
        <button class="opacity-100 hover:opacity-80 transition-all duration-200 ease-in-out px-6 py-2 rounded-4 text-9 leading-12 ring-2 ring-primary-500 bg-primary-500/25 text-base-white">Ongoing</button>
      </div>
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-4">
          <img src="/icons/star.png" alt="star" class="w-14 h-14 -mt-2">
          <span class="text-12 leading-16 text-base-white">0</span>
        </div>
        <div class="items-center gap-4 flex">
          <img src="/icons/show.svg" alt="star" class="w-14 h-14 -mt-2">
          <span class="text-12 leading-16 text-base-white">676.5k</span>
        </div>
        <div class="flex items-center gap-4">
          <img src="/icons/bookmark-light-blue.svg" alt="star" class="w-16 h-14 -mt-2">
          <span class="text-12 leading-16 text-base-white">3.1k</span>
        </div>
      </div>
      <div class="text-12 text-general-300 line-clamp-3">Manga The strongest assassin gets transferred to another world with his whole class...</div>
    </div>
  </a>
  
  <a href="/series/dfb50275-6f88-449f-9153-2cd39a545437/" class="flex items-center gap-12 relative">
    <img src="https://storage.shngm.id/low/unsafe/filters:format(webp):quality(70)/thumbnail/image/d66bf342-bcfd-4a3e-8008-a8410011cc49.jpg" alt="Cerberus" class="w-115 aspect-[115/160] object-cover" loading="lazy">
    <div class="flex flex-col items-start text-start gap-8">
      <div class="text-16 font-medium text-base-white line-clamp-2">Cerberus</div>
      <div class="flex items-center gap-12">
        <div class="text-12 text-general-300 line-clamp-2">Chapter 10</div>
        <button class="opacity-100 hover:opacity-80 transition-all duration-200 ease-in-out px-6 py-2 rounded-4 text-9 leading-12 ring-2 ring-primary-500 bg-primary-500/25 text-base-white">Ongoing</button>
      </div>
      <div class="flex items-center gap-8">
        <div class="flex items-center gap-4">
          <img src="/icons/star.png" alt="star" class="w-14 h-14 -mt-2">
          <span class="text-12 leading-16 text-base-white">7.5</span>
        </div>
        <div class="items-center gap-4 flex">
          <img src="/icons/show.svg" alt="star" class="w-14 h-14 -mt-2">
          <span class="text-12 leading-16 text-base-white">12.4k</span>
        </div>
        <div class="flex items-center gap-4">
          <img src="/icons/bookmark-light-blue.svg" alt="star" class="w-16 h-14 -mt-2">
          <span class="text-12 leading-16 text-base-white">207</span>
        </div>
      </div>
      <div class="text-12 text-general-300 line-clamp-3">Fukutome Kai (21), yang tinggal di distrik Shin-Ōkubo...</div>
    </div>
  </a>
</div>
  `;

  try {
    // Scrape dari HTML string
    console.log('\n📚 Scrape dari HTML sample\n');
    const manhwaList = await scraper.scrapeFromHTML(sampleHTML);
    
    // Simpan ke JSON
    await scraper.saveToJSON(manhwaList, 'manhwa-from-html.json');
    
    // Generate summary
    const summary = scraper.generateSummary(manhwaList);
    await scraper.saveToJSON(summary, 'manhwa-summary-html.json');
    
    // Tampilkan hasil
    console.log('\n📊 Hasil Scraping:');
    console.log(`   Total Manhwa: ${manhwaList.length}\n`);
    
    manhwaList.forEach((manhwa, idx) => {
      console.log(`${idx + 1}. ${manhwa.title}`);
      console.log(`   URL: ${manhwa.url}`);
      console.log(`   Status: ${manhwa.status}`);
      console.log(`   Rating: ${manhwa.rating} ⭐`);
      console.log(`   Views: ${manhwa.views} 👁️`);
      console.log(`   Bookmarks: ${manhwa.bookmarks} 🔖`);
      console.log(`   Latest: ${manhwa.latestChapter}\n`);
    });

    console.log('='.repeat(60));
    console.log('✅ Scraping selesai!');
    console.log('📁 Hasil tersimpan di folder: data/');
    console.log('='.repeat(60));
    console.log('\n💡 Cara Menggunakan:');
    console.log('   1. Buka https://07.shinigami.asia/search di browser');
    console.log('   2. Klik kanan → Inspect → Copy HTML dari grid manhwa');
    console.log('   3. Paste HTML ke variable sampleHTML di file ini');
    console.log('   4. Jalankan: node shinigami-scraper-html.js\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

main().catch(console.error);

export default ShinigamiScraperHTML;
