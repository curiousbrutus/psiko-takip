export interface JournalEntry {
  journalEntryId: string;
  userId: string;
  title?: string;
  content: string;
  isSharedWithTherapist: boolean;
  moodTags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
