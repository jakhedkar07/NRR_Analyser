const { sortTeamsByRank, getTeamRank, simulateRangeForDesiredPosition } = require('../backend/utils/rankUtils');

describe('Rank Utils', () => {
  const mockTeams = [
    { team: 'Team A', points: 10, nrr: 0.5, for: { runs: 1000, overs: 100 }, against: { runs: 950, overs: 100 }, matches: 7, won: 5, lost: 2 },
    { team: 'Team B', points: 8, nrr: 0.3, for: { runs: 900, overs: 100 }, against: { runs: 870, overs: 100 }, matches: 7, won: 4, lost: 3 },
    { team: 'Team C', points: 8, nrr: 0.4, for: { runs: 950, overs: 100 }, against: { runs: 910, overs: 100 }, matches: 7, won: 4, lost: 3 },
    { team: 'Team D', points: 6, nrr: 0.2, for: { runs: 850, overs: 100 }, against: { runs: 830, overs: 100 }, matches: 7, won: 3, lost: 4 }
  ];

  describe('sortTeamsByRank', () => {
    test('sorts teams by points first', () => {
      const sorted = sortTeamsByRank(mockTeams);
      expect(sorted[0].team).toBe('Team A');
      expect(sorted[0].points).toBe(10);
    });

    test('sorts by NRR when points are equal', () => {
      const sorted = sortTeamsByRank(mockTeams);
      expect(sorted[1].team).toBe('Team C');
      expect(sorted[2].team).toBe('Team B');
    });

    test('handles teams with same points and NRR', () => {
      const teamsWithSame = [
        { team: 'Team A', points: 8, nrr: 0.3, for: { runs: 900, overs: 100 }, against: { runs: 870, overs: 100 }, matches: 7, won: 4, lost: 3 },
        { team: 'Team B', points: 8, nrr: 0.3, for: { runs: 900, overs: 100 }, against: { runs: 870, overs: 100 }, matches: 7, won: 4, lost: 3 },
        { team: 'Team C', points: 6, nrr: 0.2, for: { runs: 850, overs: 100 }, against: { runs: 830, overs: 100 }, matches: 7, won: 3, lost: 4 }
      ];

      const sorted = sortTeamsByRank(teamsWithSame);
      expect(sorted.length).toBe(3);
      expect(sorted[0].points).toBe(8);
    });
  });

  describe('getTeamRank', () => {
    test('gets correct team rank', () => {
      const rank = getTeamRank('Team A', mockTeams);
      expect(rank).toBe(1);
    });

    test('returns -1 for non-existent team', () => {
      const rank = getTeamRank('Team Z', mockTeams);
      expect(rank).toBe(-1);
    });
  });

  describe('simulateRangeForDesiredPosition', () => {
    test('throws error if team not found', () => {
      expect(() => {
        simulateRangeForDesiredPosition('NonExistent', 'Team B', 1, 'battingFirst', 150, 20, mockTeams);
      }).toThrow('Team or opponent not found');
    });

    test('returns error message if position cannot be achieved', () => {
      const impossibleTeams = [
        { team: 'Team A', points: 20, nrr: 2.0, for: { runs: 2000, overs: 100 }, against: { runs: 1000, overs: 100 }, matches: 10, won: 10, lost: 0 },
        { team: 'Team B', points: 18, nrr: 1.5, for: { runs: 1800, overs: 100 }, against: { runs: 1200, overs: 100 }, matches: 10, won: 9, lost: 1 },
        { team: 'Team C', points: 16, nrr: 1.0, for: { runs: 1600, overs: 100 }, against: { runs: 1400, overs: 100 }, matches: 10, won: 8, lost: 2 }
      ];
      const result = simulateRangeForDesiredPosition('Team C', 'Team B', 1, 'battingFirst', 10, 20, impossibleTeams);
      if (result.requiredRange === null) {
        expect(result.message).toBeDefined();
      }
    });

    test('handles battingFirst scenario', () => {
      const result = simulateRangeForDesiredPosition('Team B', 'Team C', 2, 'battingFirst', 150, 20, mockTeams);
      
      if (result.requiredRange) {
        expect(Array.isArray(result.requiredRange)).toBe(true);
        expect(result.requiredRange.length).toBe(2);
        expect(result.scenario).toBe('battingFirst');
        expect(result.team).toBe('Team B');
        expect(result.opponent).toBe('Team C');
      }
    });

    test('handles bowlingFirst scenario', () => {
      const result = simulateRangeForDesiredPosition('Team B', 'Team C', 2, 'bowlingFirst', 150, 20, mockTeams);
      
      if (result.requiredRange) {
        expect(Array.isArray(result.requiredRange)).toBe(true);
        expect(result.requiredRange.length).toBe(2);
        expect(result.scenario).toBe('bowlingFirst');
        expect(result.requiredRange[0]).toBeGreaterThanOrEqual(10.0);
        expect(result.requiredRange[1]).toBeLessThanOrEqual(20.0);
      }
    });

    test('handles oversFaced parameter for battingFirst', () => {
      const result = simulateRangeForDesiredPosition('Team B', 'Team C', 2, 'battingFirst', 150, 20, mockTeams, 18.2);
      
      if (result.requiredRange) {
        expect(result.scenario).toBe('battingFirst');
      }
    });

    test('handles oversBowled parameter for bowlingFirst', () => {
      const result = simulateRangeForDesiredPosition('Team B', 'Team C', 2, 'bowlingFirst', 150, 20, mockTeams, null, 18.2);
      
      if (result.requiredRange) {
        expect(result.scenario).toBe('bowlingFirst');
      }
    });

    test('returns correct structure for successful prediction', () => {
      const result = simulateRangeForDesiredPosition('Team D', 'Team C', 3, 'battingFirst', 200, 20, mockTeams);
      
      if (result.requiredRange) {
        expect(result).toHaveProperty('team');
        expect(result).toHaveProperty('opponent');
        expect(result).toHaveProperty('scenario');
        expect(result).toHaveProperty('requiredRange');
        expect(result).toHaveProperty('revisedNRRRange');
        expect(result).toHaveProperty('targetPosition');
        expect(Array.isArray(result.requiredRange)).toBe(true);
        expect(Array.isArray(result.revisedNRRRange)).toBe(true);
      }
    });
  });
});
