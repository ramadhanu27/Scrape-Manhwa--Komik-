import ManhwaScraper from './scraper.js';

/**
 * File test untuk mencoba scraper dengan website spesifik
 * Ganti URL dan selector sesuai dengan website target Anda
 */

async function testScraper() {
  console.log('🧪 Testing Manhwa Scraper\n');

  // KONFIGURASI - Ganti dengan website target Anda
  const config = {
    baseUrl: 'https://your-manhwa-site.com',
    manhwaUrl: 'https://your-manhwa-site.com/manga/your-manhwa-title',
    manhwaTitle: 'Your Manhwa Title'
  };

  const scraper = new ManhwaScraper(config.baseUrl);

  try {
    // Test 1: Ambil info manhwa
    console.log('📋 Test 1: Mengambil info manhwa...');
    const info = await scraper.getManhwaInfo(config.manhwaUrl);
    
    if (info) {
      console.log('✅ Berhasil mengambil info:');
      console.log(`   Judul: ${info.title}`);
      console.log(`   Author: ${info.author}`);
      console.log(`   Status: ${info.status}`);
      console.log(`   Genre: ${info.genres.join(', ')}`);
      console.log(`   Deskripsi: ${info.description.substring(0, 100)}...`);
    } else {
      console.log('❌ Gagal mengambil info manhwa');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Ambil daftar chapter
    console.log('📋 Test 2: Mengambil daftar chapter...');
    const chapters = await scraper.getChapterList(config.manhwaUrl);
    
    if (chapters.length > 0) {
      console.log(`✅ Ditemukan ${chapters.length} chapter`);
      console.log('   Chapter pertama:', chapters[0].title);
      console.log('   URL:', chapters[0].url);
      
      if (chapters.length > 1) {
        console.log('   Chapter terakhir:', chapters[chapters.length - 1].title);
      }
    } else {
      console.log('❌ Tidak ada chapter ditemukan');
      console.log('⚠️  Periksa CSS selector di fungsi getChapterList()');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Ambil gambar dari chapter pertama (tanpa download)
    if (chapters.length > 0) {
      console.log('📋 Test 3: Mengambil gambar dari chapter pertama...');
      const images = await scraper.getChapterImages(chapters[0].url);
      
      if (images.length > 0) {
        console.log(`✅ Ditemukan ${images.length} gambar`);
        console.log('   Gambar pertama:', images[0].url);
      } else {
        console.log('❌ Tidak ada gambar ditemukan');
        console.log('⚠️  Periksa CSS selector di fungsi getChapterImages()');
      }
    }

    console.log('\n' + '='.repeat(50) + '\n');
    console.log('✅ Test selesai!');
    console.log('\n💡 Jika semua test berhasil, Anda bisa menjalankan:');
    console.log('   await scraper.downloadManhwa(manhwaUrl, manhwaTitle, 1, 1)');
    console.log('   untuk download chapter pertama sebagai test.\n');

  } catch (error) {
    console.error('❌ Error saat testing:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Pastikan URL website benar');
    console.log('   2. Periksa koneksi internet');
    console.log('   3. Website mungkin memblokir scraping');
    console.log('   4. Sesuaikan CSS selector dengan struktur HTML website\n');
  }
}

// Jalankan test
testScraper().catch(console.error);
