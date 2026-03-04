import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

// Direct fetch without DNS issues
function fetchWithCustomAgent(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'ru-RU,ru;q=0.9',
        'Referer': 'https://aurva.kg/'
      },
      timeout: 30000
    };

    const protocol = url.startsWith('https') ? https : http;

    const req = protocol.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          reject(new Error('Failed to parse JSON'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function directFetch() {
  console.log('🚀 Direct Fetch AURVA News\n');
  console.log('═══════════════════════════════════════════\n');

  try {
    const feedUrl = 'https://feed.tildacdn.com/api/getfeed/?feeduid=390736647451&size=100&sort[date]=desc';

    console.log('📡 Fetching from Tilda API...');
    console.log('🔗 URL:', feedUrl, '\n');

    const data = await fetchWithCustomAgent(feedUrl);

    if (!data.posts || data.posts.length === 0) {
      throw new Error('No posts found in response');
    }

    console.log(`✅ Success! Found ${data.posts.length} news articles\n`);

    // Save to file
    const outputPath = path.join(process.cwd(), 'aurva-news-manual.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

    console.log('💾 Saved to:', outputPath);
    console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);

    console.log('═══════════════════════════════════════════');
    console.log('✅ SUCCESS!');
    console.log('═══════════════════════════════════════════');
    console.log('📋 Next step: npm run import:manual\n');

    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.log('\n═══════════════════════════════════════════');
    console.log('🔄 Alternative: Manual Browser Method');
    console.log('═══════════════════════════════════════════');
    console.log('1. Open: https://aurva.kg/news');
    console.log('2. Press F12 → Console tab');
    console.log('3. Type: allow pasting (to bypass warning)');
    console.log('4. Paste the fetch code');
    console.log('5. File will download automatically\n');

    process.exit(1);
  }
}

directFetch();
