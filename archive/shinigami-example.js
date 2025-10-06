import ShinigamiScraper from './shinigami-scraper.js';

/**
 * CONTOH LENGKAP PENGGUNAAN SHINIGAMI SCRAPER
 * File ini berisi berbagai contoh cara menggunakan scraper
 */

async function example1_ScrapeSinglePage() {
  console.log('\n' + '='.repeat(60));
  console.log('📚 CONTOH 1: Scrape Satu Halaman');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraper();
  
  // Scrape halaman search
  const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');
  
  // Simpan ke JSON
  await scraper.saveToJSON(manhwaList, 'manhwa-list-page1.json');
  
  // Tampilkan 5 manhwa pertama
  console.log('\n📋 5 Manhwa Pertama:');
  manhwaList.slice(0, 5).forEach((manhwa, idx) => {
    console.log(`\n${idx + 1}. ${manhwa.title}`);
    console.log(`   Status: ${manhwa.status}`);
    console.log(`   Rating: ${manhwa.rating} ⭐`);
    console.log(`   Views: ${manhwa.views} 👁️`);
    console.log(`   Latest: ${manhwa.latestChapter}`);
  });
  
  return manhwaList;
}

async function example2_ScrapeMultiplePages() {
  console.log('\n' + '='.repeat(60));
  console.log('📚 CONTOH 2: Scrape Multiple Pages (Pagination)');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraper();
  
  // Scrape 3 halaman
  const allManhwa = await scraper.scrapeWithPagination('https://07.shinigami.asia/search', 3);
  
  // Simpan ke JSON
  await scraper.saveToJSON(allManhwa, 'manhwa-list-all-pages.json');
  
  // Generate dan simpan summary
  const summary = scraper.generateSummary(allManhwa);
  await scraper.saveToJSON(summary, 'manhwa-summary.json');
  
  console.log('\n📊 Summary:');
  console.log(`   Total Manhwa: ${summary.totalManhwa}`);
  console.log(`   By Status:`, summary.byStatus);
  console.log(`\n🏆 Top 5 Rated:`);
  summary.topRated.slice(0, 5).forEach((m, idx) => {
    console.log(`   ${idx + 1}. ${m.title} - ${m.rating}⭐`);
  });
  
  return allManhwa;
}

async function example3_ScrapeDetailManhwa() {
  console.log('\n' + '='.repeat(60));
  console.log('📚 CONTOH 3: Scrape Detail Manhwa');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraper();
  
  // Ambil list dulu
  const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');
  
  if (manhwaList.length > 0) {
    // Ambil detail manhwa pertama
    const firstManhwa = manhwaList[0];
    console.log(`\n📖 Mengambil detail: ${firstManhwa.title}`);
    
    const detail = await scraper.scrapeManhwaDetail(firstManhwa.url);
    
    // Simpan ke JSON
    const filename = `manhwa-detail-${scraper.sanitizeFilename(detail.title)}.json`;
    await scraper.saveToJSON(detail, filename);
    
    // Tampilkan info
    console.log(`\n✅ Detail Manhwa:`);
    console.log(`   Judul: ${detail.title}`);
    console.log(`   Author: ${detail.author}`);
    console.log(`   Status: ${detail.status}`);
    console.log(`   Rating: ${detail.rating}⭐`);
    console.log(`   Views: ${detail.views}👁️`);
    console.log(`   Total Chapters: ${detail.totalChapters}`);
    console.log(`   Genres: ${detail.genres.join(', ')}`);
    console.log(`   Deskripsi: ${detail.description.substring(0, 100)}...`);
    
    return detail;
  }
}

