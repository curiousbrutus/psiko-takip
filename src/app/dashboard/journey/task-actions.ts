'use server';

import { db, auth } from '@/lib/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  DocumentData,
  collectionGroup,
} from 'firebase/firestore';

export async function getAssignedTasks(): Promise<{
  success: boolean;
  data?: DocumentData[];
  error?: string;
}> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'Giriş yapmalısınız.' };
  }

  try {
    const tasksQuery = query(
      collection(db, 'collaborativeTasks'),
      where('clientId', '==', user.uid),
      where('status', '==', 'assigned')
    );
    const assessmentsQuery = query(
      collection(db, 'assessmentTasks'),
      where('clientId', '==', user.uid),
      where('status', '==', 'assigned')
    );

    const [tasksSnapshot, assessmentsSnapshot] = await Promise.all([
      getDocs(tasksQuery),
      getDocs(assessmentsQuery),
    ]);

    const tasks = tasksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'collaborative',
    }));
    const assessments = assessmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      type: 'assessment',
    }));

    const allTasks = [...tasks, ...assessments];
    allTasks.sort((a, b) => b.assignedAt.toDate() - a.assignedAt.toDate());

    return { success: true, data: allTasks };
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return {
      success: false,
      error: 'Atanmış görevler alınırken bir hata oluştu.',
    };
  }
}
