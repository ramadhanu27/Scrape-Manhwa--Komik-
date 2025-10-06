import ShinigamiScraperCard from './shinigami-scraper-card.js';
import fs from 'fs-extra';

async function main() {
  console.log('='.repeat(60));
  console.log('SHINIGAMI SCRAPER - Scrape dari File HTML');
  console.log('='.repeat(60));

  const scraper = new ShinigamiScraperCard();

  // Cek apakah ada argument file
  const args = process.argv.slice(2);
  let htmlFile = args[0] || 'page.html'; // Default: page.html

  console.log(`\n📂 Membaca file: ${htmlFile}`);

  try {
    // Baca file HTML
    if (!await fs.pathExists(htmlFile)) {
      console.error(`\n❌ File tidak ditemukan: ${htmlFile}`);
      console.log('\n💡 Cara menggunakan:');
      console.log('   1. Buka https://07.shinigami.asia di browser');
      console.log('   2. Klik kanan → Save Page As → page.html');
      console.log('   3. Simpan di folder yang sama dengan script ini');
      console.log('   4. Jalankan: node scrape-from-file.js page.html\n');
      return;
    }

    const htmlContent = await fs.readFile(htmlFile, 'utf-8');
    console.log(`✅ File berhasil dibaca (${htmlContent.length} karakter)\n`);

    // Scrape
    console.log('📥 Parsing HTML...');
    const manhwaList = await scraper.scrapeFromHTML(htmlContent);
    
    if (manhwaList.length === 0) {
      console.log('\n⚠️  Tidak ada manhwa yang ditemukan!');
      console.log('💡 Pastikan file HTML berisi element:');
      console.log('   <div class="grid mb-24 xl:grid-cols-6 lg:grid-cols-4 grid-cols-3 gap-4">');
      console.log('   dengan tag <a href="/series/..."> di dalamnya\n');
      return;
    }

    console.log(`✅ Berhasil scrape ${manhwaList.length} manhwa!\n`);
    
    // Simpan ke JSON
    await scraper.saveToJSON(manhwaList, 'manhwa-all.json');
    
    // Generate summary
    const summary = scraper.generateSummary(manhwaList);
    await scraper.saveToJSON(summary, 'manhwa-all-summary.json');
    
    // Tampilkan hasil
    console.log('📊 Hasil Scraping:\n');
    manhwaList.forEach((manhwa, idx) => {
      console.log(`${idx + 1}. ${manhwa.title}`);
      console.log(`   Views: ${manhwa.views} | Chapter: ${manhwa.latestChapter} | Updated: ${manhwa.updateTime} ago`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Selesai! ${manhwaList.length} manhwa tersimpan di:`);
    console.log('   📁 data/manhwa-all.json');
    console.log('   📁 data/manhwa-all-summary.json');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  }
}

main().catch(console.error);