async function example4_ScrapeChapterImages() {
  console.log('\n' + '='.repeat(60));
  console.log('📚 CONTOH 4: Scrape Gambar Chapter');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraper();
  
  // Ambil list manhwa
  const manhwaList = await scraper.scrapeManhwaList('https://07.shinigami.asia/search');
  
  if (manhwaList.length > 0) {
    // Ambil detail manhwa pertama
    const firstManhwa = manhwaList[0];
    const detail = await scraper.scrapeManhwaDetail(firstManhwa.url);
    
    if (detail.chapters.length > 0) {
      // Ambil gambar dari chapter pertama
      const firstChapter = detail.chapters[0];
      console.log(`\n📖 Mengambil gambar dari: ${firstChapter.title}`);
      
      const images = await scraper.scrapeChapterImages(firstChapter.url);
      
      // Buat data chapter
      const chapterData = {
        manhwa: detail.title,
        chapter: firstChapter.title,
        url: firstChapter.url,
        images: images,
        totalImages: images.length,
        scrapedAt: new Date().toISOString()
      };
      
      // Simpan ke JSON
      await scraper.saveToJSON(chapterData, 'chapter-images.json');
      
      console.log(`\n✅ Ditemukan ${images.length} gambar`);
      console.log(`\n🖼️  Preview 3 gambar pertama:`);
      images.slice(0, 3).forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.url}`);
      });
      
      return chapterData;
    }
  }
}

async function example5_ScrapeSpecificManhwa() {
  console.log('\n' + '='.repeat(60));
  console.log('📚 CONTOH 5: Scrape Manhwa Spesifik dengan URL');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraper();
  
  // Ganti dengan URL manhwa yang ingin di-scrape
  const manhwaUrl = 'https://07.shinigami.asia/series/05bbcbc4-56a6-47e6-ac36-1d482339a322/';
  
  console.log(`\n📖 Scraping: ${manhwaUrl}`);
  const detail = await scraper.scrapeManhwaDetail(manhwaUrl);
  
  // Simpan detail
  const filename = `manhwa-${scraper.sanitizeFilename(detail.title)}.json`;
  await scraper.saveToJSON(detail, filename);
  
  console.log(`\n✅ Berhasil scrape: ${detail.title}`);
  console.log(`   Total Chapters: ${detail.totalChapters}`);
  
  // Scrape semua chapter (hati-hati, bisa lama!)
  /*
  console.log('\n📥 Scraping semua chapter images...');
  const allChapterData = [];
  
  for (let i = 0; i < Math.min(3, detail.chapters.length); i++) {
    const chapter = detail.chapters[i];
    console.log(`\n  📖 Chapter ${i + 1}/${detail.chapters.length}: ${chapter.title}`);
    
    const images = await scraper.scrapeChapterImages(chapter.url);
    allChapterData.push({
      chapter: chapter.title,
      url: chapter.url,
      images: images,
      totalImages: images.length
    });
    
    await scraper.delay(2000); // Delay antar chapter
  }
  
  // Simpan semua data chapter
  await scraper.saveToJSON({
    manhwa: detail.title,
    chapters: allChapterData,
    scrapedAt: new Date().toISOString()
  }, `manhwa-all-chapters-${scraper.sanitizeFilename(detail.title)}.json`);
  */
  
  return detail;
}

async function example6_FilterAndExport() {
  console.log('\n' + '='.repeat(60));
  console.log('📚 CONTOH 6: Filter dan Export Data');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraper();
  
  // Scrape multiple pages
  const allManhwa = await scraper.scrapeWithPagination('https://07.shinigami.asia/search', 2);
  
  // Filter: Hanya manhwa dengan rating > 8
  const highRated = allManhwa.filter(m => parseFloat(m.rating) > 8);
  await scraper.saveToJSON(highRated, 'manhwa-high-rated.json');
  console.log(`\n⭐ Manhwa dengan rating > 8: ${highRated.length}`);
  
  // Filter: Hanya manhwa Ongoing
  const ongoing = allManhwa.filter(m => m.status === 'Ongoing');
  await scraper.saveToJSON(ongoing, 'manhwa-ongoing.json');
  console.log(`📖 Manhwa Ongoing: ${ongoing.length}`);
  
  // Filter: Manhwa dengan views > 1M
  const popular = allManhwa.filter(m => {
    const views = scraper.parseViews(m.views);
    return views > 1000000;
  });
  await scraper.saveToJSON(popular, 'manhwa-popular.json');
  console.log(`🔥 Manhwa dengan views > 1M: ${popular.length}`);
  
  // Export ke CSV format (sebagai array of objects)
  const csvData = allManhwa.map(m => ({
    Title: m.title,
    Status: m.status,
    Rating: m.rating,
    Views: m.views,
    LatestChapter: m.latestChapter,
    URL: m.url
  }));
  await scraper.saveToJSON(csvData, 'manhwa-export-csv-format.json');
  console.log(`📊 Export CSV format: ${csvData.length} items`);
}

// ============================================
// MAIN FUNCTION - Pilih contoh yang ingin dijalankan
// ============================================

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🎨 SHINIGAMI SCRAPER - Contoh Penggunaan');
  console.log('='.repeat(60));
  console.log('\n💡 Uncomment contoh yang ingin dijalankan di fungsi main()');
  console.log('   atau jalankan semua contoh sekaligus\n');

  try {
    // Jalankan contoh yang diinginkan (uncomment untuk menggunakan)
    
    // Contoh 1: Scrape satu halaman
    await example1_ScrapeSinglePage();
    
    // Contoh 2: Scrape multiple pages dengan pagination
    // await example2_ScrapeMultiplePages();
    
    // Contoh 3: Scrape detail manhwa
    // await example3_ScrapeDetailManhwa();
    
    // Contoh 4: Scrape gambar chapter
    // await example4_ScrapeChapterImages();
    
    // Contoh 5: Scrape manhwa spesifik dengan URL
    // await example5_ScrapeSpecificManhwa();
    
    // Contoh 6: Filter dan export data
    // await example6_FilterAndExport();

    console.log('\n' + '='.repeat(60));
    console.log('✅ SELESAI!');
    console.log('📁 Semua hasil tersimpan di folder: data/');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Jalankan program
main().catch(console.error);
