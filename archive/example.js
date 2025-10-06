import ManhwaScraper from './scraper.js';

/**
 * CONTOH PENGGUNAAN SCRAPER
 * 
 * File ini berisi contoh-contoh cara menggunakan manhwa scraper.
 * Ganti URL dengan website manhwa yang ingin Anda scrape.
 */

async function runExample() {
  console.log('🎨 MANHWA SCRAPER - Contoh Penggunaan\n');
  console.log('='.repeat(60));

  // ========================================
  // KONFIGURASI
  // ========================================
  
  // Ganti dengan URL website manhwa target
  const config = {
    baseUrl: 'https://asuracomic.net',  // Contoh website
    manhwaUrl: 'https://asuracomic.net/series/solo-leveling-123456',
    manhwaTitle: 'Solo Leveling'
  };

  // Inisialisasi scraper
  const scraper = new ManhwaScraper(config.baseUrl);

  // ========================================
  // CONTOH 1: Ambil Info Manhwa
  // ========================================
  
  console.log('\n📚 CONTOH 1: Mengambil Info Manhwa');
  console.log('-'.repeat(60));
  
  try {
    const info = await scraper.getManhwaInfo(config.manhwaUrl);
    
    if (info) {
      console.log('✅ Berhasil!');
      console.log(`\n📖 Judul: ${info.title}`);
      console.log(`✍️  Author: ${info.author}`);
      console.log(`📊 Status: ${info.status}`);
      console.log(`🏷️  Genre: ${info.genres.join(', ')}`);
      console.log(`📝 Deskripsi:\n   ${info.description.substring(0, 200)}...`);
    } else {
      console.log('❌ Gagal mengambil info');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // ========================================
  // CONTOH 2: Ambil Daftar Chapter
  // ========================================
  
  console.log('\n\n📚 CONTOH 2: Mengambil Daftar Chapter');
  console.log('-'.repeat(60));
  
  try {
    const chapters = await scraper.getChapterList(config.manhwaUrl);
    
    if (chapters.length > 0) {
      console.log(`✅ Ditemukan ${chapters.length} chapter\n`);
      
      // Tampilkan 5 chapter pertama
      console.log('📋 5 Chapter Pertama:');
      chapters.slice(0, 5).forEach((ch, idx) => {
        console.log(`   ${idx + 1}. ${ch.title}`);
      });
      
      // Tampilkan 5 chapter terakhir
      if (chapters.length > 5) {
        console.log('\n📋 5 Chapter Terakhir:');
        chapters.slice(-5).forEach((ch, idx) => {
          console.log(`   ${chapters.length - 4 + idx}. ${ch.title}`);
        });
      }
    } else {
      console.log('❌ Tidak ada chapter ditemukan');
      console.log('💡 Tip: Periksa CSS selector di fungsi getChapterList()');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // ========================================
  // CONTOH 3: Preview Gambar Chapter
  // ========================================
  
  console.log('\n\n📚 CONTOH 3: Preview Gambar dari Chapter Pertama');
  console.log('-'.repeat(60));
  
  try {
    const chapters = await scraper.getChapterList(config.manhwaUrl);
    
    if (chapters.length > 0) {
      const firstChapter = chapters[0];
      console.log(`📖 Chapter: ${firstChapter.title}`);
      console.log(`🔗 URL: ${firstChapter.url}\n`);
      
      const images = await scraper.getChapterImages(firstChapter.url);
      
      if (images.length > 0) {
        console.log(`✅ Ditemukan ${images.length} gambar\n`);
        
        // Tampilkan 3 URL gambar pertama
        console.log('🖼️  Preview URL Gambar:');
        images.slice(0, 3).forEach((img, idx) => {
          console.log(`   ${idx + 1}. ${img.url}`);
        });
        
        if (images.length > 3) {
          console.log(`   ... dan ${images.length - 3} gambar lainnya`);
        }
      } else {
        console.log('❌ Tidak ada gambar ditemukan');
        console.log('💡 Tip: Periksa CSS selector di fungsi getChapterImages()');
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // ========================================
  // CONTOH 4: Download 1 Chapter (Commented)
  // ========================================
  
  console.log('\n\n📚 CONTOH 4: Download Chapter');
  console.log('-'.repeat(60));
  console.log('⚠️  Uncomment kode di bawah untuk mendownload chapter\n');
  
  /*
  // Download chapter 1 saja sebagai test
  await scraper.downloadManhwa(
    config.manhwaUrl,
    config.manhwaTitle,
    1,  // chapter awal
    1   // chapter akhir
  );
  */

  // ========================================
  // CONTOH 5: Download Multiple Chapters (Commented)
  // ========================================
  
  console.log('\n📚 CONTOH 5: Download Multiple Chapters');
  console.log('-'.repeat(60));
  console.log('⚠️  Uncomment kode di bawah untuk mendownload chapter 1-5\n');
  
  /*
  // Download chapter 1-5
  await scraper.downloadManhwa(
    config.manhwaUrl,
    config.manhwaTitle,
    1,   // chapter awal
    5    // chapter akhir
  );
  */

  // ========================================
  // CONTOH 6: Download Semua Chapter (Commented)
  // ========================================
  
  console.log('\n📚 CONTOH 6: Download Semua Chapter');
  console.log('-'.repeat(60));
  console.log('⚠️  Uncomment kode di bawah untuk mendownload semua chapter\n');
  
  /*
  // Download semua chapter (hati-hati, bisa memakan waktu lama!)
  await scraper.downloadManhwa(
    config.manhwaUrl,
    config.manhwaTitle
  );
  */

  // ========================================
  // SELESAI
  // ========================================
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Contoh selesai dijalankan!');
  console.log('\n💡 Langkah Selanjutnya:');
  console.log('   1. Ganti config.baseUrl dan config.manhwaUrl dengan website target');
  console.log('   2. Jalankan: node example.js');
  console.log('   3. Jika selector tidak cocok, sesuaikan di scraper.js');
  console.log('   4. Uncomment contoh 4, 5, atau 6 untuk mulai download');
  console.log('   5. Hasil download akan tersimpan di folder: downloads/');
  console.log('='.repeat(60) + '\n');
}

// Jalankan contoh
runExample().catch(error => {
  console.error('\n❌ Error fatal:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   - Pastikan URL website benar');
  console.log('   - Periksa koneksi internet');
  console.log('   - Website mungkin memblokir scraping');
  console.log('   - Sesuaikan CSS selector dengan struktur HTML website\n');
});
