import { getGamification, updateGamificationXP } from '../gamification.repository';
import * as config from '../config';

jest.mock('../config', () => ({
  executeQuery: jest.fn(),
}));

describe('Gamification Repository', () => {
  const mockExecuteQuery = config.executeQuery as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGamification', () => {
    it('should return default values if no data exists', async () => {
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      const result = await getGamification('user1');

      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT user_id, xp, user_level'),
        { userId: 'user1' }
      );

      expect(result).toEqual({
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        companion: null,
        lastActivityDate: null,
        totalTasksCompleted: 0,
      });
    });

    it('should return existing gamification data properly parsed', async () => {
      const mockDate = new Date();
      mockExecuteQuery.mockResolvedValue({
        rows: [{
          xp: 150,
          level: 2,
          currentStreak: 3,
          longestStreak: 5,
          companion_type: 'cat',
          companion_created_at: mockDate,
          lastActivityDate: mockDate,
          totalTasksCompleted: 10
        }]
      });

      const result = await getGamification('user1');

      expect(result).toEqual({
        xp: 150,
        level: 2,
        currentStreak: 3,
        longestStreak: 5,
        companion: {
          type: 'cat',
          createdAt: mockDate
        },
        lastActivityDate: mockDate,
        totalTasksCompleted: 10,
      });
    });
  });

  describe('updateGamificationXP', () => {
    it('should insert a new record if one does not exist', async () => {
      // First call is checking existence
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });
      // Second call is insert
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

      await updateGamificationXP('user1', 50);

      expect(mockExecuteQuery).toHaveBeenCalledTimes(2);
      const args = mockExecuteQuery.mock.calls[1];
      expect(args[0]).toContain('INSERT INTO psk_ebg_gamification');
      expect(args[1]).toEqual({ userId: 'user1', xp: 50 });
    });

    it('should update an existing record calculating new level appropriately', async () => {
      // First call check existence, user has 60 xp
      mockExecuteQuery.mockResolvedValueOnce({ rows: [{ xp: 60, user_level: 1 }] });
      // Second call is update
      mockExecuteQuery.mockResolvedValueOnce({ rows: [] });

      // Adding 50 XP -> total 110 XP -> level 2
      await updateGamificationXP('user1', 50);

      const args = mockExecuteQuery.mock.calls[1];
      expect(args[0]).toContain('UPDATE psk_ebg_gamification SET xp = :xp, user_level = :userLevel');
      expect(args[1]).toEqual({ userId: 'user1', xp: 110, userLevel: 2 });
    });
  });
});
