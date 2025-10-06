import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';

async function debugScraper() {
  console.log('🔍 Debug Scraper - Melihat struktur HTML\n');
  
  const url = 'https://07.shinigami.asia/search';
  
  try {
    console.log(`📥 Mengambil halaman: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 30000
    });
    
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Simpan HTML untuk inspeksi
    await fs.writeFile('debug-html.html', html);
    console.log('✅ HTML disimpan ke: debug-html.html\n');
    
    // Test berbagai selector
    console.log('📊 Testing Selectors:\n');
    
    console.log('1. Mencari judul dengan class "text-16 font-medium text-base-white line-clamp-2":');
    const titles1 = $('.text-16.font-medium.text-base-white.line-clamp-2');
    console.log(`   Ditemukan: ${titles1.length} elemen`);
    titles1.slice(0, 3).each((i, el) => {
      console.log(`   ${i + 1}. ${$(el).text().trim()}`);
    });
    
    console.log('\n2. Mencari link dengan href="/series/":');
    const links1 = $('a[href*="/series/"]');
    console.log(`   Ditemukan: ${links1.length} elemen`);
    links1.slice(0, 3).each((i, el) => {
      console.log(`   ${i + 1}. ${$(el).attr('href')}`);
    });
    
    console.log('\n3. Mencari div dengan class "grid":');
    const grids = $('.grid');
    console.log(`   Ditemukan: ${grids.length} elemen`);
    
    console.log('\n4. Mencari semua link (a tag):');
    const allLinks = $('a');
    console.log(`   Total links: ${allLinks.length}`);
    
    console.log('\n5. Mencari gambar (img tag):');
    const images = $('img');
    console.log(`   Total images: ${images.length}`);
    images.slice(0, 3).each((i, el) => {
      console.log(`   ${i + 1}. ${$(el).attr('src')}`);
    });
    
    console.log('\n6. Mencari text "Chapter":');
    const chapters = $('*:contains("Chapter")');
    console.log(`   Ditemukan: ${chapters.length} elemen`);
    
    console.log('\n7. Struktur body:');
    const bodyChildren = $('body').children();
    console.log(`   Body memiliki ${bodyChildren.length} child elements`);
    bodyChildren.slice(0, 5).each((i, el) => {
      console.log(`   ${i + 1}. <${el.tagName}> class="${$(el).attr('class') || 'none'}"`);
    });
    
    console.log('\n8. Cek apakah ada script atau noscript:');
    const scripts = $('script');
    const noscripts = $('noscript');
    console.log(`   Scripts: ${scripts.length}`);
    console.log(`   Noscripts: ${noscripts.length}`);
    
    console.log('\n9. Cek meta tags:');
    const title = $('title').text();
    console.log(`   Page Title: ${title}`);
    
    console.log('\n10. Sample HTML dari body (first 1000 chars):');
    const bodyHtml = $('body').html();
    console.log(bodyHtml ? bodyHtml.substring(0, 1000) : 'Body kosong');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugScraper();
