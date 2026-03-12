export interface TestScore {
    total: number;
    subScores?: Record<string, number>;
}
export interface TestSubmission {
    submissionId: string;
    userId: string;
    testName: string;
    answers: Record<string, number | string>;
    score: TestScore;
    submittedAt: string;
}
