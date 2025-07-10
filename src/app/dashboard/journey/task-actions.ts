
'use server';

import { db, auth } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, DocumentData } from 'firebase/firestore';

export async function getAssignedTasks(): Promise<{ success: boolean; data?: DocumentData[]; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "Giriş yapmalısınız." };
  }

  try {
    const q = query(
      collection(db, "collaborativeTasks"), 
      where("clientId", "==", user.uid),
      where("status", "==", "assigned"),
      orderBy("assignedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: tasks };
  } catch (error) {
    console.error("Error fetching assigned tasks:", error);
    return { success: false, error: "Atanmış görevler alınırken bir hata oluştu." };
  }
}

    