function convertOversToBalls(overs) {
  const wholeOvers = Math.floor(overs);
  const balls = Math.round((overs - wholeOvers) * 10);
  return wholeOvers * 6 + balls;
}

function convertBallsToOvers(totalBalls) {
  const wholeOvers = Math.floor(totalBalls / 6);
  const remainingBalls = totalBalls % 6;
  return parseFloat((wholeOvers + remainingBalls / 10).toFixed(1));
}

function calculateNRR(runsFor, oversFor, runsAgainst, oversAgainst) {
  const ballsFaced = convertOversToBalls(oversFor);
  const ballsBowled = convertOversToBalls(oversAgainst);
  
  if (ballsFaced === 0 || ballsBowled === 0) {
    return 0;
  }

  const runRateFor = (runsFor * 6) / ballsFaced;
  const runRateAgainst = (runsAgainst * 6) / ballsBowled;
  const nrr = runRateFor - runRateAgainst;

  return parseFloat(nrr.toFixed(3));
}

function simulatePostMatchStats(currentStats, matchRunsFor, matchOversFor, matchRunsAgainst, matchOversAgainst) {
  const postMatch = JSON.parse(JSON.stringify(currentStats));
  
  postMatch.for.runs = currentStats.for.runs + matchRunsFor;
  postMatch.against.runs = currentStats.against.runs + matchRunsAgainst;
  
  const currentBallsFaced = convertOversToBalls(currentStats.for.overs);
  const matchBallsFaced = convertOversToBalls(matchOversFor);
  postMatch.for.overs = convertBallsToOvers(currentBallsFaced + matchBallsFaced);
  
  const currentBallsBowled = convertOversToBalls(currentStats.against.overs);
  const matchBallsBowled = convertOversToBalls(matchOversAgainst);
  postMatch.against.overs = convertBallsToOvers(currentBallsBowled + matchBallsBowled);
  
  postMatch.nrr = calculateNRR(
    postMatch.for.runs,
    postMatch.for.overs,
    postMatch.against.runs,
    postMatch.against.overs
  );
  
  if (matchRunsFor > matchRunsAgainst) {
    postMatch.points = currentStats.points + 2;
    postMatch.won = currentStats.won + 1;
  } else if (matchRunsFor < matchRunsAgainst) {
    postMatch.points = currentStats.points;
    postMatch.lost = currentStats.lost + 1;
  } else {
    postMatch.points = currentStats.points;
  }
  
  return postMatch;
}

module.exports = {
  convertOversToBalls,
  convertBallsToOvers,
  calculateNRR,
  simulatePostMatchStats
};
