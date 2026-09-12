const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('api') || url.includes('graphql') || url.includes('dhruvii')) {
      try {
        const text = await response.text();
        if (text.includes('197') || text.includes('120') || text.includes('streak') || text.includes('heatmap')) {
          console.log('FOUND API:', url);
          console.log(text.substring(0, 500));
        }
      } catch (e) {}
    }
  });

  await page.goto('https://codolio.com/profile/dhruvii', { waitUntil: 'networkidle2' });
  await browser.close();
})();
