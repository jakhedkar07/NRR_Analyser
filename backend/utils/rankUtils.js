const { simulatePostMatchStats, calculateNRR } = require('./nrrCalculator');

function sortTeamsByRank(teams) {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) {
      return b.points - a.points;
    }
    return b.nrr - a.nrr;
  });
}

function getTeamRank(teamName, teams) {
  const sorted = sortTeamsByRank(teams);
  const index = sorted.findIndex(t => t.team === teamName);
  return index >= 0 ? index + 1 : -1;
}

function simulateRangeForDesiredPosition(
  teamName,
  opponentName,
  desiredPosition,
  scenario,
  runsScored,
  totalOvers,
  currentTable,
  oversFaced = null,
  oversBowled = null
) {
  const team = currentTable.find(t => t.team === teamName);
  const opponent = currentTable.find(t => t.team === opponentName);

  if (!team || !opponent) {
    throw new Error('Team or opponent not found');
  }

  const isBattingFirst = scenario === 'battingFirst';
  const requiredRange = [];
  const revisedNRRRange = [];

  if (isBattingFirst) {
    const teamRuns = runsScored;
    const teamOvers = oversFaced !== null && oversFaced !== undefined ? oversFaced : totalOvers;

    const minRuns = 0;
    const maxRuns = teamRuns + 10;

    for (let oppRuns = minRuns; oppRuns <= maxRuns; oppRuns++) {
      const postMatchTeam = simulatePostMatchStats(
        team,
        teamRuns,
        teamOvers,
        oppRuns,
        totalOvers
      );

      const postMatchOpponent = simulatePostMatchStats(
        opponent,
        oppRuns,
        totalOvers,
        teamRuns,
        teamOvers
      );

      const tempTable = currentTable.map(t => {
        if (t.team === teamName) return postMatchTeam;
        if (t.team === opponentName) return postMatchOpponent;
        return t;
      });

      const rank = getTeamRank(teamName, tempTable);
      if (rank === desiredPosition) {
        requiredRange.push(oppRuns);
        revisedNRRRange.push(postMatchTeam.nrr);
      }
    }
  } else {
    const oppRuns = runsScored;
    const oppOvers = oversBowled !== null && oversBowled !== undefined ? oversBowled : totalOvers;
    const target = oppRuns + 1;

    const minBalls = 60;
    const maxBalls = Math.floor(totalOvers) * 6 + Math.round((totalOvers - Math.floor(totalOvers)) * 10);

    for (let ballsUsed = minBalls; ballsUsed <= maxBalls; ballsUsed++) {
      const wholeOvers = Math.floor(ballsUsed / 6);
      const remainingBalls = ballsUsed % 6;
      const oversUsed = parseFloat((wholeOvers + remainingBalls / 10).toFixed(1));

      const postMatchTeam = simulatePostMatchStats(
        team,
        target,
        oversUsed,
        oppRuns,
        oppOvers
      );

      const postMatchOpponent = simulatePostMatchStats(
        opponent,
        oppRuns,
        oppOvers,
        target,
        oversUsed
      );

      const tempTable = currentTable.map(t => {
        if (t.team === teamName) return postMatchTeam;
        if (t.team === opponentName) return postMatchOpponent;
        return t;
      });

      const rank = getTeamRank(teamName, tempTable);
      if (rank === desiredPosition) {
        requiredRange.push(oversUsed);
        revisedNRRRange.push(postMatchTeam.nrr);
      }
    }
  }

  if (requiredRange.length === 0) {
    return {
      team: teamName,
      opponent: opponentName,
      scenario: scenario,
      requiredRange: null,
      revisedNRRRange: null,
      targetPosition: desiredPosition,
      message: `Cannot achieve position ${desiredPosition} with given constraints`
    };
  }

  const minVal = Math.min(...requiredRange);
  const maxVal = Math.max(...requiredRange);
  const minNRR = Math.min(...revisedNRRRange);
  const maxNRR = Math.max(...revisedNRRRange);

  return {
    team: teamName,
    opponent: opponentName,
    scenario: scenario,
    requiredRange: [minVal, maxVal],
    revisedNRRRange: [parseFloat(minNRR.toFixed(3)), parseFloat(maxNRR.toFixed(3))],
    targetPosition: desiredPosition
  };
}

module.exports = {
  sortTeamsByRank,
  getTeamRank,
  simulateRangeForDesiredPosition
};
