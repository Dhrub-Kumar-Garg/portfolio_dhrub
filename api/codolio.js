export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Set 24-hour cache (Vercel CDN)
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  try {
    // In a full production implementation, this would fetch from Upstash/Vercel KV 
    // populated by a headless Puppeteer cron job.
    // For now, we return the fallback values you provided to ensure the portfolio
    // always renders reliably.
    
    // Simulating API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const stats = {
      questionsSolved: 197,
      activeDays: 120,
      maxStreak: 14,
      currentStreak: 3,
      lastSynced: new Date().toISOString()
    };

    return res.status(200).json(stats);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch Codolio metrics' });
  }
}
