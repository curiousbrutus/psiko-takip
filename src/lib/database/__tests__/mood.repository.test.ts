import { createMoodEntry, getMoodEntries } from '../mood.repository';
import * as config from '../config';

// Mock the config module
jest.mock('../config', () => ({
  executeQuery: jest.fn(),
  generateId: jest.fn(),
}));

describe('Mood Repository', () => {
  const mockExecuteQuery = config.executeQuery as jest.Mock;
  const mockGenerateId = config.generateId as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMoodEntry', () => {
    it('should create a mood entry and return the generated ID', async () => {
      const mockId = 'MOD_123';
      mockGenerateId.mockReturnValue(mockId);
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      const result = await createMoodEntry('user1', 'Happy', 'morning', 'Feeling good');

      expect(mockGenerateId).toHaveBeenCalledWith('MOD');
      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
      
      const args = mockExecuteQuery.mock.calls[0];
      expect(args[0]).toContain('INSERT INTO psk_ebg_mood_entries');
      expect(args[1]).toEqual({
        entryId: mockId,
        userId: 'user1',
        mood: 'Happy',
        period: 'morning',
        notes: 'Feeling good'
      });
      expect(args[2]).toEqual({ autoCommit: true });

      expect(result).toBe(mockId);
    });

    it('should handle missing optional parameters', async () => {
      const mockId = 'MOD_124';
      mockGenerateId.mockReturnValue(mockId);
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      const result = await createMoodEntry('user2', 'Sad');

      const args = mockExecuteQuery.mock.calls[0];
      expect(args[1]).toEqual({
        entryId: mockId,
        userId: 'user2',
        mood: 'Sad',
        period: null,
        notes: null
      });

      expect(result).toBe(mockId);
    });
  });

  describe('getMoodEntries', () => {
    it('should retrieve mood entries for a user', async () => {
      const mockRows = [
        { entryId: '1', userId: 'user1', mood: 'Happy', period: 'morning', notes: null, createdAt: new Date() }
      ];
      mockExecuteQuery.mockResolvedValue({ rows: mockRows });

      const result = await getMoodEntries('user1');

      expect(mockExecuteQuery).toHaveBeenCalledTimes(1);
      const args = mockExecuteQuery.mock.calls[0];
      expect(args[0]).toContain('SELECT entry_id as "entryId"');
      expect(args[0]).toContain('FROM psk_ebg_mood_entries WHERE user_id = :userId');
      expect(args[1]).toEqual({ userId: 'user1' });
      
      expect(result).toEqual(mockRows);
    });

    it('should apply startDate filter if provided', async () => {
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      const result = await getMoodEntries('user1', '2026-01-01');

      const args = mockExecuteQuery.mock.calls[0];
      expect(args[0]).toContain("created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')");
      expect(args[1]).toEqual({ userId: 'user1', startDate: '2026-01-01' });
      
      expect(result).toEqual([]);
    });

    it('should return empty array if no rows are found', async () => {
      mockExecuteQuery.mockResolvedValue({ rows: undefined });

      const result = await getMoodEntries('user1');

      expect(result).toEqual([]);
    });
  });
});
