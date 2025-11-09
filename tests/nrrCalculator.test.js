const { calculateNRR, simulatePostMatchStats, convertOversToBalls, convertBallsToOvers } = require('../backend/utils/nrrCalculator');

describe('NRR Calculator', () => {
  describe('convertOversToBalls', () => {
    test('converts overs to balls correctly', () => {
      expect(convertOversToBalls(18.2)).toBe(110);
      expect(convertOversToBalls(20.0)).toBe(120);
      expect(convertOversToBalls(10.5)).toBe(65);
    });
  });

  describe('convertBallsToOvers', () => {
    test('converts balls to overs correctly', () => {
      expect(convertBallsToOvers(110)).toBe(18.2);
      expect(convertBallsToOvers(120)).toBe(20.0);
      expect(convertBallsToOvers(65)).toBe(10.5);
    });
  });

  describe('calculateNRR', () => {
    test('calculates NRR correctly', () => {
      const nrr = calculateNRR(1000, 100.0, 950, 100.0);
      expect(nrr).toBeCloseTo(0.5, 2);
    });

    test('handles zero overs', () => {
      const nrr = calculateNRR(0, 0, 0, 0);
      expect(nrr).toBe(0);
    });

    test('calculates negative NRR', () => {
      const nrr = calculateNRR(900, 100.0, 1000, 100.0);
      expect(nrr).toBeCloseTo(-1.0, 2);
    });

    test('calculates NRR with decimal overs', () => {
      const nrr = calculateNRR(150, 18.2, 120, 20.0);
      expect(nrr).toBeGreaterThan(0);
    });
  });

  describe('simulatePostMatchStats', () => {
    test('updates team stats after match correctly', () => {
      const teamStats = {
        matches: 7,
        won: 3,
        lost: 4,
        points: 6,
        for: { runs: 1000, overs: 100.0 },
        against: { runs: 950, overs: 100.0 }
      };

      const updated = simulatePostMatchStats(teamStats, 150, 20, 120, 20);

      expect(updated.matches).toBe(7);
      expect(updated.won).toBe(4);
      expect(updated.points).toBe(8);
      expect(updated.for.runs).toBe(1150);
      expect(updated.against.runs).toBe(1070);
    });

    test('updates stats correctly when team loses', () => {
      const teamStats = {
        matches: 7,
        won: 3,
        lost: 4,
        points: 6,
        for: { runs: 1000, overs: 100.0 },
        against: { runs: 950, overs: 100.0 }
      };

      const updated = simulatePostMatchStats(teamStats, 120, 20, 150, 20);

      expect(updated.matches).toBe(7);
      expect(updated.lost).toBe(5);
      expect(updated.points).toBe(6);
    });

    test('handles tie correctly', () => {
      const teamStats = {
        matches: 7,
        won: 3,
        lost: 4,
        points: 6,
        for: { runs: 1000, overs: 100.0 },
        against: { runs: 950, overs: 100.0 }
      };

      const updated = simulatePostMatchStats(teamStats, 150, 20, 150, 20);

      expect(updated.matches).toBe(7);
      expect(updated.points).toBe(6);
    });

    test('updates overs correctly with decimal values', () => {
      const teamStats = {
        matches: 7,
        won: 3,
        lost: 4,
        points: 6,
        for: { runs: 1000, overs: 100.0 },
        against: { runs: 950, overs: 100.0 }
      };

      const updated = simulatePostMatchStats(teamStats, 150, 18.2, 120, 20.0);

      expect(updated.for.overs).toBeCloseTo(118.2, 1);
      expect(updated.against.overs).toBe(120.0);
    });
  });
});
