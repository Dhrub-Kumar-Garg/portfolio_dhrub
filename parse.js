const data = require('./codolio-data.json');
const profiles = data.data.platformProfiles.platformProfiles;

let qSolved = 0, activeDays = 0, submissions = 0, maxStreak = 0, currentStreak = 0, contests = 0;
let rating = 0;
let dsa = { total: 0, easy: 0, medium: 0, hard: 0 };
let platforms = {};

profiles.forEach(p => {
  if (p.platform) platforms[p.platform] = 0;
  
  if (p.userStats) {
    if (p.userStats.currentRating && p.userStats.currentRating > rating) rating = p.userStats.currentRating;
  }
  
  if (p.questionStats) {
    qSolved += p.questionStats.totalQuestions || 0;
    dsa.total += p.questionStats.totalQuestions || 0;
    dsa.easy += p.questionStats.easyQuestions || 0;
    dsa.medium += p.questionStats.mediumQuestions || 0;
    dsa.hard += p.questionStats.hardQuestions || 0;
  }
  
  if (p.contestActivityStats && p.contestActivityStats.contestActivityList) {
    const cc = p.contestActivityStats.contestActivityList.length;
    contests += cc;
    platforms[p.platform] = cc;
  }
  
  if (p.dailyActivityStatsResponse && p.dailyActivityStatsResponse.submissionCalendar) {
    // we won't compute activeDays, submissions, streaks here, we will check the object
  }
});

console.log({ qSolved, rating, dsa, contests, platforms });
