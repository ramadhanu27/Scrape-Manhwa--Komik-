import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ShinigamiScraperCard {
  constructor() {
    this.baseUrl = 'https://07.shinigami.asia';
    this.outputDir = path.join(__dirname, 'data');
  }

  /**
   * Scrape dari HTML string atau file (Card Layout Vertikal)
   */
  async scrapeFromHTML(htmlContent) {
    try {
      console.log('📥 Parsing HTML...');
      const $ = cheerio.load(htmlContent);
      const manhwaList = [];

      // Selector untuk card layout vertikal
      $('a[href*="/series/"]').each((index, element) => {
        const $link = $(element);
        const href = $link.attr('href');
        
        if (!href || !href.includes('/series/')) return;
        
        const seriesUrl = href.startsWith('http') ? href : this.baseUrl + href;
        
        // Ambil judul dari h4 dengan class "text-base-white md:text-14 text-12 leading-16 line-clamp-2"
        const title = $link.find('h4.text-base-white').text().trim() || 
                     $link.find('.text-base-white.line-clamp-2').text().trim();
        
        if (!title) return; // Skip jika tidak ada judul
        
        // Ambil gambar - gunakan placeholder karena URL lokal
        let imageUrl = $link.find('img').attr('src');
        const imageAlt = $link.find('img').attr('alt');
        
        // Fix local image path - gunakan placeholder
        if (imageUrl && imageUrl.startsWith('./')) {
          // Gunakan placeholder image dengan warna random
          const colors = ['667eea', '764ba2', 'f093fb', 'f5576c', '4facfe', '00f2fe', 'fa709a', 'fee140'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const titleEncoded = encodeURIComponent(title || 'Manhwa');
          imageUrl = `https://via.placeholder.com/300x400/${randomColor}/ffffff?text=${titleEncoded}`;
        }
        
        // Ambil views dan chapter dari div dengan class "bg-base-white/25"
        const statsElements = $link.find('.bg-base-white\\/25');
        let views = '0';
        let latestChapter = '';
        
        statsElements.each((i, elem) => {
          const text = $(elem).text().trim();
          if (text.includes('k') || text.includes('m') || text.includes('K') || text.includes('M')) {
            // Ini adalah views (mengandung k atau m)
            views = text;
          } else if (text.toUpperCase().startsWith('CH')) {
            // Ini adalah chapter
            latestChapter = text;
          }
        });
        
        // Ambil status dari button (UP/NEW/dll)
        const statusButton = $link.find('button.bg-danger-500, button[class*="bg-"]').text().trim();
        let status = 'Ongoing'; // Default
        if (statusButton.includes('UP') || statusButton.includes('U')) {
          status = 'Ongoing';
        }
        
        // Ambil update time (3h, 1d, dll)
        const updateTime = $link.find('.flex.items-center.justify-center.bg-base-white').text().trim();

        manhwaList.push({
          title: title,
          url: seriesUrl,
          slug: href.replace('/series/', '').replace(/\//g, ''),
          image: imageUrl,
          imageAlt: imageAlt || title,
          latestChapter: latestChapter || 'Unknown',
          status: status,
          views: views,
          updateTime: updateTime || 'Unknown',
          scrapedAt: new Date().toISOString()
        });
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
      mostViewed: [],
      recentUpdates: [],
      generatedAt: new Date().toISOString()
    };

    manhwaList.forEach(manhwa => {
      const status = manhwa.status || 'Unknown';
      summary.byStatus[status] = (summary.byStatus[status] || 0) + 1;
    });

    summary.mostViewed = manhwaList
      .filter(m => m.views)
      .sort((a, b) => {
        const viewsA = this.parseViews(a.views);
        const viewsB = this.parseViews(b.views);
        return viewsB - viewsA;
      })
      .slice(0, 10)
      .map(m => ({ title: m.title, views: m.views, url: m.url }));

    summary.recentUpdates = manhwaList
      .filter(m => m.updateTime && m.updateTime !== 'Unknown')
      .slice(0, 10)
      .map(m => ({ title: m.title, updateTime: m.updateTime, chapter: m.latestChapter }));

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
  console.log('SHINIGAMI SCRAPER (CARD LAYOUT) - Parse HTML ke JSON');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraperCard();

  // Sample HTML dari user (card layout vertikal) - PASTE HTML LENGKAP DI SINI
  const sampleHTML = ` 
          <div class="flex items-center justify-center bg-base-white pl-4 pr-6 h-18 text-10 text-base-dark font-medium">3h</div>
        </div>  
        <button class="bg-danger-500 px-4 h-18 text-10 text-base-white rounded-4 font-normal">
          <div class="md:block hidden">UP</div> 
          <div class="md:hidden block">U</div>
        </button>
      </div> 
      <img class="w-full mb-16 aspect-[130/200] object-cover rounded-8" src="https://storage.shngm.id/thumbnail/cover/c8a6676ff239.jpeg" alt="The Strongest Assassin Gets Transferred to Another World With His Whole Class" style="">  
      <div class="flex flex-col text-center items-center h-68">
        <div class="mb-16 flex flex-col justify-end h-32">
          <h4 class="text-base-white md:text-14 text-12 leading-16 line-clamp-2">The Strongest Assassin Gets Transferred to Another World With His Whole Class</h4>
        </div> 
        <div class="flex items-center gap-4">
          <div class="bg-base-white/25 rounded-6 py-2 px-4 text-base-white text-10 font-semibold items-center gap-2 flex">
            <svg class="min-w-13 min-h-12" width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.1429 1.5C8.8389 1.5 11.0819 3.44 11.5524 6C11.0824 8.56 8.8389 10.5 6.1429 10.5C3.4469 10.5 1.2039 8.56 0.733398 6C1.2034 3.44 3.4469 1.5 6.1429 1.5ZM6.1429 9.5C7.16263 9.49978 8.15209 9.15341 8.94933 8.51758C9.74656 7.88176 10.3044 6.99414 10.5314 6C10.3035 5.00665 9.74537 4.12 8.94821 3.48501C8.15105 2.85002 7.16205 2.50426 6.1429 2.50426C5.12375 2.50426 4.13474 2.85002 3.33759 3.48501C2.54043 4.12 1.98228 5.00665 1.7544 6C1.98145 6.99414 2.53924 7.88176 3.33647 8.51758C4.13371 9.15341 5.12316 9.49978 6.1429 9.5ZM6.1429 8.25C5.54616 8.25 4.97387 8.01295 4.55191 7.59099C4.12995 7.16903 3.8929 6.59674 3.8929 6C3.8929 5.40326 4.12995 4.83097 4.55191 4.40901C4.97387 3.98705 5.54616 3.75 6.1429 3.75C6.73964 3.75 7.31193 3.98705 7.73389 4.40901C8.15585 4.83097 8.3929 5.40326 8.3929 6C8.3929 6.59674 8.15585 7.16903 7.73389 7.59099C7.31193 8.01295 6.73964 8.25 6.1429 8.25ZM6.1429 7.25C6.47442 7.25 6.79236 7.1183 7.02678 6.88388C7.2612 6.64946 7.3929 6.33152 7.3929 6C7.3929 5.66848 7.2612 5.35054 7.02678 5.11612C6.79236 4.8817 6.47442 4.75 6.1429 4.75C5.81138 4.75 5.49344 4.8817 5.25902 5.11612C5.02459 5.35054 4.8929 5.66848 4.8929 6C4.8929 6.33152 5.02459 6.64946 5.25902 6.88388C5.49344 7.1183 5.81138 7.25 6.1429 7.25Z" fill="white"></path>
            </svg> 676.5k
          </div> 
          <div class="bg-base-white/25 rounded-6 py-2 px-4 text-base-white text-10 font-semibold">CH.96</div>
        </div>
      </div>
    </div>
  </div>
</a>
  `;

  try {
    // Scrape dari HTML string
    console.log('\n📚 Scrape dari HTML sample (Card Layout)\n');
    const manhwaList = await scraper.scrapeFromHTML(sampleHTML);
    
    // Simpan ke JSON
    await scraper.saveToJSON(manhwaList, 'manhwa-card-layout.json');
    
    // Generate summary
    const summary = scraper.generateSummary(manhwaList);
    await scraper.saveToJSON(summary, 'manhwa-card-summary.json');
    
    // Tampilkan hasil
    console.log('\n📊 Hasil Scraping:');
    console.log(`   Total Manhwa: ${manhwaList.length}\n`);
    
    manhwaList.forEach((manhwa, idx) => {
      console.log(`${idx + 1}. ${manhwa.title}`);
      console.log(`   URL: ${manhwa.url}`);
      console.log(`   Status: ${manhwa.status}`);
      console.log(`   Views: ${manhwa.views} 👁️`);
      console.log(`   Latest: ${manhwa.latestChapter}`);
      console.log(`   Updated: ${manhwa.updateTime} ago\n`);
    });

    console.log('='.repeat(60));
    console.log('✅ Scraping selesai!');
    console.log('📁 Hasil tersimpan di folder: data/');
    console.log('='.repeat(60));
    console.log('\n💡 Cara Menggunakan:');
    console.log('   1. Buka https://07.shinigami.asia di browser');
    console.log('   2. Klik kanan → Inspect → Copy HTML dari card manhwa');
    console.log('   3. Paste HTML ke variable sampleHTML di file ini');
    console.log('   4. Jalankan: node shinigami-scraper-card.js\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

main().catch(console.error);

export default ShinigamiScraperCard;
