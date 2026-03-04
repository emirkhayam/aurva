// Temporary scraper script to extract news from aurva.kg
// Run this in browser console on https://aurva.kg/news page after it loads

// Wait for feed to load, then extract data
setTimeout(() => {
  const newsData = [];

  // Find all news articles in the feed
  const articles = document.querySelectorAll('.t-feed__post');

  articles.forEach((article, index) => {
    try {
      const titleEl = article.querySelector('.t-feed__post-title');
      const descrEl = article.querySelector('.t-feed__post-descr');
      const imageEl = article.querySelector('.t-feed__post-img img, .t-bgimg');
      const dateEl = article.querySelector('.t-feed__post-date');
      const linkEl = article.querySelector('a[href*="post"]');

      const newsItem = {
        title: titleEl ? titleEl.textContent.trim() : '',
        excerpt: descrEl ? descrEl.textContent.trim() : '',
        imageUrl: imageEl ? (imageEl.src || imageEl.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] || '') : '',
        date: dateEl ? dateEl.textContent.trim() : '',
        link: linkEl ? linkEl.href : '',
        index: index + 1
      };

      if (newsItem.title) {
        newsData.push(newsItem);
      }
    } catch (e) {
      console.error('Error parsing article:', e);
    }
  });

  console.log('Found articles:', newsData.length);
  console.log('Copy this JSON:');
  console.log(JSON.stringify(newsData, null, 2));

  // Also try to download and copy to clipboard
  const dataStr = JSON.stringify(newsData, null, 2);
  navigator.clipboard.writeText(dataStr).then(() => {
    console.log('✅ Copied to clipboard!');
  }).catch(err => {
    console.log('❌ Could not copy to clipboard, please copy manually from console');
  });
}, 3000);

console.log('⏳ Waiting for page to load completely...');
