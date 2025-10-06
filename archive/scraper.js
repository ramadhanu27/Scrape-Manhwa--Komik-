import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManhwaScraper {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.outputDir = path.join(__dirname, 'downloads');
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': baseUrl
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
   * Mengambil daftar chapter dari halaman manhwa
   */
  async getChapterList(manhwaUrl) {
    try {
      const html = await this.fetchPage(manhwaUrl);
      const $ = cheerio.load(html);
      const chapters = [];

      // Contoh selector - sesuaikan dengan struktur website target
      // Ini adalah contoh umum, Anda perlu menyesuaikan dengan website spesifik
      $('.chapter-list a, .chapter-item a, .wp-manga-chapter a').each((i, elem) => {
        const title = $(elem).text().trim();
        const url = $(elem).attr('href');
        
        if (url && title) {
          chapters.push({
            title: title,
            url: url.startsWith('http') ? url : new URL(url, this.baseUrl).href,
            number: i + 1
          });
        }
      });

      console.log(`✅ Ditemukan ${chapters.length} chapter`);
      return chapters;
    } catch (error) {
      console.error(`❌ Error mengambil daftar chapter: ${error.message}`);
      throw error;
    }
  }

  /**
   * Mengambil semua gambar dari sebuah chapter
   */
  async getChapterImages(chapterUrl) {
    try {
      const html = await this.fetchPage(chapterUrl);
      const $ = cheerio.load(html);
      const images = [];

      // Contoh selector untuk gambar - sesuaikan dengan website target
      $('.reading-content img, .chapter-content img, .page-break img, #readerarea img').each((i, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
        
        if (src && !src.includes('logo') && !src.includes('icon')) {
          const imageUrl = src.startsWith('http') ? src : new URL(src, this.baseUrl).href;
          images.push({
            url: imageUrl,
            index: i + 1
          });
        }
      });

      console.log(`  📸 Ditemukan ${images.length} gambar`);
      return images;
    } catch (error) {
      console.error(`  ❌ Error mengambil gambar chapter: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download gambar
   */
  async downloadImage(imageUrl, outputPath) {
    try {
      const response = await axios.get(imageUrl, {
        headers: this.headers,
        responseType: 'arraybuffer',
        timeout: 60000
      });

      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, response.data);
      return true;
    } catch (error) {
      console.error(`    ❌ Error download gambar: ${error.message}`);
      return false;
    }
  }

  /**
   * Download satu chapter lengkap
   */
  async downloadChapter(chapter, manhwaTitle) {
    console.log(`\n📖 Mendownload: ${chapter.title}`);
    
    try {
      const images = await this.getChapterImages(chapter.url);
      
      if (images.length === 0) {
        console.log(`  ⚠️  Tidak ada gambar ditemukan`);
        return { success: false, downloaded: 0, total: 0 };
      }

      // Buat folder untuk chapter
      const chapterFolder = path.join(
        this.outputDir,
        this.sanitizeFilename(manhwaTitle),
        this.sanitizeFilename(chapter.title)
      );
      await fs.ensureDir(chapterFolder);

      let downloaded = 0;
      for (const image of images) {
        const ext = path.extname(new URL(image.url).pathname) || '.jpg';
        const filename = `page_${String(image.index).padStart(3, '0')}${ext}`;
        const outputPath = path.join(chapterFolder, filename);

        // Skip jika sudah ada
        if (await fs.pathExists(outputPath)) {
          console.log(`    ⏭️  Skip: ${filename} (sudah ada)`);
          downloaded++;
          continue;
        }

        console.log(`    ⬇️  Downloading: ${filename}`);
        const success = await this.downloadImage(image.url, outputPath);
        
        if (success) {
          downloaded++;
          console.log(`    ✅ Berhasil: ${filename}`);
        }

        // Delay untuk menghindari rate limiting
        await this.delay(1000);
      }

      console.log(`  ✅ Chapter selesai: ${downloaded}/${images.length} gambar`);
      return { success: true, downloaded, total: images.length };
    } catch (error) {
      console.error(`  ❌ Error download chapter: ${error.message}`);
      return { success: false, downloaded: 0, total: 0 };
    }
  }

  /**
   * Download seluruh manhwa
   */
  async downloadManhwa(manhwaUrl, manhwaTitle, startChapter = 1, endChapter = null) {
    console.log(`\n🚀 Memulai scraping manhwa: ${manhwaTitle}`);
    console.log(`📍 URL: ${manhwaUrl}\n`);

    try {
      const chapters = await this.getChapterList(manhwaUrl);
      
      if (chapters.length === 0) {
        console.log('❌ Tidak ada chapter ditemukan!');
        return;
      }

      // Filter chapter berdasarkan range
      const chaptersToDownload = chapters.filter((ch, idx) => {
        const chapterNum = idx + 1;
        return chapterNum >= startChapter && (endChapter === null || chapterNum <= endChapter);
      });

      console.log(`📚 Akan mendownload ${chaptersToDownload.length} chapter (dari ${startChapter} sampai ${endChapter || chapters.length})\n`);

      let totalSuccess = 0;
      let totalFailed = 0;

      for (const chapter of chaptersToDownload) {
        const result = await this.downloadChapter(chapter, manhwaTitle);
        
        if (result.success) {
          totalSuccess++;
        } else {
          totalFailed++;
        }

        // Delay antar chapter
        await this.delay(2000);
      }

      console.log(`\n${'='.repeat(50)}`);
      console.log(`✅ SELESAI!`);
      console.log(`📊 Berhasil: ${totalSuccess} chapter`);
      console.log(`❌ Gagal: ${totalFailed} chapter`);
      console.log(`📁 Lokasi: ${path.join(this.outputDir, this.sanitizeFilename(manhwaTitle))}`);
      console.log(`${'='.repeat(50)}\n`);

    } catch (error) {
      console.error(`❌ Error fatal: ${error.message}`);
    }
  }

  /**
   * Sanitize filename untuk Windows
   */
  sanitizeFilename(filename) {
    return filename
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 200);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Scrape informasi manhwa (judul, deskripsi, dll)
   */
  async getManhwaInfo(manhwaUrl) {
    try {
      const html = await this.fetchPage(manhwaUrl);
      const $ = cheerio.load(html);

      const info = {
        title: $('.post-title h1, .entry-title, .manga-title').first().text().trim() || 'Unknown',
        description: $('.summary__content p, .description, .manga-excerpt').first().text().trim() || '',
        author: $('.author-content, .manga-author').first().text().trim() || 'Unknown',
        status: $('.summary-content:contains("Status") + .summary-content, .manga-status').first().text().trim() || 'Unknown',
        genres: []
      };

      $('.genres-content a, .manga-genre a').each((i, elem) => {
        info.genres.push($(elem).text().trim());
      });

      return info;
    } catch (error) {
      console.error(`❌ Error mengambil info manhwa: ${error.message}`);
      return null;
    }
  }
}

// ============================================
// CONTOH PENGGUNAAN
// ============================================

async function main() {
  // Ganti dengan URL website manhwa yang ingin di-scrape
  const baseUrl = 'https://example-manhwa-site.com';
  
  // Inisialisasi scraper
  const scraper = new ManhwaScraper(baseUrl);

  // Contoh 1: Scrape informasi manhwa
  console.log('='.repeat(50));
  console.log('MANHWA SCRAPER - Contoh Penggunaan');
  console.log('='.repeat(50));
  console.log('\n⚠️  PENTING: Edit file ini dan ganti URL dengan website manhwa yang valid!\n');

  // Contoh URL manhwa (ganti dengan URL asli)
  const manhwaUrl = 'https://example-manhwa-site.com/manga/solo-leveling';
  const manhwaTitle = 'Solo Leveling';

  // Uncomment untuk menjalankan:
  
  // // Ambil info manhwa
  // const info = await scraper.getManhwaInfo(manhwaUrl);
  // if (info) {
  //   console.log('📚 Info Manhwa:');
  //   console.log(`   Judul: ${info.title}`);
  //   console.log(`   Author: ${info.author}`);
  //   console.log(`   Status: ${info.status}`);
  //   console.log(`   Genre: ${info.genres.join(', ')}`);
  //   console.log(`   Deskripsi: ${info.description.substring(0, 200)}...`);
  // }

  // // Download chapter 1-5
  // await scraper.downloadManhwa(manhwaUrl, manhwaTitle, 1, 5);

  // // Atau download semua chapter
  // // await scraper.downloadManhwa(manhwaUrl, manhwaTitle);

  console.log('💡 Tips:');
  console.log('   1. Buka file scraper.js');
  console.log('   2. Ganti baseUrl dan manhwaUrl dengan website target');
  console.log('   3. Sesuaikan CSS selector di fungsi getChapterList() dan getChapterImages()');
  console.log('   4. Uncomment kode di fungsi main() untuk menjalankan');
  console.log('   5. Jalankan: npm start\n');
}

// Jalankan program
main().catch(console.error);

export default ManhwaScraper;
