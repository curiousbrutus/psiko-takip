export type AssessmentType =
  | 'beck-depression-inventory'
  | 'burnout-inventory'
  | 'gad-7'
  | 'phq-9'
  | string;

export interface AssessmentTask {
  taskId: string;
  userId: string;
  assignedBy: string;
  testType: AssessmentType;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'completed' | 'overdue';
  assignedAt?: string;
  completedAt?: string;
}

export interface AssessmentResult {
  resultId: string;
  taskId: string;
  userId: string;
  testType: AssessmentType;
  score: number;
  interpretation?: string;
  recommendations?: string;
  createdAt?: string;
}
