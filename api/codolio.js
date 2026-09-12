export default async function handler(req, res) {
  // CORS setup
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

  // 24 hour caching on CDN
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  try {
    const response = await fetch('https://api.codolio.com/profile?userKey=dhruvii', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://codolio.com/'
      }
    });
    if (!response.ok) throw new Error(`Codolio API error: ${response.status}`);
    
    const codolioData = await response.json();
    if (!codolioData.status || !codolioData.status.success || !codolioData.data || !codolioData.data.platformProfiles) {
      throw new Error('Invalid Codolio response structure');
    }

    const profiles = codolioData.data.platformProfiles.platformProfiles;
    
    let questionsSolved = 0;
    let maxStreak = 0;
    let currentStreak = 0;
    let contestsAttended = 0;
    let currentRating = 0;
    
    let dsa = { total: 0, easy: 0, medium: 0, hard: 0 };
    let platforms = {};
    let calendarMap = {}; // "YYYY-MM-DD" -> count

    profiles.forEach(p => {
      const plat = p.platform;
      if (plat) platforms[plat] = 0;

      // Rating
      if (p.userStats && p.userStats.currentRating) {
        if (p.userStats.currentRating > currentRating) {
          currentRating = p.userStats.currentRating;
        }
      }

      // DSA Questions
      if (p.totalQuestionStats) {
        const qs = p.totalQuestionStats;
        const total = qs.totalQuestionCounts || 0;
        questionsSolved += total;
        dsa.total += total;
        dsa.easy += qs.easyQuestionCounts || 0;
        dsa.medium += qs.mediumQuestionCounts || 0;
        dsa.hard += qs.hardQuestionCounts || 0;
      }

      // Contests
      if (p.contestActivityStats && p.contestActivityStats.contestActivityList) {
        const cc = p.contestActivityStats.contestActivityList.length;
        contestsAttended += cc;
        platforms[plat] = cc;
      }

      // Daily Activity (Heatmap)
      if (p.dailyActivityStatsResponse && p.dailyActivityStatsResponse.submissionCalendar) {
        const cal = p.dailyActivityStatsResponse.submissionCalendar;
        for (const [timestamp, count] of Object.entries(cal)) {
          const ts = parseInt(timestamp, 10);
          if (isNaN(ts) || ts < 10000000) continue; 
          
          // Force formatting into IST (Asia/Kolkata)
          const d = new Date(ts * 1000); 
          const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
          // Returns MM/DD/YYYY in some environments, let's parse safely:
          const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD
          const dateStr = formatter.format(d); // e.g. "2026-09-12"
          
          calendarMap[dateStr] = (calendarMap[dateStr] || 0) + count;
        }
      }
    });

    // Compute Streaks and Heatmap array
    const activity = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Sort all dates in calendarMap to compute global max streak and current streak
    const allDates = Object.keys(calendarMap).sort();
    
    // Calculate Streaks
    let currentStreakCalc = 0;
    let maxStreakCalc = 0;
    let tempStreak = 0;
    let lastDate = null;

    for (let i = 0; i < allDates.length; i++) {
      const d = new Date(allDates[i]);
      if (!lastDate) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(d - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > maxStreakCalc) maxStreakCalc = tempStreak;
          tempStreak = 1;
        }
      }
      lastDate = d;
      if (tempStreak > maxStreakCalc) maxStreakCalc = tempStreak;
    }

    // Compute current streak
    let checkDate = new Date();
    const dtOptions = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
    const dtFormatter = new Intl.DateTimeFormat('en-CA', dtOptions);
    let checkDateStr = dtFormatter.format(checkDate);
    
    // if today is 0, maybe streak is just from yesterday
    if (!calendarMap[checkDateStr]) {
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = dtFormatter.format(checkDate);
    }
    
    while (calendarMap[checkDateStr]) {
      currentStreakCalc++;
      checkDate.setDate(checkDate.getDate() - 1);
      checkDateStr = dtFormatter.format(checkDate);
    }

    let totalSubmissions = 0;
    const baseDate = new Date();
    for (let i = 181; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = dtFormatter.format(d);
      
      const count = calendarMap[dateStr] || 0;
      totalSubmissions += count;
      activity.push({ date: dateStr, count });
    }
    
    const activeDays = Object.keys(calendarMap).length;
    const windowMax = Math.max(...activity.map(a => a.count));

    activity.forEach(a => {
      if (a.count === 0) a.intensity = 0;
      else if (a.count < windowMax * 0.25) a.intensity = 1;
      else if (a.count < windowMax * 0.5) a.intensity = 2;
      else if (a.count < windowMax * 0.75) a.intensity = 3;
      else a.intensity = 4;
    });

    // Some stats fallbacks if they weren't in JSON perfectly:
    // We'll trust the user's dashboard streaks over aggregated raw data if needed, 
    // but the API usually gives accurate maxStreak.
    
    const payload = {
      questionsSolved,
      activeDays,
      submissions: 0,
      maxStreak: maxStreakCalc,
      currentStreak: currentStreakCalc,
      contestsAttended,
      currentRating,
      dsa,
      platforms,
      activity,
      lastSynced: new Date().toISOString()
    };

    let allTimeSubmissions = 0;
    for (const count of Object.values(calendarMap)) {
      allTimeSubmissions += count;
    }
    payload.submissions = allTimeSubmissions;

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Codolio API Error:", error);
    return res.status(500).json({ error: 'Failed to fetch or parse Codolio metrics' });
  }
}
