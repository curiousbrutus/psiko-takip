import {
  apiGetAssessmentTasks,
  apiGetCollaborativeTasks,
} from '@/lib/api-client';

export async function getAssignedTasks(): Promise<{
  success: boolean;
  data?: Record<string, any>[];
  error?: string;
}> {
  try {
    const [assessmentResult, collaborativeResult] = await Promise.all([
      apiGetAssessmentTasks(),
      apiGetCollaborativeTasks(),
    ]);

    const tasks: Record<string, any>[] = [];

    if (collaborativeResult.success && collaborativeResult.data) {
      tasks.push(
        ...collaborativeResult.data.map((doc: any) => ({
          ...doc,
          type: 'collaborative',
        }))
      );
    }

    if (assessmentResult.success && assessmentResult.data) {
      tasks.push(
        ...assessmentResult.data.map((doc: any) => ({
          ...doc,
          type: 'assessment',
        }))
      );
    }

    // Sort by assignedAt descending
    tasks.sort((a, b) => {
      const dateA = new Date(a.assignedAt).getTime();
      const dateB = new Date(b.assignedAt).getTime();
      return dateB - dateA;
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return {
      success: false,
      error: 'Atanmış görevler alınırken bir hata oluştu.',
    };
  }
}
