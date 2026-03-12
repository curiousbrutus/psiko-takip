import { createJournalEntry, getJournalEntries } from '../journal.repository';
import * as config from '../config';

// Mock the config module
jest.mock('../config', () => ({
  executeQuery: jest.fn(),
  generateId: jest.fn(),
}));

describe('Journal Repository', () => {
  const mockExecuteQuery = config.executeQuery as jest.Mock;
  const mockGenerateId = config.generateId as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createJournalEntry', () => {
    it('should create a journal entry with all fields', async () => {
      const mockId = 'JRN_1';
      mockGenerateId.mockReturnValue(mockId);
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      const result = await createJournalEntry('user1', 'My thoughts', 'Daily reflection', true);

      expect(mockGenerateId).toHaveBeenCalledWith('JRN');
      const args = mockExecuteQuery.mock.calls[0];
      expect(args[0]).toContain('INSERT INTO psk_ebg_journal_entries');
      expect(args[1]).toEqual({
        entryId: mockId,
        userId: 'user1',
        content: 'My thoughts',
        prompt: 'Daily reflection',
        isShared: 1
      });
      expect(result).toBe(mockId);
    });

    it('should default isShared to 0 if not provided', async () => {
      mockGenerateId.mockReturnValue('JRN_2');
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      await createJournalEntry('user1', 'Private thoughts');

      const args = mockExecuteQuery.mock.calls[0];
      expect(args[1].isShared).toBe(0);
      expect(args[1].prompt).toBe(null);
    });
  });

  describe('getJournalEntries', () => {
    it('should retrieve entries with all optional filters applied', async () => {
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      await getJournalEntries('user1', 'prompt1', '2026-01-01', true);

      const args = mockExecuteQuery.mock.calls[0];
      expect(args[0]).toContain('AND prompt = :prompt');
      expect(args[0]).toContain("AND created_at >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')");
      expect(args[0]).toContain('AND is_shared = 1');
      expect(args[1]).toEqual({ userId: 'user1', prompt: 'prompt1', startDate: '2026-01-01' });
    });

    it('should only query by userId if no filters are provided', async () => {
      mockExecuteQuery.mockResolvedValue({ rows: [] });

      await getJournalEntries('user1');

      const args = mockExecuteQuery.mock.calls[0];
      expect(args[0]).not.toContain('AND prompt = :prompt');
      expect(args[0]).not.toContain('AND created_at >= TO_TIMESTAMP');
      expect(args[0]).not.toContain('AND is_shared = 1');
      expect(args[1]).toEqual({ userId: 'user1' });
    });
  });
});
